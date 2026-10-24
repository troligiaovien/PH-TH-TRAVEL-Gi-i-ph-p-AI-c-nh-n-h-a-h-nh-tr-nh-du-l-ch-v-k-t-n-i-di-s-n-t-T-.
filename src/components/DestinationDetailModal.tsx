import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bookmark,
  Share2,
  ExternalLink,
  Globe,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Compass,
  Calendar,
  Sparkles,
  Check,
  MessageSquare,
  Info,
  Car,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  Layers,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { Destination, GalleryImage } from '../types';
import { DestinationMiniMap } from './DestinationMiniMap';

interface DestinationDetailModalProps {
  destination: Destination | null;
  allDestinations: Destination[];
  initialTab?: 'overview' | 'gallery' | 'activities' | 'location';
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onSelectRelated: (dest: Destination) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  isAdmin?: boolean;
  onEditDestination?: (dest: Destination) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  allDestinations,
  initialTab = 'overview',
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelectRelated,
  onShowToast,
  isAdmin = false,
  onEditDestination,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'activities' | 'location'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeGalleryTag, setActiveGalleryTag] = useState<string>('all');
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  const [userPhotos, setUserPhotos] = useState<GalleryImage[]>([]);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);

  // New photo form state
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoSubtitle, setNewPhotoSubtitle] = useState('');
  const [newPhotoTag, setNewPhotoTag] = useState('Ảnh đóng góp');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync tab with initialTab when destination changes
  useEffect(() => {
    if (destination) {
      setActiveTab(initialTab);
      // Load user photos from localStorage
      try {
        const stored = localStorage.getItem(`custom_photos_${destination.id}`);
        if (stored) {
          setUserPhotos(JSON.parse(stored));
        } else {
          setUserPhotos([]);
        }
      } catch {
        setUserPhotos([]);
      }
    }
  }, [destination, initialTab]);

  if (!destination) return null;

  // Combine default gallery with user-added photos
  const combinedGallery: GalleryImage[] = [
    ...userPhotos,
    ...(destination.gallery || [])
  ];

  // Extract distinct tags for filtering
  const galleryTags = ['all', ...Array.from(new Set(combinedGallery.map((img) => img.tag)))];

  const filteredGallery = combinedGallery.filter((img) => {
    if (activeGalleryTag === 'all') return true;
    return img.tag === activeGalleryTag;
  });

  // Find related destinations in the remaining 4 places
  const relatedDestinations = allDestinations
    .filter((d) => d.id !== destination.id)
    .slice(0, 3);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${destination.name} | PHÚ THỌ TRAVEL`,
      text: destination.shortDescription,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        onShowToast('Đã chia sẻ địa điểm thành công', 'success');
      } catch {
        // User cancelled or unsupported
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${destination.name} - ${destination.googleMapsUrl}`);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
        onShowToast('Đã sao chép liên kết vào bộ nhớ tạm', 'success');
      } catch {
        onShowToast('Không thể sao chép liên kết', 'error');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Kích thước ảnh tối đa là 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setNewPhotoPreview(result);
      setNewPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle.trim()) {
      onShowToast('Vui lòng nhập tên ảnh hoặc góc cảnh đẹp', 'error');
      return;
    }

    const newPhoto: GalleryImage = {
      id: `user-photo-${Date.now()}`,
      title: newPhotoTitle.trim(),
      subtitle: newPhotoSubtitle.trim() || 'Ảnh do du khách đóng góp',
      description: newPhotoDesc.trim() || 'Khoảnh khắc ghi lại tại danh thắng Đền Hùng.',
      tag: newPhotoTag || 'Ảnh đóng góp',
      tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      location: destination.name,
      photographerOrSource: 'Du khách đóng góp',
      url: newPhotoUrl || undefined,
      colorGradient: 'from-amber-900 via-stone-900 to-emerald-950',
      symbol: '📷',
      architecturalStyle: 'Góc nhìn thực tế',
      bestViewTime: 'Thời điểm chụp tự do',
      isUserUploaded: true,
    };

    const updated = [newPhoto, ...userPhotos];
    setUserPhotos(updated);
    try {
      localStorage.setItem(`custom_photos_${destination.id}`, JSON.stringify(updated));
    } catch {
      // storage quota
    }

    // Reset form
    setNewPhotoTitle('');
    setNewPhotoSubtitle('');
    setNewPhotoDesc('');
    setNewPhotoUrl('');
    setNewPhotoPreview(null);
    setIsAddPhotoOpen(false);
    onShowToast('Đã thêm ảnh vào bộ sưu tập thành công!', 'success');
  };

  const handleDeleteUserPhoto = (id: string) => {
    const updated = userPhotos.filter((p) => p.id !== id);
    setUserPhotos(updated);
    try {
      localStorage.setItem(`custom_photos_${destination.id}`, JSON.stringify(updated));
      onShowToast('Đã xóa ảnh khỏi bộ sưu tập', 'info');
    } catch {
      // ignore
    }
  };

  const handlePrevLightbox = () => {
    if (lightboxImageIndex === null) return;
    setLightboxImageIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : filteredGallery.length - 1;
    });
  };

  const handleNextLightbox = () => {
    if (lightboxImageIndex === null) return;
    setLightboxImageIndex((prev) => {
      if (prev === null) return null;
      return prev < filteredGallery.length - 1 ? prev + 1 : 0;
    });
  };

  const currentLightboxImage = lightboxImageIndex !== null ? filteredGallery[lightboxImageIndex] : null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-4 sm:my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top Header Ribbon & Quick Actions */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {isAdmin && onEditDestination && (
            <button
              onClick={() => onEditDestination(destination)}
              className="px-3 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs rounded-full shadow-md flex items-center gap-1.5 cursor-pointer border border-amber-300 transition-colors"
              title="Chỉnh sửa di tích này (Admin)"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-950" />
              <span className="hidden sm:inline">Sửa di tích</span>
            </button>
          )}

          <button
            onClick={() => onToggleFavorite(destination.id)}
            className={`p-2.5 rounded-full shadow-md transition-colors cursor-pointer ${
              isFavorite
                ? 'bg-amber-500 text-white'
                : 'bg-white/90 text-stone-700 hover:bg-white hover:text-stone-900'
            }`}
            title={isFavorite ? 'Bỏ lưu' : 'Lưu vào mục yêu thích'}
            aria-label="Lưu yêu thích"
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 bg-white/90 text-stone-700 hover:bg-white hover:text-stone-900 rounded-full shadow-md transition-colors cursor-pointer"
            title="Chia sẻ liên kết"
            aria-label="Chia sẻ liên kết"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2.5 bg-white/90 text-stone-700 hover:bg-white hover:text-stone-900 rounded-full shadow-md transition-colors cursor-pointer"
            title="Đóng cửa sổ"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Visual Banner */}
        <div
          className={`relative aspect-[21/9] sm:aspect-[24/7] bg-gradient-to-br ${destination.imagePlaceholder.colorGradient} p-6 sm:p-7 flex flex-col justify-end text-white overflow-hidden`}
        >
          {/* Subtle background decoration */}
          <div className="absolute inset-0 bg-stone-950/20 mix-blend-multiply pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 drop-shadow-xs mb-1">
              <span>{destination.kicker}</span>
              <span aria-hidden="true">·</span>
              <span>{destination.district}</span>

              {combinedGallery.length > 0 && (
                <button
                  onClick={() => setActiveTab('gallery')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white text-[11px] font-medium border border-white/20 transition-colors ml-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                  <span>{combinedGallery.length} ảnh cảnh đẹp & di tích</span>
                </button>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white drop-shadow-sm">
              {destination.name}
            </h2>
          </div>
          <div className="absolute top-4 left-4 text-3xl opacity-80">
            {destination.imagePlaceholder.symbol}
          </div>
          <div className="absolute bottom-2 right-4 text-[10px] text-stone-300/80 italic hidden sm:block">
            {destination.imagePlaceholder.caption}
          </div>
        </div>

        {/* Streamlined Tab Switcher (Includes Gallery tab) */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-50 overflow-x-auto gap-2 shrink-0">
          {[
            { id: 'overview', label: 'Thông tin chi tiết' },
            {
              id: 'gallery',
              label: `Bộ sưu tập cảnh đẹp ${combinedGallery.length > 0 ? `(${combinedGallery.length})` : ''}`,
              icon: Camera
            },
            { id: 'activities', label: 'Trải nghiệm nổi bật' },
            { id: 'location', label: 'Vị trí & Bản đồ số' },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'border-emerald-800 text-emerald-950 font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-stone-700 leading-relaxed">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 1. Giới thiệu chung */}
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-700" />
                  Giới thiệu chung
                </h4>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 leading-relaxed text-sm">
                  {destination.fullDescription}
                </div>
              </div>

              {/* Lịch sử và giá trị văn hóa */}
              {destination.historicalValue && (
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-amber-700" />
                    Lịch sử và giá trị văn hóa
                  </h4>
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 text-stone-800 leading-relaxed text-sm">
                    {destination.historicalValue}
                  </div>
                </div>
              )}

              {/* BỘ SƯU TẬP ẢNH CẢNH ĐẸP NỔI BẬT PREVIEW (Đặc sắc cho Đền Hùng) */}
              {combinedGallery.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-700" />
                      Không gian cảnh sắc & Kiến trúc tiêu biểu
                    </h4>
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="text-xs font-semibold text-emerald-900 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem toàn bộ {combinedGallery.length} ảnh</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {combinedGallery.slice(0, 4).map((photo, pIdx) => (
                      <div
                        key={photo.id}
                        onClick={() => {
                          setActiveTab('gallery');
                          setLightboxImageIndex(pIdx);
                        }}
                        className="group relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                      >
                        <div
                          className={`aspect-[4/3] bg-gradient-to-br ${photo.colorGradient} p-3 flex flex-col justify-between text-white relative`}
                        >
                          {photo.url ? (
                            <img
                              src={photo.url}
                              alt={photo.title}
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/den-hung/cover.jpg';
                              }}
                            />
                          ) : (
                            <>
                              <div className="text-2xl">{photo.symbol}</div>
                              <div className="text-[10px] font-semibold tracking-wider uppercase text-amber-200">
                                {photo.tag}
                              </div>
                            </>
                          )}
                          <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="p-1.5 rounded-full bg-white/90 text-stone-900">
                              <ZoomIn className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-white">
                          <h5 className="text-xs font-semibold text-stone-900 line-clamp-1 group-hover:text-emerald-800 transition-colors">
                            {photo.title}
                          </h5>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            {photo.subtitle || photo.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Không gian và điểm nổi bật */}
              {destination.spatialHighlights && destination.spatialHighlights.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-950 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    Không gian và điểm nổi bật
                  </h4>
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/70 space-y-2.5">
                    {destination.spatialHighlights.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-800 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Những địa điểm nổi bật (Tây Thiên) */}
              {destination.prominentSpots && destination.prominentSpots.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-950 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    Những địa điểm nổi bật
                  </h4>
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/70 space-y-3">
                    {destination.prominentSpotsIntro && (
                      <p className="text-xs font-medium text-stone-800 italic mb-2">
                        {destination.prominentSpotsIntro}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {destination.prominentSpots.map((spot, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-emerald-200/60 shadow-2xs">
                          <div className="text-xs font-bold text-emerald-950 mb-1">{spot.name}</div>
                          <div className="text-xs text-stone-700 leading-relaxed">{spot.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Cảnh quan và trải nghiệm */}
              {destination.landscapeExperience && (
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-700" />
                    Cảnh quan và trải nghiệm
                  </h4>
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70 text-stone-800 leading-relaxed text-sm">
                    {destination.landscapeExperience}
                  </div>
                </div>
              )}

              {/* Ý nghĩa và sức hấp dẫn */}
              {destination.culturalSignificance && (
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-purple-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    Ý nghĩa và sức hấp dẫn
                  </h4>
                  <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/70 text-stone-800 leading-relaxed text-sm">
                    {destination.culturalSignificance}
                  </div>
                </div>
              )}

              {/* Thời điểm tham quan & Lưu ý dịch vụ */}
              {destination.visitingTimeNote && (
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    Thời điểm tham quan & Thông tin dịch vụ
                  </h4>
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 text-stone-800 leading-relaxed text-sm">
                    {destination.visitingTimeNote}
                  </div>
                </div>
              )}

              {/* Giá trị du lịch & Nghỉ dưỡng */}
              {destination.tourismValue && (
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-sky-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-700" />
                    Giá trị du lịch & Nghỉ dưỡng
                  </h4>
                  <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-200/70 text-stone-800 leading-relaxed text-sm">
                    {destination.tourismValue}
                  </div>
                </div>
              )}

              {/* Đánh giá của khách tham quan */}
              {destination.visitorFeedback && destination.visitorFeedback.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    Đánh giá của khách tham quan
                  </h4>
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-2.5">
                    {destination.visitorFeedback.map((rev, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-800 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{rev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Điều nên biết */}
              {destination.mustKnows && destination.mustKnows.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-amber-950 mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-700" />
                    Điều nên biết
                  </h4>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/90 space-y-2.5">
                    {destination.mustKnows.map((know, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-800 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-700 mt-1.5 shrink-0" />
                        <span>{know}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fast Facts: Distance & Best time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-stone-500">Thời điểm thích hợp</div>
                    <div className="text-xs font-medium text-stone-900 mt-0.5">
                      {destination.bestTimeToVisit}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-stone-500">Khoảng cách trung tâm</div>
                    <div className="text-xs font-medium text-stone-900 mt-0.5">
                      Cách TP. Việt Trì khoảng {destination.distanceFromVietTriKm} km
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEDICATED PHOTO GALLERY & SCENERY SHOWCASE */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              {/* Header & Add Photo CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-800" />
                    <span>Bộ sưu tập hình ảnh danh thắng {destination.name}</span>
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Toàn bộ không gian cảnh sắc, các đền cổ kính, lăng tẩm và non nước hữu tình được sắp xếp theo tuyến dâng hương.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddPhotoOpen(true)}
                  className="px-3.5 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm ảnh mới</span>
                </button>
              </div>

              {/* Add Photo Expandable Form Drawer */}
              {isAddPhotoOpen && (
                <form
                  onSubmit={handleSavePhoto}
                  className="p-5 bg-stone-50 rounded-2xl border border-emerald-300 shadow-sm space-y-4 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-emerald-700" />
                      Đóng góp hình ảnh cảnh đẹp
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddPhotoOpen(false)}
                      className="text-stone-400 hover:text-stone-700 text-xs p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Tên góc ảnh / Điểm danh thắng *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Hoàng hôn trên Đền Thượng"
                        value={newPhotoTitle}
                        onChange={(e) => setNewPhotoTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Phân loại / Vị trí
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Đỉnh núi Nghĩa Lĩnh, Đền Giếng, Rừng thông..."
                        value={newPhotoSubtitle}
                        onChange={(e) => setNewPhotoSubtitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-emerald-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Tải ảnh từ máy tính / điện thoại
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-900 hover:file:bg-emerald-200 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Hoặc dán URL ảnh trực tiếp
                      </label>
                      <input
                        type="url"
                        placeholder="https://domain.com/photo.jpg"
                        value={newPhotoUrl}
                        onChange={(e) => {
                          setNewPhotoUrl(e.target.value);
                          setNewPhotoPreview(e.target.value);
                        }}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-emerald-800"
                      />
                    </div>
                  </div>

                  {newPhotoPreview && (
                    <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-stone-200 bg-stone-900">
                      <img
                        src={newPhotoPreview}
                        alt="Xem trước"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 text-[10px] text-white">
                        Ảnh xem trước
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Mô tả cảnh đẹp / Cảm nhận
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả nét đẹp kiến trúc, không khí thiêng liêng hoặc lưu ý khi chụp ảnh tại đây..."
                      value={newPhotoDesc}
                      onChange={(e) => setNewPhotoDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-emerald-800"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddPhotoOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-200 rounded-lg cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                    >
                      Lưu vào bộ sưu tập
                    </button>
                  </div>
                </form>
              )}

              {/* Tag Filters */}
              {galleryTags.length > 2 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {galleryTags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveGalleryTag(t)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        activeGalleryTag === t
                          ? 'bg-emerald-900 text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 border border-stone-200'
                      }`}
                    >
                      {t === 'all' ? `Tất cả (${combinedGallery.length})` : t}
                    </button>
                  ))}
                </div>
              )}

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGallery.map((photo, index) => {
                  return (
                    <div
                      key={photo.id}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Visual Container */}
                        <div
                          className={`relative aspect-[16/10] bg-gradient-to-br ${photo.colorGradient} p-5 flex flex-col justify-between text-white overflow-hidden`}
                        >
                          {photo.url ? (
                            <img
                              src={photo.url}
                              alt={photo.title}
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/den-hung/cover.jpg';
                              }}
                            />
                          ) : (
                            <>
                              <div className="relative z-10 flex items-center justify-between">
                                <span className="px-2.5 py-1 rounded-md bg-stone-900/60 backdrop-blur-xs text-[10px] font-semibold uppercase tracking-wider text-amber-200 border border-white/10">
                                  {photo.tag}
                                </span>
                                <span className="text-xs text-stone-300 font-mono">
                                  #{index + 1}
                                </span>
                              </div>

                              <div className="relative z-10 my-auto text-center py-2">
                                <div className="text-4xl mb-1 drop-shadow-sm">
                                  {photo.symbol}
                                </div>
                                <div className="text-xs font-semibold text-stone-100/90">
                                  {photo.location}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Hover Overlay with Lightbox trigger */}
                          <div
                            onClick={() => setLightboxImageIndex(index)}
                            className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
                          >
                            <span className="px-3.5 py-2 rounded-xl bg-white/95 text-stone-900 text-xs font-semibold shadow-lg flex items-center gap-2">
                              <ZoomIn className="w-4 h-4 text-emerald-800" />
                              <span>Xem chi tiết & Phóng to</span>
                            </span>
                          </div>

                          {photo.url && (
                            <div className="relative z-10 flex items-center justify-between">
                              <span className="px-2.5 py-1 rounded-md bg-stone-900/70 backdrop-blur-xs text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                                {photo.tag}
                              </span>
                            </div>
                          )}

                          <div className="relative z-10 text-[10px] text-stone-200/90 italic flex items-center justify-between">
                            <span>{photo.photographerOrSource || 'Ảnh tư liệu'}</span>
                            {photo.bestViewTime && (
                              <span className="hidden sm:inline-block">✨ {photo.bestViewTime}</span>
                            )}
                          </div>
                        </div>

                        {/* Photo Card Body */}
                        <div className="p-4 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-serif font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                                {photo.title}
                              </h4>
                              {photo.subtitle && (
                                <p className="text-xs font-medium text-emerald-850 mt-0.5">
                                  {photo.subtitle}
                                </p>
                              )}
                            </div>

                            {photo.isUserUploaded && (
                              <button
                                onClick={() => handleDeleteUserPhoto(photo.id)}
                                className="p-1.5 text-stone-400 hover:text-red-600 rounded-md transition-colors"
                                title="Xóa ảnh này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-stone-600 leading-relaxed">
                            {photo.description}
                          </p>

                          {photo.architecturalStyle && (
                            <div className="text-[11px] text-stone-500 pt-1 flex items-center gap-1.5 border-t border-stone-100">
                              <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="line-clamp-1">{photo.architecturalStyle}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Photo Card Footer */}
                      <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-700" />
                          <span>{photo.location}</span>
                        </span>

                        <button
                          onClick={() => setLightboxImageIndex(index)}
                          className="font-semibold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Xem ảnh</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-900 mb-2">
                Trải nghiệm du khách không nên bỏ lỡ
              </h4>
              <div className="divide-y divide-stone-100 bg-stone-50 rounded-xl border border-stone-200 p-2">
                {destination.activities.map((activity, index) => (
                  <div key={index} className="py-3 px-3 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 shadow-xs">
                      {index + 1}
                    </span>
                    <span className="text-xs text-stone-800 font-medium leading-relaxed">{activity}</span>
                  </div>
                ))}
              </div>

              {destination.tips && destination.tips.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Mẹo hữu ích khi trải nghiệm
                  </h4>
                  <div className="space-y-2">
                    {destination.tips.map((tip, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-stone-800 flex items-start gap-2.5">
                        <span className="text-amber-700 font-bold shrink-0">•</span>
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LOCATION & DIGITAL MAP */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900">Địa chỉ xác minh: </span>
                    <span className="text-stone-700">{destination.verifiedAddress}</span>
                  </div>
                </div>
                <div className="text-xs text-stone-500 font-mono pl-6">
                  Tọa độ GPS: {destination.latitude.toFixed(4)}°B, {destination.longitude.toFixed(4)}°Đ
                </div>
              </div>

              {/* Interactive Mini Leaflet Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-600 font-semibold px-1">
                  <span>Bản đồ vị trí tương tác (OpenStreetMap)</span>
                  <span className="text-emerald-800 font-bold">Thu phóng & Di chuyển tự do</span>
                </div>
                <DestinationMiniMap destination={destination} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={destination.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-between shadow-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Mở chỉ đường trên Google Maps
                  </span>
                  <span>↗</span>
                </a>

                <a
                  href={destination.googleEarthUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-between shadow-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Khám phá địa hình 3D Earth
                  </span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          )}

          {/* Related Destinations */}
          {relatedDestinations.length > 0 && (
            <div className="pt-4 border-t border-stone-200">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
                Các điểm đến khác trong danh sách
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {relatedDestinations.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="p-3 text-left bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors cursor-pointer group"
                  >
                    <div className="text-[10px] text-stone-500">{rel.district}</div>
                    <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-900 transition-colors mt-0.5 line-clamp-1">
                      {rel.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verification Source & Date Footer */}
          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Nguồn xác minh: {destination.source}</span>
            </div>
            <div>Cập nhật: {destination.lastVerified}</div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => setActiveTab('gallery')}
            className="text-xs font-semibold text-emerald-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Xem bộ sưu tập {combinedGallery.length} góc cảnh đẹp</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {currentLightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImageIndex(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-800 text-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Controls */}
            <div className="p-4 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-900/80 text-emerald-200 text-xs font-semibold">
                  {currentLightboxImage.tag}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {lightboxImageIndex! + 1} / {filteredGallery.length}
                </span>
              </div>

              <button
                onClick={() => setLightboxImageIndex(null)}
                className="p-2 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Image Preview Area */}
            <div className="relative aspect-video bg-stone-950 flex items-center justify-center overflow-hidden">
              {currentLightboxImage.url ? (
                <img
                  src={currentLightboxImage.url}
                  alt={currentLightboxImage.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/den-hung/cover.jpg';
                  }}
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${currentLightboxImage.colorGradient} flex flex-col items-center justify-center p-8 text-center`}
                >
                  <div className="text-6xl mb-3 drop-shadow-md">
                    {currentLightboxImage.symbol}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white max-w-lg">
                    {currentLightboxImage.title}
                  </h3>
                  <p className="text-sm text-stone-200 mt-1 max-w-md">
                    {currentLightboxImage.subtitle || currentLightboxImage.location}
                  </p>
                </div>
              )}

              {/* Prev / Next Buttons */}
              <button
                onClick={handlePrevLightbox}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white shadow-lg transition-colors cursor-pointer"
                title="Ảnh trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextLightbox}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white shadow-lg transition-colors cursor-pointer"
                title="Ảnh kế tiếp"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Details Panel */}
            <div className="p-5 bg-stone-900 space-y-3">
              <div>
                <h4 className="text-base font-serif font-bold text-white">
                  {currentLightboxImage.title}
                </h4>
                <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentLightboxImage.location}</span>
                  {currentLightboxImage.architecturalStyle && (
                    <>
                      <span>·</span>
                      <span>{currentLightboxImage.architecturalStyle}</span>
                    </>
                  )}
                </p>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {currentLightboxImage.description}
              </p>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800">
                <span>Nguồn: {currentLightboxImage.photographerOrSource || 'Khu Di tích Đền Hùng'}</span>
                {currentLightboxImage.bestViewTime && (
                  <span className="text-amber-300 font-medium">
                    Thời điểm đẹp: {currentLightboxImage.bestViewTime}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
