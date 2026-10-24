import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  Sparkles,
  Send,
  Calendar,
  Clock,
  MapPin,
  Car,
  Utensils,
  Camera,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Share2,
  Printer,
  Copy,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Check,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingDown,
  Info,
  RotateCcw,
  SlidersHorizontal,
  CloudRain,
  Users,
  Footprints,
  FileDown
} from 'lucide-react';
import type {
  TripRequestForm,
  AIItineraryPlan,
  AIItineraryActivity,
  BudgetTier,
  TravelPace,
  PlannerChatMessage,
} from '../types/planner';
import { VERIFIED_LOCATIONS } from '../data/plannerKnowledge';
import {
  generateAIPlan,
  refineAIPlan,
  savePlanToCloud,
  getUserSavedPlans,
  deletePlan,
} from '../lib/aiPlannerService';
import type { Destination } from '../types';
import { ItineraryRouteMap } from './ItineraryRouteMap';

interface AITravelPlannerProps {
  destinations: Destination[];
  currentUser: User | null;
  onSelectDestination: (dest: Destination) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onOpenAuth: () => void;
  initialPrompt?: string | null;
}

const QUICK_PROMPTS = [
  'Gia đình 3 thế hệ (ông bà, vợ chồng, bé 7 tuổi) đi 2 ngày 1 đêm thư thái, ngân sách 5 triệu',
  'Nhóm bạn trẻ 2N1Đ săn mây đồi chè Long Cốc và trải nghiệm rừng nguyên sinh Xuân Sơn',
  'Chuyến đi 1 ngày cuối tuần viếng Đền Hùng linh thiêng và nghe hát Xoan làng cổ Hùng Lô',
  'Cặp đôi nghỉ dưỡng khoáng nóng Onsen Thanh Thủy 2 ngày 1 đêm phục hồi sức khỏe',
];

export const AITravelPlanner: React.FC<AITravelPlannerProps> = ({
  destinations,
  currentUser,
  onSelectDestination,
  onShowToast,
  onOpenAuth,
  initialPrompt = null,
}) => {
  // Input form state
  const [promptText, setPromptText] = useState(initialPrompt || '');

  useEffect(() => {
    if (initialPrompt) {
      setPromptText(initialPrompt);
    }
  }, [initialPrompt]);
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [startLocation, setStartLocation] = useState('Hà Nội');
  const [startDate, setStartDate] = useState('');
  const [daysCount, setDaysCount] = useState<number>(2);
  const [nightsCount, setNightsCount] = useState<number>(1);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(1);
  const [seniors, setSeniors] = useState<number>(1);
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('balanced');
  const [budgetAmount, setBudgetAmount] = useState<number>(5000000);
  const [pace, setPace] = useState<TravelPace>('relaxed');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Văn hóa & Di sản',
    'Thiên nhiên sinh thái',
    'Nghỉ dưỡng Onsen',
  ]);
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);
  const [mustVisitIds, setMustVisitIds] = useState<string[]>(['den-hung']);

  // Loading & Execution state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState<string>('');
  const [currentPlan, setCurrentPlan] = useState<AIItineraryPlan | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  // Follow-up chat state
  const [followUpMsg, setFollowUpMsg] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [chatHistory, setChatHistory] = useState<PlannerChatMessage[]>([]);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Saved itineraries list
  const [savedPlans, setSavedPlans] = useState<AIItineraryPlan[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);

  // Load saved plans on mount
  useEffect(() => {
    getUserSavedPlans(currentUser?.uid)
      .then((plans) => setSavedPlans(plans))
      .catch((e) => console.warn(e));
  }, [currentUser]);

  // Sync days & nights
  const handleDaysChange = (days: number) => {
    setDaysCount(days);
    setNightsCount(Math.max(0, days - 1));
  };

  // Toggle interest
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  // Toggle dislike
  const toggleDislike = (dislike: string) => {
    setSelectedDislikes((prev) =>
      prev.includes(dislike) ? prev.filter((d) => d !== dislike) : [...prev, dislike]
    );
  };

  // Toggle must-visit destination
  const toggleMustVisit = (id: string) => {
    setMustVisitIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Build the request form
  const buildRequestForm = (overridePrompt?: string): TripRequestForm => {
    return {
      prompt: overridePrompt || promptText,
      startLocation,
      startDate: startDate || 'Cuối tuần này',
      daysCount,
      nightsCount,
      members: {
        total: adults + children + seniors,
        adults,
        children,
        seniors,
        specialNeeds,
      },
      budgetTier,
      budgetAmountVND: budgetAmount,
      pace,
      interests: selectedInterests,
      dislikes: selectedDislikes,
      flexibility: 'weather_adaptive',
      requiredDestinationIds: mustVisitIds,
    };
  };

  // Handle Generate Itinerary
  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt !== undefined ? customPrompt : promptText;
    if (!textToUse && !showAdvancedForm) {
      onShowToast('Vui lòng nhập mong muốn của bạn hoặc chọn gợi ý bên dưới.', 'info');
      return;
    }

    setIsGenerating(true);
    setGeneratingStep('1/4: Đang phân tích nhu cầu và các ràng buộc của đoàn...');

    const stepTimer1 = setTimeout(() => {
      setGeneratingStep('2/4: Đối chiếu cơ sở dữ liệu 5 điểm đến và ma trận định tuyến đường bộ...');
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setGeneratingStep('3/4: Tối ưu mốc thời gian, chi phí vé, ẩm thực và trạm dừng...');
    }, 2500);

    const stepTimer3 = setTimeout(() => {
      setGeneratingStep('4/4: Hoàn tất sơ đồ dòng thời gian và cẩm nang chuyến đi...');
    }, 3800);

    try {
      const requestForm = buildRequestForm(textToUse);
      const plan = await generateAIPlan(requestForm);
      setCurrentPlan(plan);
      setSelectedDayNumber(1);
      setIsSaved(false);

      // Add assistant welcome chat
      setChatHistory([
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `Chào bạn! Tôi đã kiến tạo xong hành trình "${plan.title}" tối ưu cho ${requestForm.members.total} người (${requestForm.members.seniors > 0 ? `${requestForm.members.seniors} người già, ` : ''}${requestForm.members.children > 0 ? `${requestForm.members.children} trẻ nhỏ, ` : ''}${requestForm.members.adults} người lớn). Bạn có thể xem chi tiết bên dưới hoặc nhắn tin để tôi điều chỉnh nhé!`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      onShowToast('Đã kiến tạo hành trình Phú Thọ thành công!', 'success');

      // Scroll smoothly down to the plan results
      setTimeout(() => {
        const el = document.getElementById('ai-planner-results');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err: any) {
      console.error(err);
      onShowToast(`Lỗi tạo lịch trình: ${err.message || err}`, 'error');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsGenerating(false);
      setGeneratingStep('');
    }
  };

  // Handle Refine Conversation
  const handleRefine = async (customMessage?: string) => {
    const msg = customMessage || followUpMsg;
    if (!msg.trim() || !currentPlan) return;

    const userChatMessage: PlannerChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userChatMessage]);
    if (!customMessage) setFollowUpMsg('');
    setIsRefining(true);

    try {
      const res = await refineAIPlan(currentPlan, msg, chatHistory);
      setCurrentPlan(res.updatedPlan);
      setIsSaved(false);

      const assistantChatMessage: PlannerChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: res.assistantResponse,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        planUpdated: true,
      };

      setChatHistory((prev) => [...prev, assistantChatMessage]);
      onShowToast('Đã cập nhật lịch trình theo yêu cầu của bạn!', 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast('Không thể điều chỉnh lịch trình lúc này.', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  // Switch Plan Variant
  const handleSwitchVariant = (variant: 'optimal' | 'budget' | 'relaxed') => {
    if (!currentPlan) return;
    if (variant === 'budget') {
      handleRefine('Tối ưu sang phương án tiết kiệm chi phí, ưu tiên homestay và điểm tham quan miễn phí');
    } else if (variant === 'relaxed') {
      handleRefine('Chuyển sang phương án thư thái, giảm bớt điểm dừng, tập trung nghỉ ngơi tắm khoáng');
    } else {
      handleRefine('Trở về phương án cân bằng tối ưu toàn diện');
    }
  };

  // Save Plan
  const handleSavePlan = async () => {
    if (!currentPlan) return;
    try {
      await savePlanToCloud(currentUser?.uid, currentPlan);
      setIsSaved(true);
      const updatedList = await getUserSavedPlans(currentUser?.uid);
      setSavedPlans(updatedList);
      onShowToast(
        currentUser
          ? 'Đã lưu hành trình vào tài khoản Cloud của bạn!'
          : 'Đã lưu hành trình vào bộ nhớ thiết bị. Đăng nhập để đồng bộ đa thiết bị.',
        'success'
      );
    } catch (err: any) {
      onShowToast(`Lỗi lưu lịch trình: ${err.message || err}`, 'error');
    }
  };

  // Copy text plan
  const handleCopyTextPlan = () => {
    if (!currentPlan) return;
    const text = `=== ${currentPlan.title.toUpperCase()} ===\n` +
      `Khẩu hiệu: ${currentPlan.tagline}\n` +
      `Thời lượng: ${currentPlan.durationLabel} | Xuất phát: ${currentPlan.startingPoint}\n` +
      `Tổng chi phí ước tính: ${currentPlan.budget.totalEstimatedVND.toLocaleString('vi-VN')} VNĐ (${currentPlan.budget.costPerPersonVND.toLocaleString('vi-VN')} VNĐ/người)\n\n` +
      currentPlan.days
        .map((day) => {
          return `--- NGÀY ${day.dayNumber}: ${day.title} (${day.theme}) ---\n` +
            day.activities
              .map(
                (act) =>
                  `• [${act.timeSlot}] ${act.title} @ ${act.locationName}\n  - Mô tả: ${act.description}\n  - Chi phí dự kiến: ${act.estimatedCostVND.toLocaleString('vi-VN')} VNĐ (${act.costNote || ''})\n  - Ghi chú: ${act.notes.join('; ')}`
              )
              .join('\n\n');
        })
        .join('\n\n') +
      `\n\n=== LƯU Ý HÀNH TRÌNH ===\n` +
      `Thời tiết: ${currentPlan.handbook.weatherNote}\n` +
      `Đồ dùng cần mang: ${currentPlan.handbook.packingList.join(', ')}\n` +
      `Đường dây nóng hỗ trợ: ${currentPlan.handbook.emergencyContacts.map((c) => `${c.name}: ${c.phone}`).join(' | ')}\n` +
      `\n(Nguồn: PHU THO AI TRAVEL - Dữ liệu xác thực 100%)`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
      onShowToast('Đã sao chép toàn bộ lịch trình chi tiết vào clipboard!', 'success');
    });
  };

  // Print / Export PDF
  const handlePrintPlan = () => {
    window.print();
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transit':
        return <Car className="w-4 h-4 text-amber-700" />;
      case 'dining':
        return <Utensils className="w-4 h-4 text-emerald-700" />;
      case 'sightseeing':
        return <Compass className="w-4 h-4 text-indigo-700" />;
      case 'relaxation':
        return <Coffee className="w-4 h-4 text-teal-700" />;
      case 'cultural':
        return <MapPin className="w-4 h-4 text-red-700" />;
      case 'photo':
        return <Camera className="w-4 h-4 text-pink-700" />;
      default:
        return <Clock className="w-4 h-4 text-stone-700" />;
    }
  };

  return (
    <div className="bg-stone-50/70 py-10 print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ========================================================= */}
        {/* SECTION 1: HERO & BRANDING BANNER (No Print) */}
        {/* ========================================================= */}
        <div className="print:hidden relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white p-6 sm:p-10 shadow-xl border border-emerald-800/40">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-500/30 text-amber-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span>PHU THO AI TRAVEL PLANNER · AI KIẾN TẠO HÀNH TRÌNH</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              Bạn kể về chuyến đi mong muốn.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-200">
                AI biến ý tưởng thành hành trình thực tế.
              </span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Cá nhân hóa theo từng thành viên, tối ưu từng cung đường cao tốc CT05 & QL32, dự toán từng khoản chi và kiểm chứng 100% dữ liệu thực địa từ Ban Quản lý các danh thắng Phú Thọ.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2 text-xs text-emerald-200 font-medium">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Dữ liệu kiểm chứng 100%
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                Chuẩn định tuyến đường bộ
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                Kiểm soát ngân sách sát thực tế
              </span>

              {savedPlans.length > 0 && (
                <button
                  onClick={() => setShowSavedList(!showSavedList)}
                  className="ml-auto flex items-center gap-1.5 text-amber-300 hover:text-white font-semibold underline underline-offset-4 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Hành trình đã lưu ({savedPlans.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SAVED PLANS MODAL / DRAWER (If Open) */}
        {/* ========================================================= */}
        {showSavedList && (
          <div className="print:hidden bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-600" />
                Hành Trình Du Lịch Bạn Đã Lưu
              </h3>
              <button
                onClick={() => setShowSavedList(false)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/80 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {plan.durationLabel}
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm line-clamp-2">{plan.title}</h4>
                    <p className="text-xs text-stone-600">
                      Tổng chi phí: {plan.budget.totalEstimatedVND.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-stone-200 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setCurrentPlan(plan);
                        setShowSavedList(false);
                        onShowToast(`Đã mở lịch trình "${plan.title}"`, 'success');
                      }}
                      className="text-xs font-bold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        await deletePlan(currentUser?.uid, plan.id);
                        const updated = await getUserSavedPlans(currentUser?.uid);
                        setSavedPlans(updated);
                        onShowToast('Đã xóa hành trình', 'info');
                      }}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 2: SMART PLANNER INPUT PANEL (No Print) */}
        {/* ========================================================= */}
        <div className="print:hidden bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
          {/* Conversational Prompt Box */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900">
              Nhập mô tả chuyến đi của bạn (hoặc chọn gợi ý bên dưới)
            </label>

            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Ví dụ: Tôi muốn đưa gia đình 5 người gồm ông bà lớn tuổi và bé 8 tuổi đi Phú Thọ 2 ngày 1 đêm. Đoàn thích cảnh đẹp thiên nhiên, ngâm khoáng nóng thư thái, muốn ăn các món ngon bản địa và ngân sách khoảng 6 triệu đồng..."
                rows={3}
                className="w-full p-4 pr-24 rounded-2xl border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm sm:text-base text-stone-800 placeholder-stone-400 resize-none shadow-2xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleGenerate();
                  }
                }}
              />

              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="absolute right-3 bottom-3.5 px-4 py-2 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Đang lập kế hoạch...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Kiến Tạo Lịch Trình</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Inspiration Prompts Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-500">Gợi ý nhanh theo nhu cầu phổ biến:</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPromptText(prompt);
                      handleGenerate(prompt);
                    }}
                    disabled={isGenerating}
                    className="text-xs text-stone-700 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-stone-200/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-left"
                  >
                    ✨ {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle Advanced Parameters Form */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={() => setShowAdvancedForm(!showAdvancedForm)}
              className="text-xs font-bold text-emerald-900 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>
                {showAdvancedForm ? 'Thu gọn bộ thông số chi tiết' : 'Tùy chỉnh thông số chi tiết (Thành viên, Ngân sách, Nhịp độ, Điểm đến...)'}
              </span>
              {showAdvancedForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <span className="text-[11px] text-stone-400 hidden sm:inline">
              Nhấn Ctrl + Enter để khởi tạo nhanh
            </span>
          </div>

          {/* Advanced Form Collapsible Section */}
          {showAdvancedForm && (
            <div className="pt-4 border-t border-stone-200 space-y-6 animate-in slide-in-from-top-2 text-xs sm:text-sm">
              {/* Row 1: Departure & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Điểm xuất phát</label>
                  <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="Hà Nội, Vĩnh Phúc..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Thời lượng chuyến đi</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { days: 1, label: '1 Ngày' },
                      { days: 2, label: '2N 1Đ' },
                      { days: 3, label: '3N 2Đ' },
                    ].map((d) => (
                      <button
                        key={d.days}
                        type="button"
                        onClick={() => handleDaysChange(d.days)}
                        className={`py-2 text-center rounded-xl font-semibold cursor-pointer border ${
                          daysCount === d.days
                            ? 'bg-emerald-900 text-white border-emerald-900'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Ngày khởi hành (dự kiến)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Row 2: Member Composition */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                  Thành viên tham gia chuyến đi (Cá nhân hóa theo độ tuổi)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-stone-600 font-medium">Người lớn</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-stone-900 w-4 text-center">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-stone-600 font-medium">Trẻ em (&lt; 12 tuổi)</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-stone-900 w-4 text-center">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-stone-600 font-medium">Người cao tuổi (&gt; 60)</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setSeniors(Math.max(0, seniors - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-stone-900 w-4 text-center">{seniors}</span>
                      <button
                        type="button"
                        onClick={() => setSeniors(seniors + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-stone-600 font-medium">Lưu ý sức khỏe / Di chuyển</label>
                    <input
                      type="text"
                      value={specialNeeds}
                      onChange={(e) => setSpecialNeeds(e.target.value)}
                      placeholder="Xe lăn, say xe..."
                      className="w-full px-2.5 py-1.5 mt-1 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Budget Tier & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mức ngân sách dự kiến (VND)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={500000}
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold text-stone-900"
                    />
                    <span className="text-xs font-bold text-stone-500 whitespace-nowrap">VNĐ cả đoàn</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[3000000, 5000000, 8000000, 12000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBudgetAmount(amt)}
                        className="text-[11px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium cursor-pointer"
                      >
                        {(amt / 1000000)}tr
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nhịp độ di chuyển</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'relaxed' as TravelPace, label: 'Thư thái', desc: 'Ít di chuyển' },
                      { id: 'balanced' as TravelPace, label: 'Cân bằng', desc: 'Vừa phải' },
                      { id: 'active' as TravelPace, label: 'Khám phá', desc: 'Đi nhiều điểm' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPace(p.id)}
                        className={`p-2 rounded-xl text-center border cursor-pointer ${
                          pace === p.id
                            ? 'bg-emerald-900 text-white border-emerald-900'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <div className="font-bold text-xs">{p.label}</div>
                        <div className="text-[10px] opacity-80">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Destination Must-Visit Pins */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                  Địa điểm nhất định muốn ghé (Dữ liệu đã kiểm chứng):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {VERIFIED_LOCATIONS.map((loc) => {
                    const isSelected = mustVisitIds.includes(loc.id);
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => toggleMustVisit(loc.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-2xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-emerald-800 border-emerald-800 text-white' : 'border-stone-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-900">{loc.name}</div>
                          <div className="text-[11px] text-stone-500 line-clamp-1">{loc.category} · {loc.district}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Interests & Dislikes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Sở thích trải nghiệm</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Văn hóa & Di sản',
                      'Thiên nhiên sinh thái',
                      'Nghỉ dưỡng Onsen',
                      'Check-in sống ảo',
                      'Ẩm thực dân tộc',
                      'Trekking nhẹ',
                    ].map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                          selectedInterests.includes(interest)
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                            : 'bg-white text-stone-600 border-stone-200'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Điều muốn tránh</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Tránh leo bậc đá dốc',
                      'Tránh chặng xe &gt; 2 giờ',
                      'Tránh quán xá đông đúc',
                      'Tránh hang động trơn trượt',
                    ].map((dislike) => (
                      <button
                        key={dislike}
                        type="button"
                        onClick={() => toggleDislike(dislike)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                          selectedDislikes.includes(dislike)
                            ? 'bg-red-100 text-red-900 border-red-300 font-bold'
                            : 'bg-white text-stone-600 border-stone-200'
                        }`}
                      >
                        {dislike}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* LIVE GENERATION PROGRESS STATE */}
        {/* ========================================================= */}
        {isGenerating && (
          <div className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-lg text-center space-y-4 animate-pulse">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">
              AI Travel Planner đang tính toán...
            </h3>
            <p className="text-sm font-medium text-emerald-800 max-w-lg mx-auto bg-emerald-50 py-2 px-4 rounded-xl border border-emerald-200/60">
              {generatingStep}
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 3: GENERATED ITINERARY PLAN RESULTS */}
        {/* ========================================================= */}
        {currentPlan && !isGenerating && (
          <div id="ai-planner-results" className="space-y-8 animate-in fade-in duration-500">
            {/* Top Plan Hero Bar */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900 text-amber-300">
                      {currentPlan.durationLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {currentPlan.variantLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      Độ khả thi: {currentPlan.feasibilityScore}%
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                    {currentPlan.title}
                  </h2>
                  <p className="text-sm text-stone-600 italic">
                    "{currentPlan.tagline}"
                  </p>
                </div>

                {/* Plan Action Toolbar (No Print) */}
                <div className="print:hidden flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={handleSavePlan}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                      isSaved
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-emerald-900 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>{isSaved ? 'Đã lưu' : 'Lưu vào chuyến đi'}</span>
                  </button>

                  <button
                    onClick={handleCopyTextPlan}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSuccess ? 'Đã sao chép' : 'Sao chép văn bản'}</span>
                  </button>

                  <button
                    onClick={handlePrintPlan}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In / Xuất PDF</span>
                  </button>
                </div>
              </div>

              {/* 3-Variant Switcher Tabs */}
              <div className="print:hidden flex flex-wrap items-center justify-between gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-600 mr-1">Chuyển đổi phương án:</span>
                  <button
                    onClick={() => handleSwitchVariant('optimal')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPlan.variant === 'optimal'
                        ? 'bg-emerald-900 text-white shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    🌟 Phương án Tối Ưu
                  </button>
                  <button
                    onClick={() => handleSwitchVariant('budget')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPlan.variant === 'budget'
                        ? 'bg-emerald-900 text-white shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    💰 Phương án Tiết Kiệm
                  </button>
                  <button
                    onClick={() => handleSwitchVariant('relaxed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPlan.variant === 'relaxed'
                        ? 'bg-emerald-900 text-white shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    🌿 Phương án Thư Thái
                  </button>
                </div>

                <div className="text-[11px] text-stone-500 font-medium">
                  {currentPlan.dataConfidenceSummary}
                </div>
              </div>

              {/* Highlights & Logistics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">Điểm xuất phát</span>
                  <span className="font-bold text-stone-900">{currentPlan.startingPoint}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">Phương tiện khuyên dùng</span>
                  <span className="font-bold text-stone-900">{currentPlan.transportation}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">Tổng chi phí dự toán</span>
                  <span className="font-bold text-emerald-900">
                    {currentPlan.budget.totalEstimatedVND.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">Ước tính / người</span>
                  <span className="font-bold text-emerald-900">
                    {currentPlan.budget.costPerPersonVND.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* INTERACTIVE ROUTE MAP ON LEAFLET & OPENSTREETMAP */}
            {/* ========================================================= */}
            <div className="print:hidden">
              <ItineraryRouteMap
                plan={currentPlan}
                destinations={destinations}
                onSelectDestination={onSelectDestination}
              />
            </div>

            {/* ========================================================= */}
            {/* TIMELINE SECTION (BY DAY) */}
            {/* ========================================================= */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Dòng thời gian chi tiết
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900">
                    Hành trình từng chặng đường
                  </h3>
                </div>

                {/* Day selector tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
                  {currentPlan.days.map((day) => (
                    <button
                      key={day.dayNumber}
                      onClick={() => setSelectedDayNumber(day.dayNumber)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedDayNumber === day.dayNumber
                          ? 'bg-emerald-900 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Ngày {day.dayNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Overview Summary */}
              {currentPlan.days
                .filter((day) => day.dayNumber === selectedDayNumber)
                .map((day) => (
                  <div key={day.dayNumber} className="space-y-6">
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                          Chủ đề: {day.theme}
                        </span>
                        <span className="text-xs font-bold text-emerald-800">
                          Chi phí Ngày {day.dayNumber}: ~{day.dayBudgetVND.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-stone-900">{day.title}</h4>
                      <p className="text-xs text-stone-700 leading-relaxed">{day.summary}</p>
                    </div>

                    {/* Timeline stops */}
                    <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-stone-200">
                      {day.activities.map((act, index) => {
                        const matchedDest = destinations.find((d) => d.id === act.destinationId);

                        return (
                          <div key={act.id || index} className="relative flex items-start gap-4">
                            {/* Step Badge */}
                            <div className="w-7 h-7 rounded-full bg-emerald-900 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-xs">
                              {index + 1}
                            </div>

                            {/* Activity Card */}
                            <div className="flex-1 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-300 transition-all space-y-3">
                              {/* Header */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-stone-100">
                                    {getActivityIcon(act.type)}
                                  </div>
                                  <span className="text-xs font-bold text-emerald-900">
                                    {act.timeSlot}
                                  </span>
                                  {act.travelDistanceKm && act.travelDistanceKm > 0 ? (
                                    <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                                      {act.travelDistanceKm}km ({act.travelDurationMinutes} phút)
                                    </span>
                                  ) : null}
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-stone-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                                    {act.estimatedCostVND === 0
                                      ? 'Miễn phí'
                                      : `${act.estimatedCostVND.toLocaleString('vi-VN')} VNĐ`}
                                  </span>
                                  {act.costVerificationStatus === 'verified' && (
                                    <span
                                      className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold"
                                      title="Đã kiểm chứng nguồn dữ liệu"
                                    >
                                      ✓ Xác thực
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h5 className="text-base font-bold text-stone-900">{act.title}</h5>
                                <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                  <span>{act.locationName}</span>
                                </div>
                              </div>

                              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                                {act.description}
                              </p>

                              {/* Special Tags & Suitability */}
                              <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                                  <strong>Phù hợp:</strong> {act.suitableFor}
                                </span>

                                {act.costNote && (
                                  <span className="text-[11px] text-stone-500 bg-amber-50/50 px-2 py-0.5 rounded-md">
                                    <strong>Chi phí:</strong> {act.costNote}
                                  </span>
                                )}

                                {matchedDest && (
                                  <button
                                    onClick={() => onSelectDestination(matchedDest)}
                                    className="ml-auto text-xs font-bold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Xem chi tiết danh thắng</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Contingency Plan if bad weather */}
                              {act.contingencyPlan && (
                                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                                  <CloudRain className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="block text-[11px] uppercase tracking-wide">
                                      Phương án dự phòng thời tiết:
                                    </strong>
                                    <span>{act.contingencyPlan}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>

            {/* ========================================================= */}
            {/* BUDGET BREAKDOWN & SAVING TIPS */}
            {/* ========================================================= */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
              <div className="space-y-1 pb-4 border-b border-stone-100">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Minh bạch tài chính
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Bảng dự toán ngân sách chi tiết
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1">
                  <span className="text-xs text-stone-500 block">Vận chuyển / Xăng / BOT</span>
                  <span className="text-base font-bold text-stone-900">
                    {currentPlan.budget.breakdown.transportVND.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1">
                  <span className="text-xs text-stone-500 block">Lưu trú / Phòng nghỉ</span>
                  <span className="text-base font-bold text-stone-900">
                    {currentPlan.budget.breakdown.lodgingVND.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1">
                  <span className="text-xs text-stone-500 block">Ăn uống đặc sản</span>
                  <span className="text-base font-bold text-stone-900">
                    {currentPlan.budget.breakdown.diningVND.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1">
                  <span className="text-xs text-stone-500 block">Vé & Trải nghiệm</span>
                  <span className="text-base font-bold text-stone-900">
                    {currentPlan.budget.breakdown.activitiesVND.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1">
                  <span className="text-xs text-stone-500 block">Khoản dự phòng</span>
                  <span className="text-base font-bold text-stone-900">
                    {currentPlan.budget.breakdown.contingencyVND.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Saving tips card */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-amber-700" />
                  <span>Mẹo tiết kiệm chi phí thông minh cho Phú Thọ:</span>
                </div>
                <ul className="text-xs text-stone-700 space-y-1 list-disc list-inside">
                  {currentPlan.budget.savingTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ========================================================= */}
            {/* AI REASONING & TRANSPARENCY CARD */}
            {/* ========================================================= */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>Vì sao AI chọn phương án này? (Minh bạch quyết định)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-700">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900">1. Lý do sắp xếp chuỗi địa điểm:</strong>
                  <p>{currentPlan.aiReasoning.whySelected}</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900">2. Cá nhân hóa cho thành viên đoàn:</strong>
                  <p>{currentPlan.aiReasoning.groupCustomization}</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900">3. Tối ưu định tuyến giao thông:</strong>
                  <p>{currentPlan.aiReasoning.routeOptimizationLogic}</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <strong className="block text-stone-900">4. Tránh điều kiêng kỵ / không thích:</strong>
                  <p>{currentPlan.aiReasoning.dislikeAccommodations}</p>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* PRE-TRIP HANDBOOK & EMERGENCY CONTACTS */}
            {/* ========================================================= */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
              <div className="space-y-1 pb-4 border-b border-stone-100">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Cẩm nang trước chuyến đi
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Hành trang, Quy tắc ứng xử & Liên hệ khẩn cấp
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* Packing list */}
                <div className="space-y-2">
                  <span className="font-bold text-stone-900 uppercase tracking-wide block">
                    Đồ dùng cần mang:
                  </span>
                  <ul className="space-y-1.5 text-stone-700">
                    {currentPlan.handbook.packingList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cultural Etiquette */}
                <div className="space-y-2">
                  <span className="font-bold text-stone-900 uppercase tracking-wide block">
                    Văn hóa & Ứng xử Đất Tổ:
                  </span>
                  <ul className="space-y-1.5 text-stone-700">
                    {currentPlan.handbook.culturalEtiquette.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Emergency Contacts */}
                <div className="space-y-2">
                  <span className="font-bold text-stone-900 uppercase tracking-wide block">
                    Đường dây nóng hỗ trợ du khách:
                  </span>
                  <div className="space-y-2">
                    {currentPlan.handbook.emergencyContacts.map((contact, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                        <div className="font-bold text-stone-900">{contact.name}</div>
                        <div className="text-emerald-800 font-bold">{contact.phone}</div>
                        {contact.address && (
                          <div className="text-[10px] text-stone-500">{contact.address}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* CONVERSATIONAL FOLLOW-UP & REFINE BAR (No Print) */}
            {/* ========================================================= */}
            <div className="print:hidden bg-stone-900 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>Trò chuyện cùng AI để tiếp tục tinh chỉnh lịch trình</span>
              </div>

              {/* Chat history bubbles */}
              {chatHistory.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-emerald-800 text-white rounded-br-none'
                            : 'bg-stone-800 text-stone-200 border border-stone-700 rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick refinement chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Giảm ngân sách xuống 4 triệu',
                  'Nếu hôm đó trời mưa to?',
                  'Bớt đi bộ cho ông bà',
                  'Muốn về sớm hơn 2 tiếng',
                  'Đổi sang nghỉ homestay nhà sàn',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRefine(chip)}
                    disabled={isRefining}
                    className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white px-3 py-1.5 rounded-xl border border-stone-700 transition-all cursor-pointer"
                  >
                    💬 {chip}
                  </button>
                ))}
              </div>

              {/* Input field */}
              <div className="relative">
                <input
                  type="text"
                  value={followUpMsg}
                  onChange={(e) => setFollowUpMsg(e.target.value)}
                  placeholder="Nhập yêu cầu điều chỉnh... Ví dụ: Thay điểm ăn trưa ngày 1 sang quán cá lăng, thêm thời gian tắm khoáng"
                  className="w-full pl-4 pr-24 py-3 rounded-xl bg-stone-800 border border-stone-700 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRefine();
                  }}
                  disabled={isRefining}
                />
                <button
                  onClick={() => handleRefine()}
                  disabled={isRefining || !followUpMsg.trim()}
                  className="absolute right-2 top-2 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  {isRefining ? (
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Gửi</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
