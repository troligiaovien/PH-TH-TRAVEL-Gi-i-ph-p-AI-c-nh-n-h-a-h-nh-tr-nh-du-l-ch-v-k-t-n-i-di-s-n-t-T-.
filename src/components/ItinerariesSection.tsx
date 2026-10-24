import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import {
  Clock,
  Calendar,
  Compass,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Users,
  ChevronRight,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { SuggestedItinerary, Destination } from '../types';
import { SUGGESTED_ITINERARIES } from '../data/itineraries';
import { AITravelPlanner } from './AITravelPlanner';

interface ItinerariesSectionProps {
  destinations: Destination[];
  currentUser?: User | null;
  onSelectDestination: (dest: Destination) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onOpenAuth?: () => void;
  initialPrompt?: string | null;
}

export const ItinerariesSection: React.FC<ItinerariesSectionProps> = ({
  destinations,
  currentUser = null,
  onSelectDestination,
  onShowToast,
  onOpenAuth = () => {},
  initialPrompt = null,
}) => {
  const [plannerMode, setPlannerMode] = useState<'ai' | 'curated'>('ai');
  const [activeDuration, setActiveDuration] = useState<string>('all');
  const [activeTheme, setActiveTheme] = useState<string>('all');
  const [expandedItineraryId, setExpandedItineraryId] = useState<string>(
    SUGGESTED_ITINERARIES[0].id
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItineraries = SUGGESTED_ITINERARIES.filter((it) => {
    if (activeDuration !== 'all' && it.duration !== activeDuration) return false;
    if (activeTheme !== 'all' && it.theme !== activeTheme) return false;
    return true;
  });

  const getDestinationById = (id: string): Destination | undefined => {
    return destinations.find((d) => d.id === id);
  };

  const handleCopyItinerary = (itinerary: SuggestedItinerary) => {
    const textPlan = `HÀNH TRÌNH: ${itinerary.title}\nThời lượng: ${itinerary.durationLabel}\nPhù hợp: ${itinerary.suitableFor}\n\n` +
      itinerary.stops
        .map((s) => {
          const dest = getDestinationById(s.destinationId);
          return `Chặng ${s.order} (${s.timeEstimate}): ${dest?.name || s.destinationId}\n- Hoạt động: ${s.activityTitle}\n- Di chuyển: ${s.recommendedTransport}\n- Vị trí Maps: ${dest?.googleMapsUrl || ''}\n`;
        })
        .join('\n') +
      `\nLưu ý: ${itinerary.advisoryNote}\n(Nguồn: PHÚ THỌ TRAVEL)`;

    navigator.clipboard.writeText(textPlan).then(() => {
      setCopiedId(itinerary.id);
      setTimeout(() => setCopiedId(null), 2500);
      onShowToast(`Đã sao chép lịch trình "${itinerary.title}"`, 'success');
    });
  };

  return (
    <section id="itineraries" className="min-h-screen bg-stone-50 pb-16">
      {/* Top Planner Mode Navigation Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-28 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlannerMode('ai')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                plannerMode === 'ai'
                  ? 'bg-gradient-to-r from-emerald-900 to-emerald-950 text-amber-300 shadow-sm ring-1 ring-emerald-800'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>AI KIẾN TẠO HÀNH TRÌNH (Tự Động)</span>
              <span className="hidden sm:inline text-[10px] bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                Mới
              </span>
            </button>

            <button
              onClick={() => setPlannerMode('curated')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                plannerMode === 'curated'
                  ? 'bg-gradient-to-r from-emerald-900 to-emerald-950 text-white shadow-sm ring-1 ring-emerald-800'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>Lịch trình mẫu tham khảo</span>
            </button>
          </div>

          <div className="text-xs text-stone-500 hidden md:block">
            {plannerMode === 'ai'
              ? 'Tùy chỉnh riêng cho gia đình, nhóm bạn & người cao tuổi'
              : `${SUGGESTED_ITINERARIES.length} Lịch trình mẫu định sẵn`}
          </div>
        </div>
      </div>

      {/* Main Mode View */}
      {plannerMode === 'ai' ? (
        <AITravelPlanner
          destinations={destinations}
          currentUser={currentUser}
          onSelectDestination={onSelectDestination}
          onShowToast={onShowToast}
          onOpenAuth={onOpenAuth}
          initialPrompt={initialPrompt}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          {/* Header */}
          <div className="max-w-3xl mb-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
              <span>Kế hoạch hành trình</span>
              <span aria-hidden="true">·</span>
              <span>Lịch trình mẫu tham khảo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              LỊCH TRÌNH KHÁM PHÁ GỢI Ý
            </h2>
            <p className="mt-3 text-base text-stone-600 leading-relaxed">
              Các cung đường được thiết kế hợp lý theo cung đường di chuyển thực tế từ Hà Nội và trung tâm Việt Trì, tối ưu thời gian và phù hợp cho từng mục đích chuyến đi.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-8 p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs font-semibold text-stone-500 mr-2">Thời lượng:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: '1_day', label: '1 Ngày' },
              { id: '2_days_1_night', label: '2 Ngày 1 Đêm' },
            ].map((dur) => (
              <button
                key={dur.id}
                onClick={() => setActiveDuration(dur.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeDuration === dur.id
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {dur.label}
              </button>
            ))}

            <span className="text-xs font-semibold text-stone-500 ml-4 mr-2">Chủ đề:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'culture', label: 'Lịch sử & Tâm linh' },
              { id: 'nature', label: 'Thiên nhiên sinh thái' },
              { id: 'wellness', label: 'Nghỉ dưỡng' },
            ].map((th) => (
              <button
                key={th.id}
                onClick={() => setActiveTheme(th.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTheme === th.id
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {th.label}
              </button>
            ))}
          </div>

          {/* Itinerary Cards */}
          <div className="space-y-6">
            {filteredItineraries.map((itinerary) => {
              const isExpanded = expandedItineraryId === itinerary.id;

              return (
                <div
                  key={itinerary.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-stone-300 transition-all"
                >
                  {/* Header Summary Bar */}
                  <div
                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/50"
                    onClick={() => setExpandedItineraryId(isExpanded ? '' : itinerary.id)}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                        <span className="text-emerald-900 font-bold">{itinerary.durationLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{itinerary.themeLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-stone-600">{itinerary.suitableFor}</span>
                      </div>

                      <h3 className="text-xl font-serif font-bold text-stone-900">
                        {itinerary.title}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-1">{itinerary.tagline}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyItinerary(itinerary);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        {copiedId === itinerary.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép lịch trình</span>
                          </>
                        )}
                      </button>

                      <button
                        className="px-3.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? 'Thu gọn' : 'Chi tiết các chặng'}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details: Timeline of Stops */}
                  {isExpanded && (
                    <div className="p-6 border-t border-stone-200 space-y-6 animate-in slide-in-from-top-1">
                      <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200">
                        {itinerary.overview}
                      </p>

                      {/* Timeline stops */}
                      <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-stone-200">
                        {itinerary.stops.map((stop) => {
                          const dest = getDestinationById(stop.destinationId);

                          return (
                            <div key={stop.order} className="relative flex items-start gap-4">
                              {/* Step Badge */}
                              <div className="w-7 h-7 rounded-full bg-emerald-900 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-xs">
                                {stop.order}
                              </div>

                              {/* Step Content */}
                              <div className="flex-1 bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{stop.timeEstimate}</span>
                                  </div>

                                  {dest && (
                                    <button
                                      onClick={() => onSelectDestination(dest)}
                                      className="text-xs font-semibold text-stone-800 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>{dest.name}</span>
                                      <span>→</span>
                                    </button>
                                  )}
                                </div>

                                <h4 className="text-sm font-semibold text-stone-900">
                                  {stop.activityTitle}
                                </h4>

                                <p className="text-xs text-stone-600 leading-relaxed">
                                  {stop.description}
                                </p>

                                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                                  <div>
                                    <span className="font-medium text-stone-700">Di chuyển: </span>
                                    {stop.recommendedTransport}
                                  </div>

                                  {dest && (
                                    <a
                                      href={dest.googleMapsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-700 hover:underline inline-flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>Xem trên Google Maps</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Advisory & Pace Note */}
                      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
                        <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-700" />
                          <span>Lưu ý quan trọng cho hành trình:</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed">{itinerary.advisoryNote}</p>
                        <div className="text-stone-500 pt-1">
                          <strong>Cường độ di chuyển:</strong> {itinerary.estimatedPacing}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
