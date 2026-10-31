import React, { useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  MapPin,
  ArrowRight,
  Globe,
  Camera,
  Sparkles,
  Edit3,
  Plus,
  Shield
} from 'lucide-react';
import { Destination } from '../types';
import { CATEGORIES_FILTER_LIST } from '../data/destinations';
import { SwipeablePhotoShowcase } from './SwipeablePhotoShowcase';

import type { User } from 'firebase/auth';

interface DestinationsCatalogProps {
  destinations: Destination[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectDestination: (dest: Destination, tab?: 'overview' | 'gallery' | 'activities' | 'location') => void;
  isAdmin?: boolean;
  onEditDestination?: (dest: Destination) => void;
  onAddNewDestination?: () => void;
  currentUser?: User | null;
}

export const DestinationsCatalog: React.FC<DestinationsCatalogProps> = ({
  destinations,
  favorites,
  onToggleFavorite,
  onSelectDestination,
  isAdmin = false,
  onEditDestination,
  onAddNewDestination,
  currentUser,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = destinations.filter((dest) => {
    if (activeCategory !== 'all' && dest.category !== activeCategory) {
      return false;
    }
    return true;
  });

  const denHungDest = destinations.find((d) => d.id === 'den-hung');

  return (
    <div className="py-10 bg-gradient-to-b from-[#08100d] via-[#0b1612] to-[#060b09] text-stone-100 relative overflow-hidden">
      {/* Soft atmospheric ambient light blooms for depth */}
      <div className="absolute top-12 left-1/4 w-[500px] h-[500px] bg-amber-400/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-emerald-600/15 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header & Clean Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-emerald-950/90 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 tracking-tight drop-shadow-sm">
                {destinations.length} DI TÍCH & DANH THẮNG TIÊU BIỂU
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-amber-300 font-bold border border-emerald-700/80 shadow-2xs">
                Hồ sơ Di sản xác minh
              </span>
              {isAdmin && onAddNewDestination && (
                <button
                  type="button"
                  onClick={onAddNewDestination}
                  className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-xs cursor-pointer border border-amber-300 transition-all"
                  title="Thêm điểm di tích mới (Admin)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm điểm đến</span>
                </button>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Khám phá danh thắng Đất Tổ và dãy Tam Đảo với ảnh bìa thực địa, định vị tọa độ GPS và bộ sưu tập cảnh sắc trọn vẹn.
            </p>
          </div>

          {/* Clean Segmented Category Filters with Inset Depth */}
          <div className="flex items-center gap-1 p-1 bg-[#060a08]/90 rounded-2xl border border-emerald-900/80 shadow-inner overflow-x-auto">
            {CATEGORIES_FILTER_LIST.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-emerald-900 via-emerald-850 to-emerald-900 text-amber-300 shadow-[0_2px_12px_rgba(16,185,129,0.35)] ring-1 ring-amber-400/60'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Destination Cards Grid with Rich Dimensional Depth */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((dest) => {
            const isFavorite = favorites.includes(dest.id);
            const hasGallery = dest.gallery && dest.gallery.length > 0;

            return (
              <div
                key={dest.id}
                data-cursor="Khám phá"
                className="interactive-card bg-gradient-to-b from-[#111c18] via-[#0e1714] to-[#090f0d] rounded-3xl border border-emerald-900/70 hover:border-amber-400/80 overflow-hidden flex flex-col justify-between hover:shadow-[0_25px_60px_rgba(6,78,59,0.4)] transition-all duration-400 group relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-700 before:via-amber-400 before:to-emerald-700 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-400"
              >
                <div>
                  {/* Card Visual Banner WITH REAL COVER PHOTO */}
                  <div
                    onClick={() => onSelectDestination(dest, 'overview')}
                    className="relative aspect-[16/10] bg-stone-900 overflow-hidden flex flex-col justify-between text-white p-5 cursor-pointer rounded-t-3xl"
                  >
                    {dest.coverImage ? (
                      <img
                        src={dest.coverImage}
                        alt={dest.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/den-hung/cover.jpg';
                        }}
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${dest.imagePlaceholder.colorGradient}`}
                      />
                    )}

                    {/* Multi-layered dark gradient vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-stone-950/40 pointer-events-none group-hover:from-stone-950/90 transition-all duration-400" />

                    {/* Top kicker and bookmark button */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-xl bg-stone-950/85 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase text-amber-300 border border-amber-400/40 shadow-sm">
                        {dest.kicker}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(dest.id);
                        }}
                        className={`interactive-btn p-2.5 rounded-full transition-all cursor-pointer ${
                          isFavorite
                            ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-300/80 scale-105'
                            : 'bg-stone-950/70 backdrop-blur-md text-stone-200 hover:bg-amber-400 hover:text-stone-950 hover:scale-105 border border-white/10'
                        }`}
                        title={isFavorite ? 'Bỏ lưu địa điểm' : 'Lưu địa điểm yêu thích'}
                        aria-label="Lưu yêu thích"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    {/* Bottom info on cover photo */}
                    <div className="relative z-10 flex items-end justify-between text-[11px]">
                      <div className="text-white drop-shadow-sm">
                        <span className="text-sm mr-1.5">{dest.imagePlaceholder.symbol}</span>
                        <span className="text-stone-100 text-xs font-semibold">
                          {dest.imagePlaceholder.title}
                        </span>
                      </div>
                      {hasGallery && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDestination(dest, 'gallery');
                          }}
                          className="px-2.5 py-1 rounded-full bg-stone-950/85 backdrop-blur-md text-amber-300 text-[11px] font-bold border border-amber-300/40 hover:bg-amber-400 hover:text-stone-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{dest.gallery?.length} ảnh</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6">
                    {/* Clean Metadata (Zero-pill) */}
                    <div className="flex items-center gap-2 text-xs text-stone-400 mb-2 font-medium">
                      <span className="text-amber-400 font-bold">{dest.district}</span>
                      <span aria-hidden="true" className="text-stone-600">·</span>
                      <span className="text-stone-300">{dest.categoryLabel}</span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSelectDestination(dest, 'overview')}
                      className="text-xl font-serif font-black text-stone-100 group-hover:text-amber-300 transition-colors cursor-pointer tracking-tight"
                    >
                      {dest.name}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-2 text-xs text-stone-300/90 leading-relaxed line-clamp-2">
                      {dest.shortDescription}
                    </p>

                    {/* Mini photo highlight row for destinations with gallery */}
                    {hasGallery && (
                      <div className="mt-3.5 pt-3 border-t border-emerald-950/80">
                        <div className="flex items-center justify-between text-[11px] text-stone-400 mb-2">
                          <span className="font-bold text-amber-300">Góc cảnh sắc nổi bật:</span>
                          <button
                            onClick={() => onSelectDestination(dest, 'gallery')}
                            className="text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>Xem tất cả ({dest.gallery?.length})</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {dest.gallery?.slice(0, 4).map((g) => (
                            <button
                              key={g.id}
                              onClick={() => onSelectDestination(dest, 'gallery')}
                              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#060a08] hover:bg-emerald-950 text-stone-300 hover:text-amber-300 transition-all cursor-pointer border border-emerald-900/80 hover:border-amber-400/50"
                            >
                              {g.tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer with Layered Contrast */}
                <div className="px-6 pb-5 pt-3.5 border-t border-emerald-950/80 flex items-center justify-between gap-2 bg-[#060a08]/90 rounded-b-3xl">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectDestination(dest, 'overview')}
                      data-cursor="Chi tiết"
                      className="interactive-btn group/btn px-4 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.35)] hover:shadow-amber-400/50 border border-amber-300"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-950 group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    {hasGallery && (
                      <button
                        onClick={() => onSelectDestination(dest, 'gallery')}
                        data-cursor="Xem ảnh"
                        className="interactive-btn px-3 py-2 text-xs font-bold text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs hover:border-emerald-500"
                        title="Lướt xem ảnh cảnh đẹp"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ảnh</span>
                      </button>
                    )}

                    {isAdmin && onEditDestination && (
                      <button
                        onClick={() => onEditDestination(dest)}
                        data-cursor="Sửa"
                        className="interactive-btn px-2.5 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-300 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                        title="Chỉnh sửa di tích này (Admin)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={currentUser ? dest.googleMapsUrl : '#'}
                      onClick={(e) => {
                        if (!currentUser) {
                          e.preventDefault();
                          onSelectDestination(dest, 'location');
                        }
                      }}
                      target={currentUser ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-xs font-medium text-stone-200 hover:text-amber-300 bg-stone-900/90 hover:bg-stone-800 border border-stone-800 hover:border-amber-400/40 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                      title={currentUser ? "Mở Google Maps" : "Đăng nhập để xem bản đồ chỉ đường"}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      <span className="hidden sm:inline font-semibold">Maps</span>
                    </a>
                    <a
                      href={currentUser ? dest.googleEarthUrl : '#'}
                      onClick={(e) => {
                        if (!currentUser) {
                          e.preventDefault();
                          onSelectDestination(dest, 'location');
                        }
                      }}
                      target={currentUser ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/80 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                      title={currentUser ? "Xem 3D trên Google Earth" : "Đăng nhập để xem 3D Google Earth"}
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline font-semibold">3D</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 1-SCREEN SWIPEABLE PHOTO SHOWCASE SECTION FOR ĐỀN HÙNG WITH MUSEUM EXHIBITION DEPTH */}
        {denHungDest && denHungDest.gallery && denHungDest.gallery.length > 0 && (
          <div className="mt-16 bg-gradient-to-br from-stone-900 via-stone-950 to-emerald-950 text-white border border-amber-400/35 rounded-3xl p-6 sm:p-9 shadow-2xl relative overflow-hidden" id="den-hung-photo-showcase">
            {/* Ambient decorative lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 blur-[100px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 text-xs font-bold mb-2.5 border border-amber-400/30 backdrop-blur-md">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trải nghiệm ảnh 1 màn hình</span>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-white tracking-tight">
                  LƯỚT NGẮM CẢNH SẮC KHU DI TÍCH LỊCH SỬ ĐỀN HÙNG
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 mt-1.5 leading-relaxed max-w-2xl font-light">
                  Chạm vuốt lướt ngón tay trên màn hình điện thoại hoặc dùng chuột kéo/bấm phím mũi tên để chuyển qua từng góc ảnh linh thiêng.
                </p>
              </div>

              <button
                onClick={() => onSelectDestination(denHungDest, 'gallery')}
                className="interactive-btn px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-stone-950 rounded-xl text-xs font-black self-start sm:self-auto cursor-pointer shadow-lg inline-flex items-center gap-2 transition-all border border-amber-300 shrink-0"
              >
                <span>Mở thư viện ảnh đầy đủ ({denHungDest.gallery.length} ảnh)</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            </div>

            {/* The 1-Screen Swipeable Slider */}
            <div className="relative z-10">
              <SwipeablePhotoShowcase
                images={denHungDest.gallery}
                title="Quần thể Di tích Lịch sử Đền Hùng"
                subtitle="Lướt tay để di chuyển qua từng đền thờ, lăng tẩm và non nước hữu tình"
                onSelectImage={(img) => onSelectDestination(denHungDest, 'gallery')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
