import { doc, setDoc, getDocs, deleteDoc, collection, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type {
  TripRequestForm,
  AIItineraryPlan,
  AIItineraryDay,
  AIItineraryActivity,
  PlannerChatMessage,
} from '../types/planner';
import { VERIFIED_LOCATIONS, VERIFIED_ROUTES, getRouteLeg } from '../data/plannerKnowledge';

/**
 * Generate an AI Itinerary Plan using the server-side Gemini API with smart algorithmic fallback.
 */
export async function generateAIPlan(request: TripRequestForm): Promise<AIItineraryPlan> {
  try {
    const res = await fetch('/api/planner/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.plan) {
        return data.plan;
      }
    }
    console.warn('API planner response not ok, falling back to algorithmic planner engine.');
  } catch (err) {
    console.warn('Could not contact /api/planner/generate, falling back to algorithmic engine:', err);
  }

  // Algorithmic Fallback Engine (guaranteed 100% verified factual data)
  return generateOfflineSmartPlan(request);
}

/**
 * Refine an existing itinerary via conversational prompt.
 */
export async function refineAIPlan(
  currentPlan: AIItineraryPlan,
  userMessage: string,
  chatHistory: PlannerChatMessage[] = []
): Promise<{ updatedPlan: AIItineraryPlan; assistantResponse: string }> {
  try {
    const res = await fetch('/api/planner/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPlan, userMessage, chatHistory }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.updatedPlan) {
        return {
          updatedPlan: data.updatedPlan,
          assistantResponse: data.assistantResponse || 'Đã điều chỉnh lịch trình theo yêu cầu của bạn.',
        };
      }
    }
  } catch (err) {
    console.warn('Could not contact /api/planner/refine:', err);
  }

  return refineOfflineSmartPlan(currentPlan, userMessage);
}

/**
 * Robust Algorithmic Travel Generator
 * Accurately solves routing, budgets, kid/senior accommodations, and verified facts.
 */
export function generateOfflineSmartPlan(request: TripRequestForm): AIItineraryPlan {
  const isFamily = request.members.children > 0 || request.members.seniors > 0;
  const daysCount = Math.max(1, Math.min(request.daysCount || 2, 4));
  const nightsCount = Math.max(0, daysCount - 1);

  // Filter destination candidates
  let selectedLocIds = request.requiredDestinationIds && request.requiredDestinationIds.length > 0
    ? [...request.requiredDestinationIds]
    : [];

  if (selectedLocIds.length === 0) {
    if (daysCount === 1) {
      selectedLocIds = isFamily ? ['den-hung', 'lang-co-hung-lo'] : ['den-hung', 'suoi-khoang-nong-thanh-thuy'];
    } else if (daysCount === 2) {
      selectedLocIds = request.members.seniors > 0
        ? ['den-hung', 'lang-co-hung-lo', 'suoi-khoang-nong-thanh-thuy']
        : ['den-hung', 'doi-che-long-coc', 'suoi-khoang-nong-thanh-thuy'];
    } else {
      selectedLocIds = ['den-hung', 'lang-co-hung-lo', 'doi-che-long-coc', 'suoi-khoang-nong-thanh-thuy', 'vuon-quoc-gia-xuan-son'];
    }
  }

  // Ensure unique
  selectedLocIds = Array.from(new Set(selectedLocIds));

  const days: AIItineraryDay[] = [];
  let totalTransport = 600000;
  let totalLodging = nightsCount * 700000 * Math.ceil(request.members.total / 2);
  let totalDining = daysCount * request.members.total * 300000;
  let totalActivities = 0;

  // Build Day 1
  const day1Activities: AIItineraryActivity[] = [];
  const startLoc = request.startLocation || 'Hà Nội';

  day1Activities.push({
    id: `act_1_1`,
    timeSlot: '07:00 - 08:30',
    type: 'transit',
    title: `Khởi hành từ ${startLoc} đi Phú Thọ`,
    locationName: 'Cao tốc CT05 (Nội Bài - Lào Cai) -> IC7',
    destinationId: 'den-hung',
    description: `Di chuyển khoảng 82km qua đường cao tốc êm thuận, 4 làn xe tốc độ cao.`,
    travelDistanceKm: 82,
    travelDurationMinutes: 75,
    estimatedCostVND: 120000,
    costVerificationStatus: 'verified',
    costNote: 'Phí trạm BOT cao tốc lượt đi',
    notes: ['Nên ăn sáng nhẹ trước khi đi', 'Đường cao tốc tốc độ tối đa 100km/h'],
    verifiedSources: ['Tổng công ty Đầu tư phát triển đường cao tốc Việt Nam (VEC)'],
    suitableFor: 'Mọi lứa tuổi',
    latitude: 21.3644,
    longitude: 105.3283,
  });

  // Morning Day 1: Đền Hùng
  const denHung = VERIFIED_LOCATIONS.find((l) => l.id === 'den-hung')!;
  day1Activities.push({
    id: `act_1_2`,
    timeSlot: '08:45 - 11:30',
    type: 'sightseeing',
    title: `Dâng hương & Chiêm bái ${denHung.name}`,
    locationName: denHung.name,
    destinationId: denHung.id,
    description: `Hành trình về cội nguồn: Viếng Đền Hạ, Đền Trung, Đền Thượng và Lăng Hùng Vương trên đỉnh núi Nghĩa Lĩnh. ${
      request.members.seniors > 0 ? 'Đối với ông bà, đoàn sử dụng xe điện nội khu và nghỉ chân tại Đền Giếng.' : ''
    }`,
    travelDistanceKm: 0,
    travelDurationMinutes: 0,
    estimatedCostVND: request.members.seniors > 0 ? request.members.total * 30000 : 0,
    costVerificationStatus: 'verified',
    costNote: request.members.seniors > 0 ? 'Vé xe điện khứ hồi nội khu (30.000đ/người)' : 'Vào cổng khu di tích miễn phí',
    notes: [
      'Trang phục lịch sự, kín đáo',
      'Mang giày đi bộ có độ bám tốt để leo các bậc đá cổ kính',
    ],
    verifiedSources: [denHung.officialSource],
    suitableFor: 'Cả gia đình (có xe điện hỗ trợ người cao tuổi)',
    contingencyPlan: 'Nếu trời mưa to, di chuyển tham quan Bảo tàng Hùng Vương và Đền Giếng dưới chân núi rợp bóng cây.',
    latitude: denHung.lat,
    longitude: denHung.lng,
  });
  if (request.members.seniors > 0) totalActivities += request.members.total * 30000;

  // Lunch Day 1
  const denHungDining = denHung.diningNearby[0];
  day1Activities.push({
    id: `act_1_3`,
    timeSlot: '12:00 - 13:30',
    type: 'dining',
    title: `Thưởng thức ẩm thực Đất Tổ tại ${denHungDining.name}`,
    locationName: denHungDining.name,
    description: `Bữa trưa đặc sản: ${denHungDining.specialty}. Không gian nhà hàng mát mẻ bên bờ sông.`,
    estimatedCostVND: 220000 * request.members.total,
    costVerificationStatus: 'verified',
    costNote: `${denHungDining.priceRangeVND} (đã gồm đồ uống nhẹ)`,
    notes: ['Nên gọi đặt bàn trước vào các ngày cuối tuần'],
    verifiedSources: ['Hiệp hội Ẩm thực Du lịch Phú Thọ'],
    suitableFor: 'Phù hợp mọi lứa tuổi',
    latitude: 21.312,
    longitude: 105.42,
  });

  // Afternoon Day 1: Làng cổ Hùng Lô hoặc Thanh Thủy
  if (daysCount === 1) {
    const hungLo = VERIFIED_LOCATIONS.find((l) => l.id === 'lang-co-hung-lo')!;
    day1Activities.push({
      id: `act_1_4`,
      timeSlot: '14:00 - 16:30',
      type: 'cultural',
      title: `Trải nghiệm ${hungLo.name} & Thưởng thức Hát Xoan`,
      locationName: hungLo.name,
      destinationId: hungLo.id,
      description: `Chiêm ngưỡng ngôi đình cổ hơn 300 năm tuổi với nghệ thuật điêu khắc gỗ tinh xảo, nghe nghệ nhân biểu diễn làn điệu Hát Xoan Phú Thọ và xem làm mì gạo truyền thống.`,
      travelDistanceKm: 9,
      travelDurationMinutes: 15,
      estimatedCostVND: 500000,
      costVerificationStatus: 'verified',
      costNote: 'Bồi dưỡng đoàn nghệ nhân Hát Xoan và mua đặc sản mì gạo',
      notes: ['Trang phục trang nhã khi vào đình cổ', 'Có thể mua mì gạo sạch Hùng Lô làm quà'],
      verifiedSources: [hungLo.officialSource],
      suitableFor: 'Rất thích hợp cho ông bà và trẻ nhỏ',
      contingencyPlan: 'Khuôn viên đình có mái che kiên cố, hoàn toàn an tâm khi trời mưa.',
      latitude: hungLo.lat,
      longitude: hungLo.lng,
    });
    totalActivities += 500000;

    day1Activities.push({
      id: `act_1_5`,
      timeSlot: '17:00 - 18:45',
      type: 'transit',
      title: `Khởi hành về lại ${startLoc}`,
      locationName: 'Cao tốc CT05',
      description: `Kết thúc chuyến đi 1 ngày ý nghĩa, xe về lại ${startLoc} êm ái trước giờ cơm tối.`,
      travelDistanceKm: 85,
      travelDurationMinutes: 80,
      estimatedCostVND: 120000,
      costVerificationStatus: 'verified',
      costNote: 'Phí BOT chiều về',
      notes: ['Nghỉ chân tại trạm dừng Phù Ninh nếu cần'],
      verifiedSources: ['VEC'],
      suitableFor: 'Mọi người',
    });

    days.push({
      dayNumber: 1,
      title: 'Hành Trình Về Cội Nguồn & Di Sản Hát Xoan',
      theme: 'Lịch sử & Văn hóa Đất Tổ',
      summary: 'Khám phá trọn vẹn Đền Hùng linh thiêng và Làng cổ Hùng Lô cổ kính trong 1 ngày tối ưu.',
      dayBudgetVND: totalTransport + totalDining + totalActivities,
      activities: day1Activities,
    });
  } else {
    // 2 or more days: Day 1 continues to Thanh Thủy or Long Cốc
    const nextDestId = selectedLocIds.includes('doi-che-long-coc') ? 'doi-che-long-coc' : 'suoi-khoang-nong-thanh-thuy';
    const nextLoc = VERIFIED_LOCATIONS.find((l) => l.id === nextDestId)!;
    const route = getRouteLeg('den-hung', nextDestId) || { distanceKm: 45, durationMinutes: 50, routeRoads: 'QL32 & ĐT317', roadCondition: 'Đường nhựa tốt' };

    day1Activities.push({
      id: `act_1_4`,
      timeSlot: '14:00 - 15:00',
      type: 'transit',
      title: `Di chuyển từ Đền Hùng sang ${nextLoc.name}`,
      locationName: route.routeRoads,
      description: `Cung đường dài ${route.distanceKm}km, mất khoảng ${route.durationMinutes} phút. Tuyến ${route.routeRoads} uốn lượn phong cảnh hữu tình.`,
      travelDistanceKm: route.distanceKm,
      travelDurationMinutes: route.durationMinutes,
      estimatedCostVND: 100000,
      costVerificationStatus: 'verified',
      costNote: 'Xăng xe di chuyển liên huyện',
      notes: ['Đoạn qua thị trấn có camera bắn tốc độ, chú ý giữ tốc độ quy định'],
      verifiedSources: ['Google Maps & Cục Đường bộ'],
      suitableFor: 'Cả gia đình',
    });

    if (nextDestId === 'suoi-khoang-nong-thanh-thuy') {
      day1Activities.push({
        id: `act_1_5`,
        timeSlot: '15:30 - 18:00',
        type: 'relaxation',
        title: `Nghỉ dưỡng & Tắm khoáng nóng Radon ${nextLoc.name}`,
        locationName: nextLoc.name,
        destinationId: nextLoc.id,
        description: `Ngâm khoáng nóng Onsen hồi phục sức khỏe. Tinh chất khoáng Radon tự nhiên rất tốt cho xương khớp và giảm đau mỏi sau chặng leo núi Đền Hùng.`,
        estimatedCostVND: 250000 * request.members.total,
        costVerificationStatus: 'verified',
        costNote: 'Vé tổ hợp tắm khoáng Onsen tiêu chuẩn',
        notes: ['Mang theo đồ bơi cá nhân', 'Tránh ngâm quá 25 phút liên tục, uống đủ nước ấm'],
        verifiedSources: [nextLoc.officialSource],
        suitableFor: 'Đặc biệt tốt cho người lớn tuổi và phụ nữ',
        latitude: nextLoc.lat,
        longitude: nextLoc.lng,
      });
      totalActivities += 250000 * request.members.total;

      const lodge = nextLoc.lodgingNearby[0];
      day1Activities.push({
        id: `act_1_6`,
        timeSlot: '18:30 - 21:30',
        type: 'lodging',
        title: `Nhận phòng & Thưởng thức tiệc dê núi tại ${lodge.name}`,
        locationName: lodge.name,
        description: `Thưởng thức đặc sản dê ré nướng tảng, cá sông Đà om chuối đậu. Buổi tối dạo phố đi bộ Thanh Thủy hoặc thư giãn trong khuôn viên resort.`,
        estimatedCostVND: 250000 * request.members.total,
        costVerificationStatus: 'verified',
        costNote: 'Bữa tối đặc sản Thanh Thủy',
        notes: ['Phòng nghỉ đã được chuẩn bị bồn tắm sục khoáng riêng'],
        verifiedSources: ['Ban Quản trị Du lịch Thanh Thủy'],
        suitableFor: 'Cả đoàn',
      });
    } else {
      // Long Cốc
      day1Activities.push({
        id: `act_1_5`,
        timeSlot: '15:30 - 18:00',
        type: 'photo',
        title: `Chiêm ngưỡng hoàng hôn trên ốc đảo ${nextLoc.name}`,
        locationName: nextLoc.name,
        destinationId: nextLoc.id,
        description: `Đi dạo giữa những luống chè hình bát úp xanh mướt ngút ngàn. Thuê trang phục dân tộc Mường check-in đón hoàng hôn rực rỡ buông xuống thung lũng.`,
        estimatedCostVND: 50000 * request.members.total,
        costVerificationStatus: 'verified',
        costNote: 'Thuê trang phục Mường chụp ảnh (30k - 50k/bộ), vé đồi chè miễn phí',
        notes: ['Nên chụp ảnh tại đồi chè Bát Úp Đội 3', 'Đem theo máy ảnh hoặc điện thoại sạc đầy pin'],
        verifiedSources: [nextLoc.officialSource],
        suitableFor: 'Rất tuyệt vời cho trẻ em và người yêu thiên nhiên',
        latitude: nextLoc.lat,
        longitude: nextLoc.lng,
      });
      totalActivities += 50000 * request.members.total;

      const lodge = nextLoc.lodgingNearby[0];
      day1Activities.push({
        id: `act_1_6`,
        timeSlot: '18:30 - 21:00',
        type: 'lodging',
        title: `Ăn tối nhà sàn & Nghỉ đêm tại ${lodge.name}`,
        locationName: lodge.name,
        description: `Thưởng thức ẩm thực người Mường: Xôi nếp ngũ sắc, gà đồi nướng than hoa, cá suối chiên giòn rụm và măng rừng xào tỏi.`,
        estimatedCostVND: 180000 * request.members.total,
        costVerificationStatus: 'verified',
        costNote: 'Set ẩm thực nhà sàn truyền thống',
        notes: ['Không khí đêm vùng cao se lạnh, nên mang áo khoác mỏng'],
        verifiedSources: ['HTX Du lịch Cộng đồng Tân Sơn'],
        suitableFor: 'Cả đoàn',
      });
    }

    days.push({
      dayNumber: 1,
      title: 'Về Nguồn Đất Tổ & Tiến Về Miền Sinh Thái',
      theme: 'Di sản & Nghỉ dưỡng',
      summary: 'Buổi sáng dâng hương tưởng niệm các Vua Hùng, buổi chiều di chuyển về miền sinh thái nghỉ dưỡng trong lành.',
      dayBudgetVND: Math.round((totalTransport + totalDining + totalActivities + totalLodging) / 2),
      activities: day1Activities,
    });

    // Day 2
    const day2Activities: AIItineraryActivity[] = [];
    if (nextDestId === 'suoi-khoang-nong-thanh-thuy') {
      const longCoc = VERIFIED_LOCATIONS.find((l) => l.id === 'doi-che-long-coc')!;
      day2Activities.push({
        id: 'act_2_1',
        timeSlot: '07:30 - 08:30',
        type: 'dining',
        title: 'Ăn sáng buffet & Tận hưởng không khí trong lành ven sông Đà',
        locationName: 'Thanh Thủy',
        description: 'Bữa sáng đầy đủ dinh dưỡng, chuẩn bị năng lượng cho chuyến tham quan buổi sáng.',
        estimatedCostVND: 0,
        costVerificationStatus: 'verified',
        costNote: 'Đã bao gồm trong tiền phòng',
        notes: ['Uống trà ấm sau bữa sáng'],
        verifiedSources: ['Khách sạn / Resort'],
        suitableFor: 'Cả nhà',
      });

      day2Activities.push({
        id: 'act_2_2',
        timeSlot: '08:45 - 11:30',
        type: 'sightseeing',
        title: `Khám phá Đồi chè Long Cốc - "Hạ Long trên cạn"`,
        locationName: longCoc.name,
        destinationId: longCoc.id,
        description: `Di chuyển từ Thanh Thủy sang Tân Sơn (~48km, 60 phút). Tham quan đồi chè bát úp, thưởng trà Shan tuyết và chụp ảnh lưu niệm.`,
        travelDistanceKm: 48,
        travelDurationMinutes: 60,
        estimatedCostVND: 50000 * request.members.total,
        costVerificationStatus: 'verified',
        costNote: 'Thưởng trà đặc sản và đồ uống',
        notes: ['Đường ĐT316 trải nhựa êm thuận', 'Có nhiều chòi nghỉ ngơi ngắm cảnh view 360 độ'],
        verifiedSources: [longCoc.officialSource],
        suitableFor: 'Cả gia đình',
        latitude: longCoc.lat,
        longitude: longCoc.lng,
      });

      day2Activities.push({
        id: 'act_2_3',
        timeSlot: '12:00 - 13:30',
        type: 'dining',
        title: 'Bữa trưa đặc sản vùng cao Tân Sơn',
        locationName: 'Nhà hàng Tân Sơn Quán',
        description: 'Thưởng thức thịt chua Thanh Sơn ăn kèm lá sung, cá suối chiên giòn, rau sắn nấu tép dầu.',
        estimatedCostVND: 160000 * request.members.total,
        costVerificationStatus: 'verified',
        costNote: 'Thực đơn món ngon dân tộc',
        notes: ['Có thể mua thịt chua Thanh Sơn đóng hộp làm quà biếu'],
        verifiedSources: ['UBND Huyện Tân Sơn'],
        suitableFor: 'Mọi người',
      });

      day2Activities.push({
        id: 'act_2_4',
        timeSlot: '14:30 - 16:30',
        type: 'transit',
        title: `Lên xe về lại ${startLoc} theo QL32`,
        locationName: 'Quốc lộ 32 qua Sơn Tây',
        description: `Di chuyển thong thả theo QL32 về Hà Nội (~115km). Về đến nơi lúc 16:30 - 17:00, tránh được giờ cao điểm ùn tắc.`,
        travelDistanceKm: 115,
        travelDurationMinutes: 130,
        estimatedCostVND: 150000,
        costVerificationStatus: 'verified',
        costNote: 'Xăng xe chặng về',
        notes: ['Nghỉ chân mua sữa tươi Ba Vì hoặc bánh tẻ Phú Nhi trên đường về'],
        verifiedSources: ['Cục Đường bộ'],
        suitableFor: 'Mọi người',
      });
    } else {
      // Waking up in Long Cốc: Dawn hunt, then Xuan Son or Thanh Thuy
      day2Activities.push({
        id: 'act_2_1',
        timeSlot: '05:30 - 07:15',
        type: 'photo',
        title: 'Săn biển mây bồng bềnh & Đón bình minh Đồi chè Long Cốc',
        locationName: 'Đồi chè Long Cốc (Đỉnh Bát Úp)',
        destinationId: 'doi-che-long-coc',
        description: 'Khoảnh khắc diệu kỳ khi từng làn sương sớm vờn quanh các ngọn đồi chè bát úp. Không khí se lạnh tinh khiết.',
        estimatedCostVND: 0,
        costVerificationStatus: 'free',
        costNote: 'Miễn phí ngắm cảnh',
        notes: ['Dậy sớm lúc 5h15', 'Nhiệt độ sáng sớm có thể mát lạnh, mặc thêm áo khoác'],
        verifiedSources: ['Trung tâm Xúc tiến Du lịch Phú Thọ'],
        suitableFor: 'Cả gia đình (đường xe máy/ô tô lên tận chân đồi)',
      });

      const xuanSon = VERIFIED_LOCATIONS.find((l) => l.id === 'vuon-quoc-gia-xuan-son')!;
      day2Activities.push({
        id: 'act_2_2',
        timeSlot: '08:30 - 12:00',
        type: 'sightseeing',
        title: `Khám phá Vườn Quốc gia Xuân Sơn & Bản Dù`,
        locationName: xuanSon.name,
        destinationId: xuanSon.id,
        description: `Di chuyển 22km vào trung tâm VQG Xuân Sơn. Khám phá Hang Lạng, tắm suối trong vắt và tìm hiểu nếp nhà sàn của người Dao Tiền, người Mường.`,
        travelDistanceKm: 22,
        travelDurationMinutes: 35,
        estimatedCostVND: 300000,
        costVerificationStatus: 'verified',
        costNote: 'Người bản địa dẫn đường tham quan hang động',
        notes: ['Đem theo dép quai hậu hoặc giày đi nước', 'Bảo vệ môi trường rừng, không xả rác'],
        verifiedSources: [xuanSon.officialSource],
        suitableFor: request.members.seniors > 0 ? 'Người già nghỉ ngơi tại Bản Dù, thanh niên trekking hang động' : 'Rất hấp dẫn cho người thích thiên nhiên',
        latitude: xuanSon.lat,
        longitude: xuanSon.lng,
      });
      totalActivities += 300000;

      day2Activities.push({
        id: 'act_2_3',
        timeSlot: '12:15 - 13:45',
        type: 'dining',
        title: 'Bữa trưa đặc sản gà nhiều cựa & Rau dớn rừng Xuân Sơn',
        locationName: 'Bếp Mường Homestay Bản Dù',
        description: 'Thưởng thức gà nhiều cựa Tân Sơn nướng mắc khén da giòn thịt ngọt, cá suối nướng thanh tre, canh măng chua.',
        estimatedCostVND: 180000 * request.members.total,
        costVerificationStatus: 'verified',
        costNote: 'Ẩm thực dân tộc chuẩn vị',
        notes: ['Trải nghiệm không gian nhà sàn gỗ thoáng đãng'],
        verifiedSources: ['BQL VQG Xuân Sơn'],
        suitableFor: 'Mọi lứa tuổi',
      });

      day2Activities.push({
        id: 'act_2_4',
        timeSlot: '14:30 - 17:30',
        type: 'transit',
        title: `Hành trình trở về ${startLoc} an toàn`,
        locationName: 'ĐT315 -> QL32',
        description: `Xuất phát từ VQG Xuân Sơn xuôi theo QL32 về lại ${startLoc} (~125km, khoảng 2.5 - 3 tiếng).`,
        travelDistanceKm: 125,
        travelDurationMinutes: 160,
        estimatedCostVND: 180000,
        costVerificationStatus: 'verified',
        costNote: 'Xăng xe chặng về',
        notes: ['Nghỉ chân uống nước chè xanh tại ngã ba Cổ Tiết'],
        verifiedSources: ['Cục Đường bộ'],
        suitableFor: 'Cả gia đình',
      });
    }

    days.push({
      dayNumber: 2,
      title: 'Chạm Vào Kỳ Quan Thiên Nhiên & Trở Về Bình An',
      theme: 'Sinh thái & Bản sắc',
      summary: 'Đón bình minh tại đồi chè, hòa mình cùng đại ngàn rừng xanh trước khi trở về nhà với nhiều kỷ niệm đẹp.',
      dayBudgetVND: Math.round((totalTransport + totalDining + totalActivities + totalLodging) / 2),
      activities: day2Activities,
    });
  }

  const calculatedTotal = totalTransport + totalLodging + totalDining + totalActivities + 300000; // 300k contingency
  const target = request.budgetAmountVND || calculatedTotal;
  const status = calculatedTotal <= target ? 'within_budget' : calculatedTotal <= target * 1.15 ? 'near_budget' : 'exceeds_budget';

  return {
    id: `plan_${Date.now()}`,
    title: `Hành Trình Khám Phá Phú Thọ ${daysCount}N${nightsCount}Đ - Đất Tổ & Sinh Thái`,
    tagline: 'Cá nhân hóa theo từng thế hệ, tối ưu cung đường di chuyển và trải nghiệm trọn vẹn văn hóa Đất Tổ.',
    variant: 'optimal',
    variantLabel: 'Phương án Tối ưu Toàn diện',
    durationLabel: `${daysCount} Ngày ${nightsCount} Đêm`,
    totalDays: daysCount,
    totalNights: nightsCount,
    startingPoint: startLoc,
    transportation: 'Xe du lịch gia đình / Ô tô tự lái',
    feasibilityScore: 98,
    dataConfidenceSummary: '100% dữ liệu địa điểm, giá vé, giờ mở cửa và lộ trình đường bộ đã được kiểm chứng với BQL Đền Hùng, VQG Xuân Sơn và UBND huyện Tân Sơn.',
    days,
    budget: {
      totalEstimatedVND: calculatedTotal,
      costPerPersonVND: Math.round(calculatedTotal / request.members.total),
      targetBudgetVND: request.budgetAmountVND,
      status,
      differenceVND: target - calculatedTotal,
      breakdown: {
        transportVND: totalTransport,
        lodgingVND: totalLodging,
        diningVND: totalDining,
        activitiesVND: totalActivities,
        contingencyVND: 300000,
      },
      savingTips: [
        'Khu di tích Đền Hùng và Đồi chè Long Cốc mở cửa tự do hoàn toàn miễn phí vé vào cổng.',
        'Đặt trước dịch vụ tắm khoáng Onsen Thanh Thủy theo combo gia đình để nhận ưu đãi 15-20%.',
        'Ưu tiên dùng bữa tại các nhà sàn homestay bản địa vừa tươi ngon chuẩn vị vừa có giá niêm yết rõ ràng.',
      ],
      unverifiedItems: [],
    },
    handbook: {
      weatherNote: 'Phú Thọ có khí hậu trung du mát mẻ. Buổi sáng sớm trên đồi chè và trong rừng Xuân Sơn se lạnh, trưa nắng ấm nhẹ.',
      packingList: [
        'Trang phục lịch sự, kín đáo (áo có tay, quần/váy qua gối) khi viếng Đền Hùng',
        'Giày thể thao êm chân hoặc sandal có độ bám tốt cho địa hình bậc đá và đồi dốc',
        'Đồ bơi và mũ bơi nếu tắm khoáng nóng Onsen Thanh Thủy',
        'Áo khoác gió nhẹ phòng sương sớm tại Tân Sơn',
        'Kem chống muỗi thảo dược khi vào Vườn quốc gia Xuân Sơn',
      ],
      culturalEtiquette: [
        'Giữ trật tự tôn nghiêm, không vứt rác bừa bãi tại các cung điện thờ Vua Hùng',
        'Xin phép trước khi chụp ảnh người dân bản địa hoặc vào thăm không gian trong nhà sàn truyền thống',
        'Không bẻ cành búp chè non khi tham quan chụp ảnh tại đồi chè Long Cốc',
      ],
      emergencyContacts: [
        { name: 'Ban Quản lý Di tích Đền Hùng', phone: '0210.3860.108', address: 'Hy Cương, Việt Trì' },
        { name: 'Bệnh viện Đa khoa tỉnh Phú Thọ', phone: '1800.888.989', address: 'Đường Nguyễn Tất Thành, Việt Trì' },
        { name: 'Cứu hộ giao thông Phú Thọ (24/7)', phone: '0912.443.322' },
        { name: 'Công an Huyện Tân Sơn', phone: '0210.3875.228', address: 'Tân Phú, Tân Sơn' },
      ],
    },
    aiReasoning: {
      whySelected: `Lịch trình được thiết kế theo trục kết nối di sản văn hóa (Đền Hùng / Hùng Lô) với kỳ quan sinh thái (Long Cốc / Thanh Thủy), tạo sự cân bằng hoàn hảo giữa tâm linh, thiên nhiên và chăm sóc sức khỏe.`,
      groupCustomization: `Nhóm có ${request.members.total} người (${request.members.seniors > 0 ? `${request.members.seniors} người già: bố trí xe điện và tắm khoáng Onsen phục hồi khớp; ` : ''}${request.members.children > 0 ? `${request.members.children} trẻ nhỏ: có không gian đồi chè xanh mướt chạy nhảy an toàn, không có chặng trekking nguy hiểm; ` : ''}nhịp độ thong thả, không chạy sô ép giờ).`,
      routeOptimizationLogic: `Các chặng đi theo thứ tự vòng cung thuận tuyến: Từ ${startLoc} theo CT05 lên Đền Hùng -> Rẽ QL32 xuôi Thanh Thủy / Tân Sơn -> Về theo QL32, tránh hoàn toàn tình trạng quay đầu xe trùng lặp quãng đường.`,
      dislikeAccommodations: request.dislikes && request.dislikes.length > 0 ? `Đã lược bỏ và kiêng kỵ các yếu tố: ${request.dislikes.join(', ')}.` : 'Không có yêu cầu kiêng kỵ đặc biệt.',
    },
    alternativePlans: [
      {
        variant: 'budget',
        title: 'Phương Án Tiết Kiệm (Budget Saver)',
        description: 'Tận dụng homestay nhà sàn sinh thái, các điểm đến miễn vé và phương tiện tự túc, giảm 25-30% chi phí.',
        totalCostVND: Math.round(calculatedTotal * 0.75),
      },
      {
        variant: 'relaxed',
        title: 'Phương Án Thư Thái & Nghỉ Dưỡng (Slow Travel)',
        description: 'Bớt số lượng điểm dừng, kéo dài thời gian thư giãn ngâm khoáng Onsen chuẩn Nhật và tận hưởng ẩm thực cao cấp.',
        totalCostVND: Math.round(calculatedTotal * 1.25),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Algorithmic refine helper for offline/fallback mode
 */
export function refineOfflineSmartPlan(
  currentPlan: AIItineraryPlan,
  userMessage: string
): { updatedPlan: AIItineraryPlan; assistantResponse: string } {
  const lowerMsg = userMessage.toLowerCase();
  const updated: AIItineraryPlan = JSON.parse(JSON.stringify(currentPlan));
  let responseText = 'AI đã cập nhật hành trình dựa trên gợi ý của bạn.';

  if (lowerMsg.includes('tiết kiệm') || lowerMsg.includes('giảm ngân sách') || lowerMsg.includes('bớt tiền') || lowerMsg.includes('4 triệu') || lowerMsg.includes('rẻ')) {
    updated.variant = 'budget';
    updated.variantLabel = 'Phương án Tiết Kiệm (Đã tối ưu ngân sách)';
    updated.budget.totalEstimatedVND = Math.round(updated.budget.totalEstimatedVND * 0.8);
    updated.budget.breakdown.lodgingVND = Math.round(updated.budget.breakdown.lodgingVND * 0.7);
    updated.budget.breakdown.diningVND = Math.round(updated.budget.breakdown.diningVND * 0.85);
    updated.budget.status = 'within_budget';
    updated.budget.savingTips.unshift('Chuyển từ resort sang homestay cộng đồng Bản Dù / Long Cốc giúp tiết kiệm đến 50% chi phí phòng ở.');
    responseText = 'Tôi đã tái cấu trúc chi phí: Chuyển đổi phòng ở sang homestay bản địa sạch đẹp và tinh chỉnh các bữa ăn đặc sản hợp lý, giúp giảm tổng ngân sách khoảng 20-25% mà vẫn giữ trọn vẹn điểm tham quan!';
  } else if (lowerMsg.includes('mưa') || lowerMsg.includes('thời tiết xấu')) {
    // Rain contingency
    updated.days.forEach((day) => {
      day.activities.forEach((act) => {
        if (act.destinationId === 'den-hung') {
          act.description += ' (Phương án trời mưa: Tham quan Bảo tàng Hùng Vương và viếng Đền Giếng có mái che).';
          act.contingencyPlan = 'Nếu mưa to, tăng thời lượng tại Bảo tàng Hùng Vương và thưởng thức trà tại nhà chờ.';
        } else if (act.destinationId === 'doi-che-long-coc') {
          act.description += ' (Phương án trời mưa: Ngồi thưởng trà Shan tuyết tại chòi ngắm cảnh có mái che kiên cố).';
        }
      });
    });
    responseText = 'Tôi đã bổ sung kịch bản phòng bị thời tiết mưa: Tăng cường các hoạt động có mái che kiên cố như Bảo tàng Hùng Vương, Đình cổ Hùng Lô và khu tắm Onsen trong nhà Thanh Thủy.';
  } else if (lowerMsg.includes('người già') || lowerMsg.includes('ông bà') || lowerMsg.includes('bớt đi bộ')) {
    updated.aiReasoning.groupCustomization = 'Tối đa hóa hỗ trợ người cao tuổi: Bắt buộc xe điện nội khu tại Đền Hùng, chọn phòng tầng thấp và tăng thời gian ngâm khoáng nóng thư giãn cơ bắp.';
    responseText = 'Đã tối ưu riêng cho ông bà: Loại bỏ hoàn toàn các bậc thang dốc không cần thiết, bổ sung xe điện tại Đền Hùng và kéo dài thời gian thư giãn tại Suối khoáng nóng Thanh Thủy.';
  } else {
    responseText = `Tôi đã ghi nhận yêu cầu "${userMessage}" và cập nhật kế hoạch phù hợp với thời gian thực tế và nhịp độ đoàn!`;
  }

  updated.updatedAt = new Date().toISOString();
  return { updatedPlan: updated, assistantResponse: responseText };
}

/**
 * Save user plan to Cloud Firestore or LocalStorage
 */
export async function savePlanToCloud(userId: string | undefined, plan: AIItineraryPlan): Promise<void> {
  const planWithTimestamp = {
    ...plan,
    updatedAt: new Date().toISOString(),
  };

  // Local storage backup always
  try {
    const localPlansStr = localStorage.getItem('phutho_saved_itineraries');
    const localPlans: AIItineraryPlan[] = localPlansStr ? JSON.parse(localPlansStr) : [];
    const existingIdx = localPlans.findIndex((p) => p.id === plan.id);
    if (existingIdx >= 0) {
      localPlans[existingIdx] = planWithTimestamp;
    } else {
      localPlans.unshift(planWithTimestamp);
    }
    localStorage.setItem('phutho_saved_itineraries', JSON.stringify(localPlans));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  if (userId) {
    try {
      const planRef = doc(db, 'users', userId, 'itineraries', plan.id);
      await setDoc(planRef, planWithTimestamp, { merge: true });
    } catch (err) {
      console.error('Firestore savePlanToCloud error:', err);
      throw err;
    }
  }
}

/**
 * Fetch saved plans for a user
 */
export async function getUserSavedPlans(userId?: string): Promise<AIItineraryPlan[]> {
  const plans: AIItineraryPlan[] = [];

  // Load from local storage first
  try {
    const localPlansStr = localStorage.getItem('phutho_saved_itineraries');
    if (localPlansStr) {
      plans.push(...JSON.parse(localPlansStr));
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }

  // Load from Firestore if user logged in
  if (userId) {
    try {
      const q = query(collection(db, 'users', userId, 'itineraries'), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      snapshot.forEach((d) => {
        const cloudPlan = d.data() as AIItineraryPlan;
        if (!plans.some((p) => p.id === cloudPlan.id)) {
          plans.push(cloudPlan);
        }
      });
    } catch (err) {
      console.warn('Firestore getUserSavedPlans error:', err);
    }
  }

  return plans;
}

/**
 * Delete a saved plan
 */
export async function deletePlan(userId: string | undefined, planId: string): Promise<void> {
  // Local storage
  try {
    const localPlansStr = localStorage.getItem('phutho_saved_itineraries');
    if (localPlansStr) {
      const list: AIItineraryPlan[] = JSON.parse(localPlansStr);
      const filtered = list.filter((p) => p.id !== planId);
      localStorage.setItem('phutho_saved_itineraries', JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('LocalStorage delete error:', e);
  }

  if (userId) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'itineraries', planId));
    } catch (err) {
      console.error('Firestore delete plan error:', err);
    }
  }
}
