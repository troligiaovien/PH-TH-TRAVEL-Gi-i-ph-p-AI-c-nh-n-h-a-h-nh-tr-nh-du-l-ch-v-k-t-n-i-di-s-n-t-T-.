import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { VERIFIED_LOCATIONS, VERIFIED_ROUTES } from './src/data/plannerKnowledge.js';
import type { TripRequestForm, AIItineraryPlan, PlannerChatMessage } from './src/types/planner.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory pool of Gemini API keys configured by Admin and environment
let geminiKeysPool: string[] = [];
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
  geminiKeysPool.push(process.env.GEMINI_API_KEY.trim());
}
let currentActiveKeyIndex = 0;

const aiClientCache = new Map<string, GoogleGenAI>();

function getGenAIClient(key: string): GoogleGenAI {
  let client = aiClientCache.get(key);
  if (!client) {
    client = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    aiClientCache.set(key, client);
  }
  return client;
}

function maskKey(key: string): string {
  if (!key || key.length <= 8) return '***';
  return key.slice(0, 7) + '...' + key.slice(-4);
}

/**
 * Execute Gemini operations with automated key failover & rotation
 * When an API key hits rate limits or token exhaustion, immediately rotates to the next key.
 */
async function callGeminiWithKeyRotation<T>(
  fn: (aiClient: GoogleGenAI, key: string, index: number) => Promise<T>,
  requestProvidedKeys: string[] = []
): Promise<T> {
  const combinedKeys = Array.from(
    new Set([...requestProvidedKeys, ...geminiKeysPool, process.env.GEMINI_API_KEY])
  ).filter((k): k is string => Boolean(k && k.trim().length > 10));

  if (combinedKeys.length === 0) {
    throw new Error('Chưa có Gemini API Key nào được cấu hình trong hệ thống! Vui lòng vào trang Admin để nhập API Key.');
  }

  const total = combinedKeys.length;
  let lastError: any = null;

  for (let attempt = 0; attempt < total; attempt++) {
    const keyIdx = (currentActiveKeyIndex + attempt) % total;
    const candidateKey = combinedKeys[keyIdx];
    const masked = maskKey(candidateKey);

    try {
      const client = getGenAIClient(candidateKey);
      const res = await fn(client, candidateKey, keyIdx);
      // Succeeded: keep pointer at this active key for maximum performance on next requests
      currentActiveKeyIndex = keyIdx;
      return res;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini Failover] Key #${keyIdx + 1} (${masked}) gặp lỗi: ${errMsg}. ${attempt < total - 1 ? 'Tự động đảo sang API Key tiếp theo...' : 'Đã thử qua toàn bộ danh sách API Keys.'}`);
    }
  }

  throw new Error(`Toàn bộ ${total} Gemini API Key đều hết hạn ngạch Token hoặc bị lỗi: ${lastError?.message || lastError}`);
}

// Admin API endpoints for Gemini API Key management
app.post('/api/admin/gemini-keys', (req, res) => {
  const { keys } = req.body;
  if (Array.isArray(keys)) {
    const cleanKeys = keys.map((k: string) => String(k).trim()).filter((k: string) => k.length > 10);
    geminiKeysPool = Array.from(new Set(cleanKeys));
    currentActiveKeyIndex = 0;
    console.log(`[Gemini Pool] Đã nạp ${geminiKeysPool.length} API Keys từ Admin.`);
    return res.json({ success: true, count: geminiKeysPool.length });
  }
  return res.status(400).json({ error: 'Invalid keys array' });
});

app.get('/api/admin/gemini-keys/status', (_req, res) => {
  return res.json({
    count: geminiKeysPool.length,
    activeIndex: currentActiveKeyIndex,
    maskedKeys: geminiKeysPool.map(maskKey),
    hasEnvKey: !!process.env.GEMINI_API_KEY
  });
});

app.post('/api/admin/gemini-keys/test', async (req, res) => {
  const { keys } = req.body;
  const testKeys: string[] = Array.isArray(keys) && keys.length > 0 ? keys : geminiKeysPool;

  if (testKeys.length === 0) {
    return res.json({ success: true, results: [] });
  }

  const results = [];
  for (let i = 0; i < testKeys.length; i++) {
    const key = testKeys[i].trim();
    if (!key) continue;
    const masked = maskKey(key);
    try {
      const client = getGenAIClient(key);
      await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Hi',
        config: { maxOutputTokens: 2 }
      });
      results.push({
        index: i + 1,
        masked,
        status: 'active',
        message: 'Hoạt động tốt! Token và hạn ngạch hợp lệ.'
      });
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('Quota');
      results.push({
        index: i + 1,
        masked,
        status: isQuota ? 'exhausted' : 'error',
        message: isQuota ? 'Đã hết hạn ngạch Token (429 Quota Exceeded)' : errMsg
      });
    }
  }

  return res.json({ success: true, results });
});

// Build ground-truth context prompt for Gemini
function buildKnowledgePrompt(): string {
  const locs = VERIFIED_LOCATIONS.map((loc) => {
    return `- ${loc.name} (${loc.id}):
  Địa chỉ: ${loc.address} (${loc.district})
  Tọa độ: ${loc.lat}, ${loc.lng}
  Giờ mở cửa: ${loc.openHours}
  Vé: ${loc.ticketPriceVND === 'free' ? 'Miễn phí vé vào cổng' : `${loc.ticketPriceVND.toLocaleString('vi-VN')} VNĐ`} (${loc.ticketNote})
  Thời lượng khuyến nghị: ${loc.recommendedDurationMinutes} phút
  Cường độ: ${loc.physicalDemand} | Thích hợp trẻ em: ${loc.suitableForKids} | Thích hợp người già: ${loc.suitableForSeniors}
  Khung giờ đẹp nhất: ${loc.bestTimeOfDay}
  Món ngon lân cận: ${loc.diningNearby.map((d) => `${d.name} (${d.specialty} - ${d.priceRangeVND})`).join('; ')}
  Lưu trú gần đó: ${loc.lodgingNearby.map((l) => `${l.name} (${l.type} - ${l.priceRangeVND})`).join('; ')}`;
  }).join('\n\n');

  const routes = VERIFIED_ROUTES.map(
    (r) => `- Chặng ${r.fromId} -> ${r.toId}: ${r.distanceKm}km (~${r.durationMinutes} phút). Lộ trình: ${r.routeRoads}. Tình trạng: ${r.roadCondition}`
  ).join('\n');

  return `### CƠ SỞ DỮ LIỆU ĐỊA ĐIỂM ĐÃ ĐƯỢC XÁC THỰC CỦA TỈNH PHÚ THỌ:
${locs}

### MA TRẬN KHOẢNG CÁCH VÀ THỜI GIAN DI CHUYỂN THỰC TẾ:
${routes}`;
}

const SYSTEM_INSTRUCTION = `Bạn là PHU THO AI TRAVEL PLANNER - Chuyên gia kiến tạo hành trình du lịch thông minh, chuẩn xác và tối ưu cho tỉnh Phú Thọ.
Nhiệm vụ của bạn là lập kế hoạch du lịch chi tiết, khả thi 100% dựa DUY NHẤT trên các địa điểm và tuyến đường đã được kiểm chứng.

QUY TẮC BẮT BUỘC:
1. KHÔNG ảo giác, KHÔNG bịa đặt địa điểm hay giá cả. Chỉ sử dụng 5 địa danh kiểm chứng: Đền Hùng (den-hung), Đồi chè Long Cốc (doi-che-long-coc), Vườn quốc gia Xuân Sơn (vuon-quoc-gia-xuan-son), Suối khoáng nóng Thanh Thủy (suoi-khoang-nong-thanh-thuy), Làng cổ Hùng Lô (lang-co-hung-lo).
2. Thời gian di chuyển giữa các điểm phải tuân theo ma trận tuyến đường thực tế (CT05, QL32, ĐT317, ĐT315). Không đưa ra thời gian phi lý.
3. Luôn kiểm tra tính phù hợp với nhóm du khách:
   - Nếu có người già: Ưu tiên Đền Hùng (đi xe điện), Thanh Thủy (tắm khoáng Onsen), Làng cổ Hùng Lô (nghe hát Xoan, thăm nhà cổ nhẹ nhàng). Tránh trekking gồ ghề ở Xuân Sơn.
   - Nếu có trẻ em: Ưu tiên đồi chè Long Cốc, Suối khoáng Thanh Thủy, Bảo tàng Hùng Vương.
4. Bảng dự toán ngân sách (VND) phải sát thực tế gồm 5 khoản: Vận chuyển, Lưu trú, Ăn uống, Vé/Trải nghiệm, Dự phòng.
5. Luôn trả về định dạng JSON hợp lệ tuân thủ cấu trúc AIItineraryPlan, không bọc markdown hay text thừa bên ngoài.`;

// API: Generate Itinerary
app.post('/api/planner/generate', async (req, res) => {
  try {
    const requestForm: TripRequestForm = req.body;
    if (!requestForm) {
      return res.status(400).json({ error: 'Missing request body' });
    }

    const knowledgePrompt = buildKnowledgePrompt();
    const prompt = `YÊU CẦU CỦA NGƯỜI DÙNG:
- Mô tả tự nhiên: "${requestForm.prompt || 'Chuyến đi khám phá Phú Thọ'}"
- Điểm xuất phát: ${requestForm.startLocation || 'Hà Nội'}
- Thời lượng: ${requestForm.daysCount} ngày ${requestForm.nightsCount} đêm (Khởi hành: ${requestForm.startDate || 'Cuối tuần'})
- Thành viên: Tổng ${requestForm.members.total} người (${requestForm.members.adults} người lớn, ${requestForm.members.children} trẻ em, ${requestForm.members.seniors} người già. Lưu ý đặc biệt: ${requestForm.members.specialNeeds || 'Không có'})
- Ngân sách: Phân hạng "${requestForm.budgetTier}", mức dự kiến: ${requestForm.budgetAmountVND ? requestForm.budgetAmountVND.toLocaleString('vi-VN') + ' VNĐ' : 'Linh hoạt theo phân hạng'}
- Nhịp độ chuyến đi: ${requestForm.pace} (relaxed = thư thái nghỉ ngơi, balanced = cân bằng, active = khám phá năng động)
- Sở thích: ${requestForm.interests?.join(', ') || 'Thiên nhiên, văn hóa, ẩm thực'}
- Điều muốn tránh / Không thích: ${requestForm.dislikes?.join(', ') || 'Không'}
- Điểm mong muốn ghé: ${requestForm.requiredDestinationIds?.join(', ') || 'AI đề xuất tối ưu'}

${knowledgePrompt}

Hãy tạo một kế hoạch du lịch hoàn chỉnh theo JSON schema sau:
{
  "id": "itinerary_${Date.now()}",
  "title": "Tiêu đề hành trình truyền cảm hứng",
  "tagline": "Khẩu hiệu ngắn gọn",
  "variant": "optimal",
  "variantLabel": "Lịch trình tối ưu",
  "durationLabel": "${requestForm.daysCount} Ngày ${requestForm.nightsCount} Đêm",
  "totalDays": ${requestForm.daysCount},
  "totalNights": ${requestForm.nightsCount},
  "startingPoint": "${requestForm.startLocation || 'Hà Nội'}",
  "transportation": "Ô tô tự lái / Xe du lịch gia đình",
  "feasibilityScore": 98,
  "dataConfidenceSummary": "100% dữ liệu địa điểm, chi phí và thời gian di chuyển đã được kiểm chứng từ BQL và Trung tâm Xúc tiến Du lịch Phú Thọ.",
  "days": [
    {
      "dayNumber": 1,
      "title": "Tên ngày 1",
      "theme": "Chủ đề ngày 1",
      "summary": "Tóm tắt trải nghiệm ngày 1",
      "dayBudgetVND": 1500000,
      "activities": [
        {
          "id": "act_1_1",
          "timeSlot": "07:00 - 08:30",
          "type": "transit",
          "title": "Xuất phát từ Hà Nội đi Đền Hùng",
          "locationName": "Cao tốc CT05 Nội Bài - Lào Cai",
          "destinationId": "den-hung",
          "description": "Di chuyển êm thuận qua cao tốc CT05 khoảng 82km.",
          "travelDistanceKm": 82,
          "travelDurationMinutes": 75,
          "estimatedCostVND": 120000,
          "costVerificationStatus": "verified",
          "costNote": "Phí trạm BOT cao tốc CT05 lượt đi",
          "notes": ["Nên xuất phát sớm để tránh kẹt xe và leo đền lúc trời mát"],
          "verifiedSources": ["VEC Cao tốc Nội Bài - Lào Cai"],
          "suitableFor": "Cả gia đình",
          "contingencyPlan": "Nếu đường đông, đi theo QL2 hoặc QL32",
          "latitude": 21.3644,
          "longitude": 105.3283
        }
      ]
    }
  ],
  "budget": {
    "totalEstimatedVND": 4800000,
    "costPerPersonVND": 1200000,
    "targetBudgetVND": ${requestForm.budgetAmountVND || 5000000},
    "status": "within_budget",
    "differenceVND": 200000,
    "breakdown": {
      "transportVND": 800000,
      "lodgingVND": 1600000,
      "diningVND": 1500000,
      "activitiesVND": 500000,
      "contingencyVND": 400000
    },
    "savingTips": ["Mẹo tiết kiệm chi phí..."],
    "unverifiedItems": []
  },
  "handbook": {
    "weatherNote": "Thời tiết Phú Thọ mùa này...",
    "packingList": ["Trang phục lịch sự khi viếng đền", "Đồ bơi tắm khoáng", "Giày thể thao đế mềm"],
    "culturalEtiquette": ["Giữ trật tự tôn nghiêm tại Đền Hùng", "Tôn trọng phong tục người Mường/Dao"],
    "emergencyContacts": [
      { "name": "BQL Khu di tích Đền Hùng", "phone": "0210.3860.108" },
      { "name": "Bệnh viện Đa khoa tỉnh Phú Thọ", "phone": "1800.888.989" },
      { "name": "Cứu hộ giao thông Phú Thọ", "phone": "0912.443.322" }
    ]
  },
  "aiReasoning": {
    "whySelected": "Lý do lựa chọn chuỗi điểm đến này...",
    "groupCustomization": "Điều chỉnh riêng cho người già, trẻ nhỏ...",
    "routeOptimizationLogic": "Thứ tự các chặng tránh quay đầu xe vòng vèo...",
    "dislikeAccommodations": "Đáp ứng điều kiêng kỵ của đoàn..."
  },
  "alternativePlans": [
    {
      "variant": "budget",
      "title": "Phương án Tiết Kiệm",
      "description": "Ưu tiên homestay bản địa và các điểm tham quan miễn phí vé",
      "totalCostVND": 3600000
    },
    {
      "variant": "relaxed",
      "title": "Phương án Thư Thái",
      "description": "Giảm bớt điểm dừng, tập trung nghỉ ngơi tại resort khoáng nóng",
      "totalCostVND": 5800000
    }
  ]
}`;

    const clientProvidedKeys = (req.headers['x-gemini-api-keys'] as string || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const response = await callGeminiWithKeyRotation(async (aiClient) => {
      let res;
      try {
        res = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });
      } catch (modelErr: any) {
        console.warn('gemini-3.8-flash unavailable, attempting gemini-3.1-flash-lite fallback...', modelErr?.message || modelErr);
        res = await aiClient.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });
      }
      return res;
    }, clientProvidedKeys);

    const responseText = response.text?.trim() || '';
    let parsed: AIItineraryPlan;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // If code-fenced or malformed JSON, strip wrappers
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    parsed.createdAt = new Date().toISOString();
    parsed.updatedAt = new Date().toISOString();

    return res.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error('Error generating AI plan:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi xử lý tạo lịch trình AI',
    });
  }
});

// API: Refine Itinerary via Follow-up conversation
app.post('/api/planner/refine', async (req, res) => {
  try {
    const { currentPlan, userMessage, chatHistory } = req.body;
    if (!currentPlan || !userMessage) {
      return res.status(400).json({ error: 'Missing currentPlan or userMessage' });
    }

    const knowledgePrompt = buildKnowledgePrompt();
    const prompt = `BẠN ĐANG ĐỒNG HÀNH CHỈNH SỬA LỊCH TRÌNH CHO KHÁCH HÀNG:
Người dùng nhắn yêu cầu điều chỉnh: "${userMessage}"

LỊCH TRÌNH HIỆN TẠI (JSON):
${JSON.stringify(currentPlan, null, 2)}

${knowledgePrompt}

HÃY:
1. Phân tích yêu cầu chỉnh sửa của người dùng (ví dụ: đổi ngân sách, đổi điểm đến, nếu trời mưa, giảm đi bộ cho người cao tuổi, kết thúc sớm hơn...).
2. Cập nhật lại toàn bộ cấu trúc AIItineraryPlan sao cho logic, hợp lý với thời gian và kinh phí thực tế.
3. Cung cấp câu trả lời giải thích ân cần, ngắn gọn và thông minh cho người dùng.

Trả về duy nhất JSON theo mẫu:
{
  "assistantResponse": "Lời giải thích thân thiện và chi tiết về các điểm vừa được điều chỉnh...",
  "updatedPlan": { ...cấu trúc AIItineraryPlan hoàn chỉnh đã được cập nhật... }
}`;

    const clientProvidedKeys = (req.headers['x-gemini-api-keys'] as string || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const response = await callGeminiWithKeyRotation(async (aiClient) => {
      let res;
      try {
        res = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });
      } catch (refineErr: any) {
        console.warn('gemini-3.8-flash unavailable for refine, attempting gemini-3.1-flash-lite fallback...', refineErr?.message || refineErr);
        res = await aiClient.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });
      }
      return res;
    }, clientProvidedKeys);

    const responseText = response.text?.trim() || '';
    let parsed: { assistantResponse: string; updatedPlan: AIItineraryPlan };
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    if (parsed.updatedPlan) {
      parsed.updatedPlan.updatedAt = new Date().toISOString();
    }

    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('Error refining AI plan:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi xử lý điều chỉnh lịch trình AI',
    });
  }
});

// Vite middleware or Static files serving
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Phu Tho Travel Server] listening on http://0.0.0.0:${PORT}`);
});
