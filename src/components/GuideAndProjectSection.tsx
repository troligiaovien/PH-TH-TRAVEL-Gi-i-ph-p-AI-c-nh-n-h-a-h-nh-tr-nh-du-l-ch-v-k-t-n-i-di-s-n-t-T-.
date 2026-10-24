import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Compass,
  Lightbulb,
  Award,
  Utensils,
  Calendar,
  Users,
  Leaf,
  Sparkles,
  Bookmark,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  Filter,
  FileText,
  Rocket,
  Check,
  Share2
} from 'lucide-react';
import { MAGAZINE_ARTICLES_DATA, ARTICLE_CATEGORIES_CONFIG } from '../data/magazineArticles';
import { TOURISM_PROJECTS_DATA } from '../data/tourismProjects';
import { MagazineArticle, ArticleCategory, TourismProjectProfile } from '../types/magazine';
import { Destination } from '../types';
import { ArticleReaderModal } from './ArticleReaderModal';

interface GuideAndProjectSectionProps {
  destinations?: Destination[];
  onSelectDestination?: (dest: Destination) => void;
  onNavigateToTab?: (tab: 'destinations' | 'map' | 'itineraries' | 'guide') => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onTriggerAiPlannerWithPrompt?: (prompt: string, destinationIds?: string[]) => void;
}

export const GuideAndProjectSection: React.FC<GuideAndProjectSectionProps> = ({
  destinations = [],
  onSelectDestination,
  onNavigateToTab,
  onShowToast,
  onTriggerAiPlannerWithPrompt,
}) => {
  // Main view switcher: 'articles' or 'projects' or 'bookmarks'
  const [activeMainView, setActiveMainView] = useState<'articles' | 'projects' | 'bookmarks'>('articles');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [targetAudienceFilter, setTargetAudienceFilter] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<MagazineArticle | null>(null);

  // Bookmarked articles state (stored in localStorage)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('phutho_bookmarked_articles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (articleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      let updated: string[];
      if (bookmarkedIds.includes(articleId)) {
        updated = bookmarkedIds.filter((id) => id !== articleId);
        onShowToast('Đã bỏ lưu bài viết', 'info');
      } else {
        updated = [...bookmarkedIds, articleId];
        onShowToast('Đã lưu bài viết vào mục Đã lưu!', 'success');
      }
      setBookmarkedIds(updated);
      localStorage.setItem('phutho_bookmarked_articles', JSON.stringify(updated));
    } catch {
      onShowToast('Không thể cập nhật danh sách lưu', 'error');
    }
  };

  // Quick search keywords
  const QUICK_SEARCH_CHIPS = [
    { label: 'Lịch trình', query: 'lịch trình' },
    { label: 'Ẩm thực', query: 'ẩm thực' },
    { label: 'Thịt chua', query: 'thịt chua' },
    { label: 'Đền Hùng', query: 'Đền Hùng' },
    { label: 'Du lịch gia đình', query: 'gia đình' },
    { label: 'Kinh nghiệm tiết kiệm', query: 'tiết kiệm' },
    { label: 'Săn mây Long Cốc', query: 'Long Cốc' },
    { label: 'Hát Xoan', query: 'Hát Xoan' },
  ];

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    return MAGAZINE_ARTICLES_DATA.filter((article) => {
      // Main View Check
      if (activeMainView === 'bookmarks' && !bookmarkedIds.includes(article.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }

      // Target audience filter
      if (targetAudienceFilter !== 'all') {
        if (!article.targetAudience.toLowerCase().includes(targetAudienceFilter.toLowerCase())) {
          return false;
        }
      }

      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = article.title.toLowerCase().includes(q);
        const inSubtitle = article.subtitle.toLowerCase().includes(q);
        const inExcerpt = article.excerpt.toLowerCase().includes(q);
        const inCategory = article.categoryLabel.toLowerCase().includes(q);
        const inSections = article.sections.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            (s.paragraphs || []).some((p) => p.toLowerCase().includes(q))
        );
        return inTitle || inSubtitle || inExcerpt || inCategory || inSections;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, targetAudienceFilter, activeMainView, bookmarkedIds]);

  // Featured hero article
  const featuredArticle = useMemo(() => {
    return MAGAZINE_ARTICLES_DATA.find((a) => a.featured) || MAGAZINE_ARTICLES_DATA[0];
  }, []);

  // Side featured articles (2 articles)
  const sideFeaturedArticles = useMemo(() => {
    return MAGAZINE_ARTICLES_DATA.filter((a) => a.id !== featuredArticle.id).slice(0, 2);
  }, [featuredArticle]);

  return (
    <div className="bg-stone-50 min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ========================================================
            1. HERO SECTION — MAGAZINE COVER & SEARCH HUB
        ======================================================== */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900 text-white p-6 sm:p-12 border border-stone-800 shadow-xl">
          {/* Subtle Ambient Heritage Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="handbook-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
                  <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-emerald-400" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#handbook-pattern)" />
            </svg>
          </div>

          <div className="relative max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TRUNG TÂM TRI THỨC DU LỊCH & NGHIÊN CỨU SỐ</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
              CẨM NANG DU LỊCH PHÚ THỌ
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-stone-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Hiểu sâu vùng đất Tổ. Khám phá trọn vẹn từng hành trình. Nơi tổng hợp hướng dẫn thực chiến, kiến thức di sản đã kiểm chứng và các đề tài sáng tạo du lịch số.
            </p>

            {/* Interactive Search Bar */}
            <div className="pt-2 max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-white/20 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <Search className="w-5 h-5 text-stone-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bạn muốn tìm hiểu điều gì về Phú Thọ? (Đền Hùng, ẩm thực, lịch trình...)"
                  className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg mr-1 cursor-pointer"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  Tìm kiếm
                </button>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[11px] sm:text-xs">
                <span className="text-stone-400 mr-1">Gợi ý tìm kiếm:</span>
                {QUICK_SEARCH_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(chip.query);
                      setActiveMainView('articles');
                    }}
                    className={`px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                      searchQuery.toLowerCase() === chip.query.toLowerCase()
                        ? 'bg-amber-400 text-stone-900 font-bold border-amber-300'
                        : 'bg-white/10 hover:bg-white/20 text-stone-200 border-white/10'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Real Verified Statistical Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 border-t border-white/10 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>
                  <strong className="text-white text-sm sm:text-base font-bold">{MAGAZINE_ARTICLES_DATA.length}</strong> bài viết chuyên sâu
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong className="text-white text-sm sm:text-base font-bold">{ARTICLE_CATEGORIES_CONFIG.length - 1}</strong> chuyên đề du lịch
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-sky-400" />
                <span>
                  <strong className="text-white text-sm sm:text-base font-bold">{TOURISM_PROJECTS_DATA.length}</strong> đề tài & sáng kiến KHKT
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. TOP NAVIGATION BAR (ARTICLES vs PROJECTS vs BOOKMARKS)
        ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-1.5 bg-stone-200/70 p-1.5 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActiveMainView('articles')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMainView === 'articles'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-800" />
              <span>Tạp chí & Cẩm nang ({MAGAZINE_ARTICLES_DATA.length})</span>
            </button>

            <button
              onClick={() => setActiveMainView('projects')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMainView === 'projects'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Rocket className="w-4 h-4 text-amber-600" />
              <span>Dự án & Sáng kiến KHKT ({TOURISM_PROJECTS_DATA.length})</span>
            </button>

            <button
              onClick={() => setActiveMainView('bookmarks')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMainView === 'bookmarks'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bookmark className="w-4 h-4 text-emerald-700" />
              <span>Đã lưu ({bookmarkedIds.length})</span>
            </button>
          </div>

          {/* Quick Audience Filter (When in Articles view) */}
          {activeMainView === 'articles' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">Đối tượng:</span>
              <select
                value={targetAudienceFilter}
                onChange={(e) => setTargetAudienceFilter(e.target.value)}
                className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 font-semibold focus:outline-emerald-800 cursor-pointer shadow-2xs"
              >
                <option value="all">Tất cả đối tượng</option>
                <option value="gia đình">Gia đình & Người cao tuổi</option>
                <option value="bạn trẻ">Bạn trẻ & Phượt thủ</option>
                <option value="văn hóa">Người yêu văn hóa & Học sinh</option>
                <option value="tự túc">Du lịch tự túc</option>
              </select>
            </div>
          )}
        </div>

        {/* ========================================================
            3. VIEW A: ARTICLES & HANDBOOK HUB
        ======================================================== */}
        {activeMainView === 'articles' && (
          <div className="space-y-8">
            {/* Category Filter Horizontal Bar */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-2 min-w-max">
                {ARTICLE_CATEGORIES_CONFIG.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as ArticleCategory)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Article Spotlight (Show when viewing All and no search) */}
            {selectedCategory === 'all' && !searchQuery && targetAudienceFilter === 'all' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-2">
                {/* Main Hero Card (8 cols) */}
                <div
                  onClick={() => setSelectedArticle(featuredArticle)}
                  className="lg:col-span-8 group relative bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-stone-900">
                    <img
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-emerald-950 shadow-xs">
                        BÀI VIẾT NỔI BẬT
                      </span>
                    </div>
                    <button
                      onClick={(e) => toggleBookmark(featuredArticle.id, e)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white backdrop-blur-xs transition-colors"
                      title="Lưu bài viết"
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(featuredArticle.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4 text-white space-y-2">
                      <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                        {featuredArticle.categoryLabel}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-2">
                        {featuredArticle.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {featuredArticle.readingTimeMinutes} phút đọc
                        </span>
                        <span>•</span>
                        <span>Cập nhật: {featuredArticle.lastUpdated}</span>
                      </div>

                      <span className="text-emerald-900 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Đọc ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Side 2 Articles (4 cols) */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-6">
                  {sideFeaturedArticles.map((sideArt) => (
                    <div
                      key={sideArt.id}
                      onClick={() => setSelectedArticle(sideArt)}
                      className="group bg-white p-5 rounded-3xl border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between flex-1"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sideArt.categoryBadgeColor}`}>
                            {sideArt.categoryLabel}
                          </span>
                          <button
                            onClick={(e) => toggleBookmark(sideArt.id, e)}
                            className="text-stone-400 hover:text-amber-600 transition-colors"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(sideArt.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>
                        </div>
                        <h3 className="text-sm font-serif font-bold text-stone-900 group-hover:text-emerald-900 transition-colors line-clamp-2 leading-snug">
                          {sideArt.title}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {sideArt.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 text-[11px] text-stone-400">
                        <span>{sideArt.readingTimeMinutes} phút đọc</span>
                        <span className="text-emerald-900 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Chi tiết</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Magazine Grid of Articles */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-stone-200">
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-800" />
                  <span>
                    {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Tất cả bài viết chuyên sâu'} ({filteredArticles.length})
                  </span>
                </h3>

                {(searchQuery || selectedCategory !== 'all' || targetAudienceFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setTargetAudienceFilter('all');
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Đặt lại bộ lọc
                  </button>
                )}
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-stone-800">Không tìm thấy bài viết phù hợp</h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Thử tìm với từ khóa ngắn hơn như "Đền Hùng", "Long Cốc", "ẩm thực", "lịch trình" hoặc đặt lại bộ lọc.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((art) => (
                    <article
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className="group bg-white rounded-2xl border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xs"
                    >
                      {/* Thumbnail Header */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                        {art.coverImage ? (
                          <img
                            src={art.coverImage}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-950 to-stone-900 flex items-center justify-center text-white text-3xl">
                            📖
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-xs ${art.categoryBadgeColor}`}>
                            {art.categoryLabel}
                          </span>
                        </div>
                        <button
                          onClick={(e) => toggleBookmark(art.id, e)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white backdrop-blur-xs transition-colors"
                          title="Lưu bài viết"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(art.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-serif font-bold text-stone-900 group-hover:text-emerald-900 transition-colors line-clamp-2 leading-snug">
                            {art.title}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                            {art.excerpt}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {art.readingTimeMinutes} phút
                            </span>
                            <span>•</span>
                            <span>{art.difficultyLevel}</span>
                          </div>

                          <span className="text-emerald-900 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>Đọc tiếp</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            4. VIEW B: TOURISM PROJECTS & INNOVATION SHOWCASE
        ======================================================== */}
        {activeMainView === 'projects' && (
          <div className="space-y-8">
            <div className="p-6 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                <Rocket className="w-4 h-4 text-amber-700" />
                <span>Hồ sơ Nghiên cứu KHKT & Sáng kiến Đổi mới Sáng tạo</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Khu vực giới thiệu các đề tài khoa học kỹ thuật, giải pháp chuyển đổi số du lịch và mô hình bảo tồn di sản bền vững được triển khai trên địa bàn tỉnh Phú Thọ. Mọi số liệu và kết quả đều được dẫn nguồn minh bạch, nói không với thành tích ảo.
              </p>
            </div>

            <div className="space-y-6">
              {TOURISM_PROJECTS_DATA.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6 hover:border-emerald-300 transition-all"
                >
                  {/* Project Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-200 pb-5">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                          {proj.categoryLabel}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${proj.statusBadgeColor}`}>
                          {proj.statusLabel}
                        </span>
                        <span className="text-xs text-stone-400">
                          Cập nhật: {proj.lastUpdated}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-snug">
                        {proj.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-emerald-900 font-medium">
                        {proj.tagline}
                      </p>
                    </div>

                    <div className="text-xs text-stone-500 shrink-0 sm:text-right">
                      <span className="block font-semibold text-stone-800">Đơn vị / Nhóm thực hiện:</span>
                      <span>{proj.leadOrganization}</span>
                    </div>
                  </div>

                  {/* Problem & Objectives Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                      <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600" />
                        Vấn đề thực tiễn cần giải quyết
                      </h4>
                      <p className="text-stone-600 leading-relaxed text-xs">
                        {proj.problemAddressed}
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-2">
                      <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-700" />
                        Mục tiêu trọng tâm
                      </h4>
                      <ul className="space-y-1 text-xs text-stone-700 leading-relaxed">
                        {proj.objectives.map((obj, oIdx) => (
                          <li key={oIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-700 font-bold">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Key Components */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      Các phân hệ giải pháp chính
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {proj.keyComponents.map((comp, cIdx) => (
                        <div key={cIdx} className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                          <h5 className="text-xs font-bold text-emerald-950">{comp.title}</h5>
                          <p className="text-[11px] text-stone-600 leading-relaxed">{comp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verified Outcomes & Roadmap */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-stone-100 text-xs">
                    <div className="space-y-2">
                      <h5 className="font-bold text-stone-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        Kết quả đã được kiểm chứng thực tế
                      </h5>
                      <ul className="space-y-1 text-stone-600 pl-2">
                        {proj.verifiedOutcomes.map((out, outIdx) => (
                          <li key={outIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                            <span>{out}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        Lộ trình triển khai (Development Roadmap)
                      </h5>
                      <div className="space-y-1.5">
                        {proj.developmentRoadmap.map((rm, rmIdx) => (
                          <div
                            key={rmIdx}
                            className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                              rm.isCurrent
                                ? 'bg-amber-50/80 border-amber-300 font-semibold text-amber-950'
                                : 'bg-stone-50 border-stone-200 text-stone-600'
                            }`}
                          >
                            <span>{rm.phase} ({rm.timeline}): {rm.goal}</span>
                            {rm.isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-emerald-950 rounded font-bold ml-2">
                                HIỆN TẠI
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Official Sources Footer */}
                  {proj.officialSources && proj.officialSources.length > 0 && (
                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-[11px] text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-stone-700">Nguồn thẩm định:</span>
                        <span>{proj.officialSources[0].title}</span>
                      </div>
                      {proj.officialSources[0].url && (
                        <a
                          href={proj.officialSources[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-800 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <span>Cổng thông tin</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            5. VIEW C: BOOKMARKED ARTICLES
        ======================================================== */}
        {activeMainView === 'bookmarks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-emerald-800" />
                <span>Danh sách bài viết cẩm nang đã lưu ({bookmarkedIds.length})</span>
              </h3>
              {bookmarkedIds.length > 0 && (
                <button
                  onClick={() => {
                    setBookmarkedIds([]);
                    localStorage.removeItem('phutho_bookmarked_articles');
                    onShowToast('Đã xóa toàn bộ danh sách lưu', 'info');
                  }}
                  className="text-xs text-rose-700 hover:underline cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {filteredArticles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3">
                <Bookmark className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="text-base font-bold text-stone-800">Chưa có bài viết nào được lưu</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Khi đọc cẩm nang, bấm vào biểu tượng dấu trang (bookmark) để lưu lại xem sau mà không cần mạng.
                </p>
                <button
                  onClick={() => setActiveMainView('articles')}
                  className="mt-2 px-4 py-2 bg-emerald-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Khám phá các bài viết
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((art) => (
                  <article
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className="group bg-white rounded-2xl border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xs"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => toggleBookmark(art.id, e)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/60 hover:bg-stone-900 text-amber-400 backdrop-blur-xs transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          {art.categoryLabel}
                        </span>
                        <h4 className="text-sm font-serif font-bold text-stone-900 line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {art.excerpt}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                        <span>{art.readingTimeMinutes} phút đọc</span>
                        <span className="text-emerald-900 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Đọc tiếp</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          6. FULL-SCREEN ARTICLE READER MODAL
      ======================================================== */}
      {selectedArticle && (
        <ArticleReaderModal
          article={selectedArticle}
          allArticles={MAGAZINE_ARTICLES_DATA}
          allDestinations={destinations}
          onClose={() => setSelectedArticle(null)}
          onSelectArticle={(art) => setSelectedArticle(art)}
          onSelectDestination={(dest) => {
            setSelectedArticle(null);
            if (onSelectDestination) onSelectDestination(dest);
          }}
          onNavigateToTab={(tab) => {
            setSelectedArticle(null);
            if (onNavigateToTab) onNavigateToTab(tab);
          }}
          onShowToast={onShowToast}
          onTriggerAiPlannerWithPrompt={(prompt, destIds) => {
            setSelectedArticle(null);
            if (onTriggerAiPlannerWithPrompt) {
              onTriggerAiPlannerWithPrompt(prompt, destIds);
            } else if (onNavigateToTab) {
              onNavigateToTab('itineraries');
            }
          }}
        />
      )}
    </div>
  );
};
