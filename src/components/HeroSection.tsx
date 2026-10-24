import React, { useState } from 'react';
import { Search, Compass, MapPin, ArrowRight, X } from 'lucide-react';
import { Destination, AppUISettings } from '../types';

interface HeroSectionProps {
  destinations: Destination[];
  onSelectDestination: (destination: Destination) => void;
  onOpenDigitalMap: () => void;
  uiSettings?: AppUISettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  destinations,
  onSelectDestination,
  onOpenDigitalMap,
  uiSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bgImgError, setBgImgError] = useState(false);

  // Parse title into lines (support multi-line stylized heading)
  const rawTitle = uiSettings?.heroTitle?.trim() || 'CHẠM MIỀN DI SẢN\nMỞ LỐI HÀNH TRÌNH';
  const titleLines = rawTitle.split('\n').filter(Boolean);

  const kicker = uiSettings?.heroKicker || 'CỔNG THÔNG TIN DU LỊCH & DI SẢN THÔNG MINH TỈNH PHÚ THỌ';
  const subtitle = uiSettings?.heroSubtitle || 'Khám phá Đất Tổ Hùng Vương qua lăng kính công nghệ số. Lập lịch trình thông minh, tra cứu di sản văn hóa, ẩm thực danh tiếng và chỉ dẫn bản đồ chính xác.';
  const removeTextBg = uiSettings?.removeTextBg !== false; // Default true: remove blurry background blob
  const fontTheme = uiSettings?.heroFontTheme || 'sharp_gold';
  const heroBgUrl = uiSettings?.heroBgUrl?.trim();
  const overlayOpacity = Math.min(95, Math.max(20, uiSettings?.heroBgOverlayOpacity ?? 65));

  // Determine typography classes based on theme
  const getTitleThemeClass = () => {
    switch (fontTheme) {
      case 'luminous_white':
        return 'text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-100 to-stone-300 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]';
      case 'emerald_modern':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 via-emerald-300 to-amber-200 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]';
      case 'sharp_gold':
      default:
        return 'text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]';
    }
  };

  const filteredSuggestions = searchTerm.trim()
    ? destinations.filter((dest) => {
        const query = searchTerm.toLowerCase();
        return (
          dest.name.toLowerCase().includes(query) ||
          dest.district.toLowerCase().includes(query) ||
          dest.categoryLabel.toLowerCase().includes(query) ||
          dest.shortDescription.toLowerCase().includes(query)
        );
      })
    : [];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-emerald-950/85 to-stone-900 text-stone-100 py-12 sm:py-18 border-b border-stone-800">
      {/* Optional Custom Hero Cover Photo with Smooth Dark Overlay */}
      {heroBgUrl && !bgImgError && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={heroBgUrl}
            alt="Hero Background"
            className="w-full h-full object-cover object-center scale-105 transition-opacity duration-700"
            onError={() => setBgImgError(true)}
          />
          {/* Dynamic dark overlay according to opacity slider */}
          <div
            className="absolute inset-0 bg-stone-950 transition-opacity duration-300"
            style={{ opacity: overlayOpacity / 100 }}
          />
          {/* Top & bottom gentle gradient fades for flawless navbar and tabs blending */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-transparent to-stone-950/90" />
        </div>
      )}

      {/* Radiant Bronze Drum Ambient Glows (Only displayed if removeTextBg is false) */}
      {!removeTextBg && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-amber-500/15 via-emerald-500/20 to-amber-600/10 blur-[100px] pointer-events-none rounded-full animate-pulse-glow" />
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="heritage-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 48 M 0 0 L 48 48" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-500/40" />
                  <circle cx="24" cy="24" r="2" fill="currentColor" className="text-emerald-400/40" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#heritage-grid)" />
            </svg>
          </div>
        </>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Subtle kicker with golden dot */}
        <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-amber-300/90 mb-3.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>{kicker}</span>
        </div>

        {/* Hero Headline: Stylized, Sharp, Professional Typography */}
        <h1 className="font-serif font-black tracking-tight sm:tracking-wider leading-[1.1] sm:leading-[1.12]">
          {titleLines.map((line, idx) => (
            <span
              key={idx}
              className={`block text-3xl sm:text-5xl lg:text-6xl font-serif font-black ${getTitleThemeClass()} ${
                idx > 0 ? 'mt-1 sm:mt-2 text-2xl sm:text-4xl lg:text-5xl tracking-widest sm:tracking-[0.2em] font-extrabold' : ''
              }`}
              style={{
                letterSpacing: idx === 0 ? '-0.02em' : '0.04em',
                textRendering: 'optimizeLegibility'
              }}
            >
              {line}
            </span>
          ))}
        </h1>

        {/* Concise Subtitle with high legibility */}
        <p className="mt-3.5 sm:mt-4 text-xs sm:text-sm text-stone-200/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          {subtitle}
        </p>

        {/* Compact Live Search Bar */}
        <div className="mt-6 sm:mt-7 max-w-lg mx-auto relative text-left">
          <div className="relative flex items-center bg-stone-950/90 border border-stone-700/80 rounded-xl shadow-lg p-1 focus-within:border-amber-400 transition-colors">
            <div className="pl-3 pr-2 text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm nhanh trong 5 danh thắng..."
              className="w-full bg-transparent text-xs text-stone-100 placeholder:text-stone-500 py-1.5 pr-6 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 text-stone-400 hover:text-stone-200"
                aria-label="Xóa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchTerm.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden z-30">
              {filteredSuggestions.length > 0 ? (
                <div className="py-1 divide-y divide-stone-800">
                  {filteredSuggestions.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => {
                        onSelectDestination(dest);
                        setSearchTerm('');
                      }}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-stone-800 transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-stone-100 group-hover:text-amber-400">
                          {dest.name}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {dest.district}
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Xem chi tiết →
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-stone-400">
                  Không tìm thấy địa điểm khớp với "{searchTerm}".
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
