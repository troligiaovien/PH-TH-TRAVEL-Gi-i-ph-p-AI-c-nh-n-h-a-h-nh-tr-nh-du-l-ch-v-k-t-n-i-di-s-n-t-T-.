import React, { useState } from 'react';
import {
  Compass,
  Bus,
  ShieldCheck,
  Sun,
  MapPin,
  CheckCircle2,
  ChevronDown,
  Info
} from 'lucide-react';
import { TRAVEL_GUIDE_ARTICLES } from '../data/travelGuides';

export const TravelHandbookSection: React.FC = () => {
  const [activeArticleIndex, setActiveArticleIndex] = useState<number>(0);

  const currentArticle = TRAVEL_GUIDE_ARTICLES[activeArticleIndex];

  return (
    <section id="guides" className="py-16 bg-stone-100/60 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
            <span>Cẩm nang thực tế</span>
            <span aria-hidden="true">·</span>
            <span>Kinh nghiệm du khách</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            CẨM NANG DU LỊCH ĐẤT TỔ
          </h2>
          <p className="mt-3 text-base text-stone-600 leading-relaxed">
            Tổng hợp hướng dẫn di chuyển, quy tắc ứng xử văn minh nơi di tích và thời điểm trải nghiệm đẹp nhất để chuyến đi của bạn diễn ra an toàn, trọn vẹn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Handbook Topic Selectors (Col 4) */}
          <div className="lg:col-span-4 space-y-3">
            {TRAVEL_GUIDE_ARTICLES.map((article, idx) => (
              <button
                key={article.id}
                onClick={() => setActiveArticleIndex(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeArticleIndex === idx
                    ? 'bg-emerald-950 text-white border-emerald-900 shadow-sm'
                    : 'bg-white text-stone-800 hover:bg-stone-50 border-stone-200'
                }`}
              >
                <div>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      activeArticleIndex === idx ? 'text-amber-400' : 'text-emerald-800'
                    }`}
                  >
                    {article.categoryLabel}
                  </span>
                  <h4 className="text-sm font-bold mt-1 line-clamp-1">{article.title}</h4>
                </div>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    activeArticleIndex === idx ? '-rotate-90 text-amber-400' : 'text-stone-400'
                  }`}
                />
              </button>
            ))}

            {/* Practical Quick Checklist Box */}
            <div className="p-4 bg-white rounded-xl border border-stone-200 text-xs space-y-2 mt-6">
              <h5 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                <span>3 Mẹo tra cứu bản đồ không sợ lạc</span>
              </h5>
              <p className="text-stone-600 leading-relaxed">
                1. Tải trước khu vực offline trên Google Maps cho các cung đường huyện Tân Sơn (VQG Xuân Sơn) nơi sóng di động có thể chập chờn.
              </p>
              <p className="text-stone-600 leading-relaxed">
                2. Kiểm tra kỹ nút giao cao tốc: IC7 (TP. Việt Trì, Đền Hùng), IC8 (Phù Ninh), IC11 (Hạ Hòa, Đền Mẫu Âu Cơ).
              </p>
              <p className="text-stone-600 leading-relaxed">
                3. Luôn tôn trọng biển báo và người dân bản địa khi cần hỏi thăm lối mòn vào đồi chè hoặc bản làng.
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Guide Reader (Col 8) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                {currentArticle.categoryLabel}
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                {currentArticle.title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mt-2 bg-stone-50 p-3 rounded-lg border border-stone-100">
                {currentArticle.summary}
              </p>
            </div>

            {/* Steps Breakdown */}
            <div className="space-y-4">
              {currentArticle.steps.map((step, sIdx) => (
                <div key={sIdx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/40">
                  <h4 className="text-sm font-bold text-stone-900 mb-1.5">{step.heading}</h4>
                  <p className="text-xs text-stone-700 leading-relaxed">{step.details}</p>
                </div>
              ))}
            </div>

            {/* Important Notice */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Lưu ý quan trọng: </span>
                <span>{currentArticle.importantNotice}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-stone-400">
              Nguồn tham khảo: {currentArticle.source}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
