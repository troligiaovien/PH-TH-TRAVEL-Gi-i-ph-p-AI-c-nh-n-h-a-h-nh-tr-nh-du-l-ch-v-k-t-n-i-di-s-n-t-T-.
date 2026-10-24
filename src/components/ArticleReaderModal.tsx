import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  Calendar,
  Share2,
  Printer,
  Copy,
  Check,
  Bookmark,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Sparkles,
  MapPin,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  FileText,
  User,
  Compass,
  Lightbulb
} from 'lucide-react';
import { MagazineArticle } from '../types/magazine';
import { Destination } from '../types';

interface ArticleReaderModalProps {
  article: MagazineArticle | null;
  allArticles: MagazineArticle[];
  allDestinations: Destination[];
  onClose: () => void;
  onSelectArticle: (article: MagazineArticle) => void;
  onSelectDestination: (dest: Destination) => void;
  onNavigateToTab: (tab: 'destinations' | 'map' | 'itineraries' | 'guide') => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onTriggerAiPlannerWithPrompt?: (prompt: string, destinationIds?: string[]) => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  article,
  allArticles,
  allDestinations,
  onClose,
  onSelectArticle,
  onSelectDestination,
  onNavigateToTab,
  onShowToast,
  onTriggerAiPlannerWithPrompt,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check and sync bookmark state
  useEffect(() => {
    if (!article) return;
    try {
      const saved = localStorage.getItem('phutho_bookmarked_articles');
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        setIsBookmarked(ids.includes(article.id));
      } else {
        setIsBookmarked(false);
      }
    } catch {
      setIsBookmarked(false);
    }

    // Scroll to top when opening a new article
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }
  }, [article]);

  // Track reading scroll progress & active TOC heading
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el || !article) return;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight > 0) {
      const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      setReadingProgress(progress);
    }

    // Determine current section in view
    for (let i = article.sections.length - 1; i >= 0; i--) {
      const sec = article.sections[i];
      const headingEl = document.getElementById(`article-sec-${sec.id}`);
      if (headingEl) {
        const rect = headingEl.getBoundingClientRect();
        if (rect.top <= 200) {
          setActiveSectionId(sec.id);
          break;
        }
      }
    }
  };

  if (!article) return null;

  const toggleBookmark = () => {
    try {
      const saved = localStorage.getItem('phutho_bookmarked_articles');
      let ids: string[] = saved ? JSON.parse(saved) : [];
      if (ids.includes(article.id)) {
        ids = ids.filter((id) => id !== article.id);
        setIsBookmarked(false);
        onShowToast('Đã bỏ lưu bài viết', 'info');
      } else {
        ids.push(article.id);
        setIsBookmarked(true);
        onShowToast('Đã lưu cẩm nang vào danh sách đọc lại!', 'success');
      }
      localStorage.setItem('phutho_bookmarked_articles', JSON.stringify(ids));
    } catch {
      onShowToast('Không thể lưu trạng thái bài viết', 'error');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${article.title} | PHU THO AI TRAVEL`,
      text: article.excerpt,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        onShowToast('Đã chia sẻ bài viết thành công', 'success');
      } catch {
        // User dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${article.title}\n${window.location.href}`);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
        onShowToast('Đã sao chép liên kết bài viết vào bộ nhớ tạm', 'success');
      } catch {
        onShowToast('Không thể sao chép liên kết', 'error');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    const headingEl = document.getElementById(`article-sec-${id}`);
    if (headingEl) {
      headingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Find related destinations objects
  const relatedDests = allDestinations.filter((d) =>
    article.relatedDestinationIds.includes(d.id)
  );

  // Find related articles objects
  const relatedArticles = allArticles.filter(
    (a) => a.id !== article.id && article.relatedArticleIds.includes(a.id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-700 z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Main Modal Card */}
      <div className="bg-white w-full h-full sm:h-[95vh] sm:max-w-6xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Sticky Top Header Bar with Breadcrumb and Actions */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-stone-200 bg-white/95 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-500 overflow-hidden text-ellipsis whitespace-nowrap">
            <button
              onClick={onClose}
              className="text-stone-700 hover:text-emerald-900 font-semibold cursor-pointer"
            >
              Cẩm nang du lịch
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-emerald-900 font-medium truncate max-w-[200px] sm:max-w-[400px]">
              {article.categoryLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={toggleBookmark}
              title={isBookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Đã lưu' : 'Lưu bài'}</span>
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              title="Chia sẻ bài viết"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Đã sao chép' : 'Chia sẻ'}</span>
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              title="In bài viết"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer hidden md:flex items-center gap-1.5 text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer ml-1"
              aria-label="Đóng bài viết"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Reader Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-stone-50/60"
        >
          {/* Article Hero Banner */}
          <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 text-white overflow-hidden py-10 sm:py-14 px-4 sm:px-8 border-b border-stone-800">
            {article.coverImage && (
              <img
                src={article.coverImage}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
              />
            )}
            <div className="relative max-w-4xl mx-auto space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${article.categoryBadgeColor}`}>
                  {article.categoryLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-stone-300 bg-stone-800/80 px-2.5 py-0.5 rounded-full border border-stone-700">
                  <Clock className="w-3 h-3 text-amber-300" />
                  {article.readingTimeMinutes} phút đọc
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-stone-300 bg-stone-800/80 px-2.5 py-0.5 rounded-full border border-stone-700">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  Cập nhật: {article.lastUpdated}
                </span>
                <span className="text-xs text-amber-300 font-medium bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800">
                  {article.difficultyLevel}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
                {article.title}
              </h1>

              <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-normal">
                {article.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 border-t border-stone-800">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>Biên tập: <strong className="text-stone-200 font-semibold">{article.editor}</strong></span>
                </div>
                <div>
                  Đối tượng: <span className="text-stone-300 font-medium">{article.targetAudience}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Article Main Grid: TOC (Left Sidebar) + Body (Right) */}
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Sticky Table of Contents (Desktop) */}
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-6 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950 border-b border-stone-200 pb-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-800" />
                  <span>Mục lục bài viết</span>
                </div>

                <nav className="space-y-1 text-xs">
                  {article.tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-all cursor-pointer leading-snug flex items-start gap-2 ${
                        activeSectionId === item.id
                          ? 'bg-emerald-50 text-emerald-950 font-bold border-l-3 border-emerald-800'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                    </button>
                  ))}
                </nav>

                {/* Quick AI Itinerary CTA Card */}
                {article.suggestedAiPrompt && (
                  <div className="p-4 bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-xl space-y-2 border border-emerald-800 shadow-xs mt-4">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Áp dụng vào thực tế</span>
                    </div>
                    <p className="text-[11px] text-stone-200 leading-relaxed">
                      Sử dụng trí tuệ nhân tạo để lên kế hoạch theo các gợi ý của bài viết này.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        if (onTriggerAiPlannerWithPrompt) {
                          onTriggerAiPlannerWithPrompt(article.suggestedAiPrompt!, article.relatedDestinationIds);
                        } else {
                          onNavigateToTab('itineraries');
                        }
                      }}
                      className="w-full mt-1 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Tạo lịch trình AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </aside>

            {/* Right Column: Article Deep Content */}
            <main className="lg:col-span-8 space-y-8">
              {/* Key Takeaways Box */}
              {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                <div className="p-5 sm:p-6 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm tracking-tight">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <span>Điểm cốt lõi cần nhớ (Key Takeaways)</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-stone-800 leading-relaxed">
                    {article.keyTakeaways.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mobile Table of Contents Accordion */}
              <div className="block lg:hidden p-4 bg-white rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800 mb-2">
                  <BookOpen className="w-4 h-4 text-emerald-800" />
                  <span>Mục lục nội dung</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {article.tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-left py-1 text-emerald-900 hover:underline flex items-center gap-1.5"
                    >
                      <span>•</span>
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Render Article Sections */}
              <div className="space-y-8 text-stone-800 leading-relaxed">
                {article.sections.map((section) => (
                  <section
                    key={section.id}
                    id={`article-sec-${section.id}`}
                    className="scroll-mt-24 space-y-4 pt-2"
                  >
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 border-b border-stone-200 pb-2">
                      {section.title}
                    </h2>

                    {/* Paragraphs */}
                    {section.paragraphs && section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-sm sm:text-base leading-relaxed text-stone-700">
                        {p}
                      </p>
                    ))}

                    {/* Bullet Points if present */}
                    {section.bulletPoints && section.bulletPoints.length > 0 && (
                      <div className="space-y-3 pt-1">
                        {section.bulletPoints.map((b, bIdx) => (
                          <div key={bIdx} className="p-3.5 bg-white rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                            <h4 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-800" />
                              {b.heading}
                            </h4>
                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pl-3">
                              {b.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Checklist if present */}
                    {section.checklist && section.checklist.length > 0 && (
                      <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 space-y-2">
                        {section.checklist.map((c, cIdx) => (
                          <div key={cIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-800">
                            <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comparison Table if present */}
                    {section.comparisonTable && (
                      <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs bg-white my-3">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-stone-100 text-stone-900 border-b border-stone-200 font-bold">
                            <tr>
                              {section.comparisonTable.headers.map((h, hIdx) => (
                                <th key={hIdx} className="p-3 whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200">
                            {section.comparisonTable.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-stone-50">
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`p-3 text-stone-700 ${
                                      cIdx === 0 ? 'font-semibold text-stone-900 bg-stone-50/50' : ''
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Callout Box if present */}
                    {section.callout && (
                      <div
                        className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${
                          section.callout.type === 'warning'
                            ? 'bg-amber-50 text-amber-950 border-amber-300'
                            : section.callout.type === 'tip'
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                            : 'bg-sky-50 text-sky-950 border-sky-300'
                        }`}
                      >
                        {section.callout.type === 'warning' ? (
                          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4 className="font-bold mb-0.5">{section.callout.title}</h4>
                          <p>{section.callout.text}</p>
                        </div>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Practical Advice Section */}
              {article.practicalAdvice && article.practicalAdvice.length > 0 && (
                <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-base border-b border-stone-200 pb-3">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    <span>Kinh nghiệm thực tế (Lời khuyên có cơ sở)</span>
                  </div>
                  <div className="space-y-4">
                    {article.practicalAdvice.map((adv, aIdx) => (
                      <div key={aIdx} className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                        <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                          {adv.tip}
                        </h4>
                        <div className="text-xs text-stone-700 leading-relaxed pl-2 border-l-2 border-amber-400 space-y-1">
                          <p>
                            <strong className="text-stone-900">Vì sao hữu ích:</strong> {adv.why}
                          </p>
                          <p>
                            <strong className="text-stone-900">Cách áp dụng:</strong> {adv.howToApply}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-Trip Checklist Box */}
              {article.preTripChecklist && article.preTripChecklist.length > 0 && (
                <div className="p-6 bg-amber-50/60 rounded-2xl border border-amber-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-sm tracking-tight">
                    <CheckCircle2 className="w-5 h-5 text-amber-700" />
                    <span>Thông tin cần kiểm tra trước chuyến đi</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-stone-800 leading-relaxed">
                    {article.preTripChecklist.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verified Sources Box */}
              {article.verifiedSources && article.verifiedSources.length > 0 && (
                <div className="p-5 bg-stone-100 rounded-2xl border border-stone-200 space-y-3 text-xs text-stone-700">
                  <div className="flex items-center gap-2 font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    <span>Nguồn tham khảo đã kiểm chứng</span>
                  </div>
                  <div className="space-y-2">
                    {article.verifiedSources.map((src, sIdx) => (
                      <div key={sIdx} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-2 bg-white rounded-lg border border-stone-200">
                        <div>
                          <span className="font-semibold text-stone-900">{src.name}</span>
                          <span className="text-stone-500"> — {src.publisher}</span>
                          <p className="text-[11px] text-stone-500 italic mt-0.5">{src.verifiedNote}</p>
                        </div>
                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-800 hover:text-emerald-950 font-semibold inline-flex items-center gap-1 shrink-0 mt-1 sm:mt-0"
                          >
                            <span>Truy cập</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Ecosystem CTAs */}
              <div className="p-6 bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 rounded-2xl text-white space-y-4 shadow-md">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Hệ sinh thái PHU THO AI TRAVEL
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold">
                    Biến cẩm nang này thành kế hoạch thực tế cho bạn
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300">
                    Bạn không cần phải tự tính toán cự ly hay thời gian. Trợ lý AI và Bản đồ số sẵn sàng đồng hành.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {article.suggestedAiPrompt && (
                    <button
                      onClick={() => {
                        onClose();
                        if (onTriggerAiPlannerWithPrompt) {
                          onTriggerAiPlannerWithPrompt(article.suggestedAiPrompt!, article.relatedDestinationIds);
                        } else {
                          onNavigateToTab('itineraries');
                        }
                      }}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Tạo lịch trình từ cẩm nang này</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab('map');
                    }}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Xem vị trí trên bản đồ số</span>
                  </button>
                </div>

                {/* Related destination chips */}
                {relatedDests.length > 0 && (
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-stone-400">Các điểm đến được nhắc đến:</span>
                    {relatedDests.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => {
                          onClose();
                          onSelectDestination(dest);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <MapPin className="w-3 h-3 text-amber-300" />
                        <span>{dest.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Related Articles Showcase */}
              {relatedArticles.length > 0 && (
                <div className="pt-6 border-t border-stone-200 space-y-4">
                  <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-800" />
                    <span>Bài viết liên quan nên đọc</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedArticles.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => onSelectArticle(rel)}
                        className="p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                            {rel.categoryLabel}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 hover:text-emerald-900 transition-colors">
                            {rel.title}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                            {rel.excerpt}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-3 mt-2 border-t border-stone-100">
                          <span>{rel.readingTimeMinutes} phút đọc</span>
                          <span className="text-emerald-800 font-semibold inline-flex items-center gap-1">
                            Đọc tiếp <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
