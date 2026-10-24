import React, { useState } from 'react';
import { Sparkles, BookOpen, Clock, CheckCircle, Award, ChevronRight, X } from 'lucide-react';
import { CulturalArticle } from '../types';
import { CULTURAL_ARTICLES } from '../data/culturalHeritage';

export const CultureSection: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<CulturalArticle | null>(null);

  return (
    <section id="culture" className="py-16 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
            <span>Không gian di sản</span>
            <span aria-hidden="true">·</span>
            <span>Văn hóa cội nguồn</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            VĂN HÓA & DI SẢN ĐẤT TỔ
          </h2>
          <p className="mt-3 text-base text-stone-600 leading-relaxed">
            Phú Thọ tự hào là vùng đất cội nguồn sở hữu hai Di sản văn hóa phi vật thể của nhân loại được UNESCO ghi danh, cùng chiều sâu ẩm thực và phong tục trung du nghìn năm.
          </p>
        </div>

        {/* 4 Cultural Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CULTURAL_ARTICLES.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                {/* Header Metadata */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
                  <span className="font-semibold text-emerald-900">{article.categoryLabel}</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                {/* UNESCO Badge if available */}
                {article.unescoRecognition && (
                  <div className="mb-3 p-2.5 bg-amber-50 rounded-lg border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
                    <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-snug">{article.unescoRecognition}</span>
                  </div>
                )}

                <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                  {article.title}
                </h3>

                <p className="mt-2.5 text-xs text-stone-600 leading-relaxed">
                  {article.summary}
                </p>

                {/* Highlights list */}
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5">
                  {article.keyHighlights.slice(0, 2).map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                      <span className="text-emerald-800 font-bold">•</span>
                      <span className="line-clamp-2">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  Nguồn: {article.source}
                </span>

                <button
                  onClick={() => setSelectedArticle(article)}
                  className="px-4 py-2 text-xs font-semibold text-emerald-950 bg-stone-100 hover:bg-emerald-100/70 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Đọc bài viết</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Article Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={() => setSelectedArticle(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-200 flex items-start justify-between bg-stone-50">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  {selectedArticle.categoryLabel}
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-stone-800 text-sm leading-relaxed">
              {selectedArticle.unescoRecognition && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>{selectedArticle.unescoRecognition}</span>
                </div>
              )}

              {selectedArticle.content.map((paragraph, idx) => (
                <p
                  key={idx}
                  className={`text-stone-700 leading-relaxed ${
                    idx === 0
                      ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:text-emerald-950'
                      : ''
                  }`}
                >
                  {paragraph}
                </p>
              ))}

              <div className="pt-4 border-t border-stone-200">
                <h4 className="text-xs uppercase font-bold text-stone-900 tracking-wider mb-2">
                  Điểm nhấn di sản cần lưu ý:
                </h4>
                <ul className="space-y-2">
                  {selectedArticle.keyHighlights.map((hl, i) => (
                    <li key={i} className="text-xs text-stone-700 flex items-start gap-2">
                      <span className="text-emerald-800 font-bold">•</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
                <span>Nguồn nghiên cứu: {selectedArticle.source}</span>
                <span>Kiểm tra: {selectedArticle.lastVerified}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
