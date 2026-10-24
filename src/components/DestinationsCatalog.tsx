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

interface DestinationsCatalogProps {
  destinations: Destination[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectDestination: (dest: Destination, tab?: 'overview' | 'gallery' | 'activities' | 'location') => void;
  isAdmin?: boolean;
  onEditDestination?: (dest: Destination) => void;
  onAddNewDestination?: () => void;
}

export const DestinationsCatalog: React.FC<DestinationsCatalogProps> = ({
  destinations,
  favorites,
  onToggleFavorite,
  onSelectDestination,
  isAdmin = false,
  onEditDestination,
  onAddNewDestination,
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
    <div className="py-8 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Clean Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {destinations.length} ĐIỂM ĐẾN TIÊU BIỂU
              </h2>
              {isAdmin && onAddNewDestination && (
                <button
                  type="button"
                  onClick={onAddNewDestination}
                  className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-xs font-bold rounded-lg inline-flex items-center gap-1 shadow-xs cursor-pointer border border-amber-300 transition-all"
                  title="Thêm điểm di tích mới (Admin)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm điểm đến</span>
                </button>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-stone-600">
              Khám phá danh thắng Đất Tổ và dãy Tam Đảo với ảnh bìa thực tế, định vị và bộ sưu tập cảnh sắc trọn vẹn.
            </p>
          </div>

          {/* Clean Segmented Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES_FILTER_LIST.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-200/80 border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Destination Cards Grid with Smooth Motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((dest) => {
            const isFavorite = favorites.includes(dest.id);
            const hasGallery = dest.gallery && dest.gallery.length > 0;

            return (
              <div
                key={dest.id}
                data-cursor="Khám phá"
                className="interactive-card bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400/80 overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-300 group relative"
              >
                <div>
                  {/* Card Visual Banner WITH REAL COVER PHOTO */}
                  <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden flex flex-col justify-between text-white p-5">
                    {dest.coverImage ? (
                      <img
                        src={dest.coverImage}
                        alt={dest.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${dest.imagePlaceholder.colorGradient}`}
                      />
                    )}

                    {/* Dark gradient vignette for high readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/30 to-stone-950/40 pointer-events-none group-hover:from-stone-950/85 transition-colors duration-300" />

                    {/* Top kicker and bookmark button */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase text-amber-300 border border-amber-400/30 drop-shadow-md">
                        {dest.kicker}
                      </span>

                      <button
                        onClick={() => onToggleFavorite(dest.id)}
                        className={`interactive-btn p-2 rounded-full transition-all cursor-pointer ${
                          isFavorite
                            ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300/60'
                            : 'bg-stone-900/70 backdrop-blur-md text-stone-200 hover:bg-amber-400 hover:text-stone-950'
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
                        <span className="text-stone-100 text-xs font-medium">
                          {dest.imagePlaceholder.title}
                        </span>
                      </div>
                      {hasGallery && (
                        <button
                          onClick={() => onSelectDestination(dest, 'gallery')}
                          className="px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-xs text-amber-300 font-semibold border border-amber-300/40 hover:bg-amber-400 hover:text-stone-900 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Camera className="w-3 h-3" />
                          <span>{dest.gallery?.length} ảnh</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5">
                    {/* Clean Metadata (Zero-pill) */}
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                      <span className="font-medium text-stone-700">{dest.district}</span>
                      <span aria-hidden="true">·</span>
                      <span>{dest.categoryLabel}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-serif font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                      {dest.name}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-2 text-xs text-stone-600 leading-relaxed line-clamp-2">
                      {dest.shortDescription}
                    </p>

                    {/* Mini photo highlight row for destinations with gallery */}
                    {hasGallery && (
                      <div className="mt-3 pt-3 border-t border-stone-100">
                        <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                          <span className="font-semibold text-emerald-950">Góc cảnh sắc nổi bật:</span>
                          <button
                            onClick={() => onSelectDestination(dest, 'gallery')}
                            className="text-emerald-900 font-medium hover:underline cursor-pointer"
                          >
                            Xem tất cả ({dest.gallery?.length} ảnh)
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dest.gallery?.slice(0, 4).map((g) => (
                            <button
                              key={g.id}
                              onClick={() => onSelectDestination(dest, 'gallery')}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 transition-colors cursor-pointer border border-stone-200"
                            >
                              {g.tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectDestination(dest, 'overview')}
                      data-cursor="Chi tiết"
                      className="interactive-btn group/btn px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-900 to-emerald-950 hover:from-emerald-800 hover:to-emerald-900 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm hover:shadow-emerald-900/30"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    {hasGallery && (
                      <button
                        onClick={() => onSelectDestination(dest, 'gallery')}
                        data-cursor="Xem ảnh"
                        className="interactive-btn px-3 py-2 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 hover:border-emerald-300"
                        title="Lướt xem ảnh cảnh đẹp"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-800" />
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
                      href={dest.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:text-emerald-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      title="Mở Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                      <span className="hidden sm:inline">Maps</span>
                    </a>
                    <a
                      href={dest.googleEarthUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      title="Xem 3D trên Google Earth"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="hidden sm:inline">3D</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 1-SCREEN SWIPEABLE PHOTO SHOWCASE SECTION FOR ĐỀN HÙNG */}
        {denHungDest && denHungDest.gallery && denHungDest.gallery.length > 0 && (
          <div className="mt-14 pt-10 border-t border-stone-200" id="den-hung-photo-showcase">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold mb-2">
                  <Camera className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Trải nghiệm ảnh 1 màn hình</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  LƯỚT NGẮM CẢNH SẮC KHU DI TÍCH LỊCH SỬ ĐỀN HÙNG
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Chạm vuốt lướt ngón tay trên màn hình hoặc dùng chuột kéo/bấm phím mũi tên để chuyển qua từng góc ảnh linh thiêng.
                </p>
              </div>

              <button
                onClick={() => onSelectDestination(denHungDest, 'gallery')}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold self-start sm:self-auto cursor-pointer shadow-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Mở thư viện ảnh đầy đủ ({denHungDest.gallery.length} ảnh)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* The 1-Screen Swipeable Slider */}
            <SwipeablePhotoShowcase
              images={denHungDest.gallery}
              title="Quần thể Di tích Lịch sử Đền Hùng"
              subtitle="Lướt tay để di chuyển qua từng đền thờ, lăng tẩm và non nước hữu tình"
              onSelectImage={(img) => onSelectDestination(denHungDest, 'gallery')}
            />
          </div>
        )}
      </div>
    </div>
  );
};
