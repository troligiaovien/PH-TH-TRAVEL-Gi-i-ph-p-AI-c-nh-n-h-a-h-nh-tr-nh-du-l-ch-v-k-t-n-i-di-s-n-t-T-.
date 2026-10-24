import type { User } from 'firebase/auth';
import {
  X,
  Bookmark,
  Trash2,
  ExternalLink,
  MapPin,
  Share2,
  Compass,
  ArrowRight,
  Copy,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { Destination } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteIds: string[];
  destinations: Destination[];
  onRemoveFavorite: (id: string) => void;
  onClearAll: () => void;
  onSelectDestination: (dest: Destination) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favoriteIds,
  destinations,
  onRemoveFavorite,
  onClearAll,
  onSelectDestination,
  onShowToast,
  currentUser,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const favoriteDestinations = destinations.filter((d) => favoriteIds.includes(d.id));

  const handleCopyList = () => {
    if (favoriteDestinations.length === 0) return;

    const listText =
      `DANH SÁCH ĐIỂM ĐẾN PHÚ THỌ ĐÃ LƯU (${favoriteDestinations.length} địa điểm):\n\n` +
      favoriteDestinations
        .map(
          (d, idx) =>
            `${idx + 1}. ${d.name} (${d.district})\n- Địa chỉ: ${d.verifiedAddress}\n- Google Maps: ${d.googleMapsUrl}\n`
        )
        .join('\n') +
      `\nNền tảng số: PHÚ THỌ TRAVEL`;

    navigator.clipboard.writeText(listText).then(() => {
      onShowToast('Đã sao chép danh sách yêu thích vào bộ nhớ tạm', 'success');
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-600 fill-amber-500" />
            <h3 className="text-base font-serif font-bold text-stone-900">
              Điểm đến đã lưu ({favoriteDestinations.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {favoriteDestinations.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-100">
                <span className="font-medium text-stone-600">
                  {favoriteDestinations.length} địa điểm trong bộ sưu tập
                </span>
                <button
                  onClick={handleCopyList}
                  className="font-semibold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép danh sách</span>
                </button>
              </div>

              {favoriteDestinations.map((dest) => (
                <div
                  key={dest.id}
                  className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] text-stone-500">
                        {dest.district} · {dest.categoryLabel}
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 mt-0.5">{dest.name}</h4>
                    </div>
                    <button
                      onClick={() => {
                        onRemoveFavorite(dest.id);
                        onShowToast(`Đã bỏ "${dest.name}" khỏi danh sách lưu`, 'info');
                      }}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Bỏ lưu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2">{dest.shortDescription}</p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        onSelectDestination(dest);
                        onClose();
                      }}
                      className="font-semibold text-emerald-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <a
                      href={dest.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-emerald-900 inline-flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Google Maps</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-stone-800">Chưa có địa điểm nào được lưu</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                Bấm vào biểu tượng dải băng lưu trên các thẻ điểm đến để tạo bộ sưu tập hành trình cá nhân của bạn.
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {favoriteDestinations.length > 0 && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách đã lưu?')) {
                  onClearAll();
                  onShowToast('Đã xóa toàn bộ địa điểm đã lưu', 'info');
                }
              }}
              className="text-xs font-semibold text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tất cả</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
