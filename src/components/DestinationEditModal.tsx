import React, { useState, useRef } from 'react';
import {
  X,
  Save,
  Trash2,
  Plus,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  AlertCircle,
  UploadCloud,
  Eye,
  Star,
  CheckCircle2
} from 'lucide-react';
import { Destination, DestinationCategory, GalleryImage } from '../types';
import { CATEGORIES_FILTER_LIST } from '../data/destinations';
import { optimizeImageFile, formatBytes, sanitizeImageTitle } from '../lib/imageUtils';
import { deleteGalleryPhotoFromCloud } from '../lib/firebase';

interface DestinationEditModalProps {
  isOpen: boolean;
  destination: Destination | null;
  onClose: () => void;
  onSave: (dest: Destination) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const DestinationEditModal: React.FC<DestinationEditModalProps> = ({
  isOpen,
  destination,
  onClose,
  onSave,
  onDelete,
}) => {
  const isNew = !destination;

  const [formData, setFormData] = useState<Destination>(() => {
    if (destination) return JSON.parse(JSON.stringify(destination));
    return {
      id: `di-tich-${Date.now().toString(36)}`,
      slug: `di-tich-${Date.now().toString(36)}`,
      name: '',
      kicker: '',
      category: 'history_culture',
      categoryLabel: 'Lịch sử & Di sản',
      district: 'Phú Thọ',
      shortDescription: '',
      fullDescription: '',
      historicalValue: '',
      activities: ['Tham quan, vãn cảnh', 'Chụp ảnh lưu niệm'],
      verifiedAddress: 'Tỉnh Phú Thọ',
      latitude: 21.3,
      longitude: 105.3,
      googleMapsUrl: 'https://maps.google.com',
      googleEarthUrl: 'https://earth.google.com',
      bestTimeToVisit: 'Quanh năm',
      tips: ['Mặc trang phục lịch sự khi viếng thăm đền chùa'],
      imagePlaceholder: {
        title: 'Di tích Phú Thọ',
        caption: 'Cảnh sắc Đất Tổ',
        colorGradient: 'from-emerald-900 to-amber-950',
        symbol: '🏛️'
      },
      coverImage: '/images/den-hung/cover.jpg',
      gallery: [],
      source: 'Ban Quản trị Phú Thọ Travel',
      lastVerified: new Date().toLocaleDateString('vi-VN'),
      distanceFromVietTriKm: 15
    };
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'descriptions' | 'gallery' | 'location'>('general');
  const [newActivity, setNewActivity] = useState('');
  const [newTip, setNewTip] = useState('');

  // Gallery item form state
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDesc, setGalleryDesc] = useState('');
  const [galleryTag, setGalleryTag] = useState('');
  const [galleryUrl, setGalleryUrl] = useState('');

  // Batch upload state
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [previewGalleryImage, setPreviewGalleryImage] = useState<GalleryImage | null>(null);

  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle batch file upload from computer
  const handleBatchGalleryFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Vui lòng chọn các tệp định dạng hình ảnh (JPG, PNG, WebP).');
      return;
    }

    setIsBatchProcessing(true);
    const newItems: GalleryImage[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const { dataUrl } = await optimizeImageFile(file, 1600, 0.86);
        const title = sanitizeImageTitle(file.name);
        newItems.push({
          id: `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          title,
          description: `Hình ảnh tư liệu thực tế ${title}`,
          tag: 'Tư liệu ảnh',
          tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          url: dataUrl,
          colorGradient: 'from-emerald-900 to-stone-900',
          symbol: '📸',
          photographerOrSource: 'Ban Quản trị'
        });
      } catch (err: any) {
        console.error('Lỗi khi nén ảnh:', file.name, err);
      }
    }

    setIsBatchProcessing(false);

    if (newItems.length > 0) {
      setFormData((prev) => {
        // If current cover is default or empty, auto set the first uploaded image
        let updatedCover = prev.coverImage;
        if (!updatedCover || updatedCover.includes('default') || updatedCover.includes('placeholder')) {
          updatedCover = newItems[0].url;
        }
        return {
          ...prev,
          coverImage: updatedCover,
          gallery: [...(prev.gallery || []), ...newItems]
        };
      });
    }
  };

  // Handle direct single cover image file upload from computer
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const { dataUrl } = await optimizeImageFile(file, 1600, 0.86);
        setFormData((prev) => ({
          ...prev,
          coverImage: dataUrl
        }));
      } catch (err: any) {
        alert(`Không thể đọc ảnh: ${err.message || err}`);
      }
    }
  };

  const handleSetAsCover = (imageUrl?: string) => {
    if (!imageUrl) return;
    setFormData((prev) => ({
      ...prev,
      coverImage: imageUrl
    }));
  };

  const handleCategoryChange = (catId: DestinationCategory) => {
    const found = CATEGORIES_FILTER_LIST.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      category: catId,
      categoryLabel: found?.label || 'Danh lam'
    }));
  };

  const handleAddActivity = () => {
    if (!newActivity.trim()) return;
    setFormData((prev) => ({
      ...prev,
      activities: [...(prev.activities || []), newActivity.trim()]
    }));
    setNewActivity('');
  };

  const handleRemoveActivity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  const handleAddTip = () => {
    if (!newTip.trim()) return;
    setFormData((prev) => ({
      ...prev,
      tips: [...(prev.tips || []), newTip.trim()]
    }));
    setNewTip('');
  };

  const handleRemoveTip = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tips: prev.tips.filter((_, i) => i !== index)
    }));
  };

  const handleAddGalleryItem = () => {
    if (!galleryTitle.trim()) return;
    const newImage: GalleryImage = {
      id: `img-${Date.now().toString(36)}`,
      title: galleryTitle.trim(),
      description: galleryDesc.trim() || 'Hình ảnh tư liệu di tích',
      tag: galleryTag.trim() || 'Cảnh quan',
      tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      url: galleryUrl.trim() || undefined,
      colorGradient: 'from-emerald-900 to-stone-900',
      symbol: '📸',
      photographerOrSource: 'Ban Quản trị'
    };

    setFormData((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), newImage]
    }));

    setGalleryTitle('');
    setGalleryDesc('');
    setGalleryTag('');
    setGalleryUrl('');
  };

  const handleRemoveGalleryItem = (id: string) => {
    if (formData.id) {
      deleteGalleryPhotoFromCloud(formData.id, id).catch((e) => {
        console.warn('Could not delete subcollection photo:', e);
      });
    }
    setFormData((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((g) => g.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên di tích / điểm đến.');
      return;
    }
    setSaving(true);
    try {
      try {
        const customKey = `custom_photos_${formData.id}`;
        localStorage.setItem(customKey, JSON.stringify(formData.gallery || []));
      } catch (e) {}

      await onSave(formData);
      onClose();
    } catch (err: any) {
      alert(`Lỗi khi lưu: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 tracking-wider uppercase">
                Quyền Quản Trị Viên (Admin)
              </span>
              <h3 className="font-serif text-lg font-bold">
                {isNew ? 'Thêm Điểm Đến Mới' : `Chỉnh Sửa: ${destination.name}`}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 py-2 gap-2 shrink-0 overflow-x-auto">
          {[
            { id: 'general', label: 'Thông tin chung' },
            { id: 'descriptions', label: 'Mô tả & Lịch sử' },
            { id: 'gallery', label: `Bộ sưu tập ảnh (${formData.gallery?.length || 0})` },
            { id: 'location', label: 'Vị trí & Chỉ đường' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tên điểm di tích / danh thắng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Đền Mẫu Âu Cơ Hạ Hòa"
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Khẩu hiệu / Kicker
                  </label>
                  <input
                    type="text"
                    value={formData.kicker}
                    onChange={(e) => setFormData({ ...formData, kicker: e.target.value })}
                    placeholder="VD: Thánh Mẫu Vùng Đất Tổ"
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Phân loại danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value as DestinationCategory)}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden bg-white"
                  >
                    <option value="history_culture">Lịch sử & Di sản</option>
                    <option value="nature_ecology">Thiên nhiên & Sinh thái</option>
                    <option value="resort_wellness">Nghỉ dưỡng & Khoáng nóng</option>
                    <option value="community_craft">Làng nghề & Cộng đồng</option>
                    <option value="family_leisure">Vui chơi & Gia đình</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Huyện / Thị xã / Thành phố
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="VD: Huyện Hạ Hòa, Phú Thọ"
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Cover Image URL or Computer Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">
                    Ảnh bìa đại diện (Cover Image)
                  </label>
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300 transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Tải ảnh từ máy tính</span>
                  </button>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverFileUpload}
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.coverImage || ''}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://... hoặc tải trực tiếp từ máy tính"
                    className="flex-1 text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden font-mono"
                  />
                  {formData.coverImage && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 shrink-0">
                      <img
                        src={formData.coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Bạn có thể bấm <b>"Tải ảnh từ máy tính"</b> để chọn tệp trực tiếp, hoặc nhập đường dẫn URL ảnh trực tuyến.
                </p>
              </div>

              {/* Best time to visit */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Thời điểm du lịch đẹp nhất
                </label>
                <input
                  type="text"
                  value={formData.bestTimeToVisit}
                  onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                  placeholder="VD: Mùa xuân từ tháng 1 đến tháng 3 âm lịch"
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              {/* Activities */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Các hoạt động trải nghiệm đặc sắc
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddActivity();
                      }
                    }}
                    placeholder="Nhập hoạt động rồi nhấn Thêm..."
                    className="flex-1 text-xs px-3 py-2 border border-stone-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(formData.activities || []).map((act, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-md border border-stone-200"
                    >
                      {act}
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(idx)}
                        className="text-stone-400 hover:text-red-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'descriptions' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mô tả ngắn (Hiển thị ngoài danh mục thẻ) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Mô tả tóm lược 2-3 câu về di tích..."
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mô tả chi tiết và quy mô
                </label>
                <textarea
                  rows={4}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Thông tin chi tiết về không gian, cảnh quan, kiến trúc..."
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Giá trị lịch sử & văn hóa (UNESCO, truyền thuyết, xếp hạng)
                </label>
                <textarea
                  rows={3}
                  value={formData.historicalValue}
                  onChange={(e) => setFormData({ ...formData, historicalValue: e.target.value })}
                  placeholder="Di tích quốc gia đặc biệt, truyền thuyết dân tộc, giá trị văn hóa ngàn đời..."
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              {/* Tips for visitors */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Lưu ý & Hướng dẫn dành cho du khách
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTip}
                    onChange={(e) => setNewTip(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTip();
                      }
                    }}
                    placeholder="VD: Nên chuẩn bị giày thể thao, ăn mặc kín đáo..."
                    className="flex-1 text-xs px-3 py-2 border border-stone-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddTip}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm
                  </button>
                </div>
                <div className="space-y-1">
                  {(formData.tips || []).map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg text-xs"
                    >
                      <span>• {tip}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTip(idx)}
                        className="text-stone-400 hover:text-red-600 text-xs cursor-pointer ml-2"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {/* Batch Upload Zone from Computer */}
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingGallery(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleBatchGalleryFiles(e.dataTransfer.files);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingGallery(true);
                }}
                onDragLeave={() => setIsDraggingGallery(false)}
                onClick={() => galleryFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDraggingGallery
                    ? 'border-emerald-600 bg-emerald-50 scale-[0.99]'
                    : 'border-emerald-300 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50/80'
                }`}
              >
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleBatchGalleryFiles(e.target.files);
                    }
                  }}
                />

                <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <h4 className="font-serif text-sm font-bold text-stone-900 mb-0.5">
                  Tải hàng loạt ảnh từ máy tính (Kéo thả hoặc Nhấp để chọn nhiều tệp)
                </h4>
                <p className="text-[11px] text-stone-500 max-w-md mx-auto">
                  Chọn 5, 10, 20 ảnh cùng lúc. Ảnh được xử lý sắc nét tự động và hiển thị ngay tức thì!
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs">
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>Chọn nhiều tệp ảnh từ máy tính</span>
                </div>
              </div>

              {/* Processing Spinner */}
              {isBatchProcessing && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-amber-900">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-700" />
                  <span>Đang tải và tối ưu độ nét cho các ảnh vừa chọn...</span>
                </div>
              )}

              {/* Gallery Items Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    Bộ sưu tập ảnh hiện tại ({formData.gallery?.length || 0} ảnh):
                  </span>
                  {formData.gallery && formData.gallery.length > 0 && (
                    <span className="text-[11px] text-stone-500">
                      Bấm vào ngôi sao để đổi ảnh đại diện bìa
                    </span>
                  )}
                </div>

                {(!formData.gallery || formData.gallery.length === 0) ? (
                  <div className="p-6 text-center border border-dashed border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-500 italic">
                    Chưa có ảnh nào trong bộ sưu tập. Hãy chọn nhiều ảnh từ máy tính ở khung trên để tải hàng loạt.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.gallery.map((img) => {
                      const isCover = formData.coverImage === img.url;
                      return (
                        <div
                          key={img.id}
                          className={`p-2.5 rounded-xl border flex flex-col justify-between relative group transition-all bg-white ${
                            isCover
                              ? 'border-amber-400 ring-2 ring-amber-300/60 bg-amber-50/20'
                              : 'border-stone-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Image Thumbnail with zoom overlay */}
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                              {img.url ? (
                                <img
                                  src={img.url}
                                  alt={img.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                  {img.symbol || '📷'}
                                </div>
                              )}
                              {img.url && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewGalleryImage(img)}
                                  className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                                  title="Xem ảnh phóng to rõ nét"
                                >
                                  <Eye className="w-5 h-5 drop-shadow-md" />
                                </button>
                              )}
                              {isCover && (
                                <span className="absolute top-1 left-1 bg-amber-500 text-stone-950 text-[9px] font-bold px-1 py-0.5 rounded shadow-xs">
                                  Bìa
                                </span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 pr-6 space-y-1">
                              <input
                                type="text"
                                value={img.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => ({
                                    ...prev,
                                    gallery: (prev.gallery || []).map((g) =>
                                      g.id === img.id ? { ...g, title: val } : g
                                    )
                                  }));
                                }}
                                placeholder="Tiêu đề ảnh..."
                                className="w-full text-xs font-bold text-stone-900 border border-transparent hover:border-stone-200 focus:border-emerald-600 rounded px-1 py-0.5 bg-transparent"
                              />

                              <input
                                type="text"
                                value={img.tag}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => ({
                                    ...prev,
                                    gallery: (prev.gallery || []).map((g) =>
                                      g.id === img.id ? { ...g, tag: val } : g
                                    )
                                  }));
                                }}
                                placeholder="Nhãn (VD: Cảnh quan)"
                                className="w-full text-[10px] text-stone-600 border border-transparent hover:border-stone-200 focus:border-emerald-600 rounded px-1 py-0.5 bg-transparent"
                              />
                            </div>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryItem(img.id)}
                              className="absolute top-2 right-2 p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                              title="Xóa ảnh này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Cover Action */}
                          <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-stone-100 text-[11px]">
                            {img.url ? (
                              <button
                                type="button"
                                onClick={() => handleSetAsCover(img.url)}
                                className={`flex items-center gap-1 font-semibold cursor-pointer ${
                                  isCover ? 'text-amber-700 font-bold' : 'text-stone-500 hover:text-amber-700'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${isCover ? 'fill-amber-500 text-amber-500' : ''}`} />
                                <span>{isCover ? 'Đang là ảnh bìa' : 'Đặt làm ảnh bìa'}</span>
                              </button>
                            ) : (
                              <span />
                            )}
                            <span className="text-[10px] text-stone-400">ID: {img.id.slice(-6)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Optional: Add via Web URL Collapsible */}
              <details className="text-xs bg-stone-50 border border-stone-200 rounded-xl p-3">
                <summary className="font-semibold text-stone-700 cursor-pointer select-none">
                  Thêm ảnh qua đường dẫn URL trực tiếp (tùy chọn)
                </summary>
                <div className="space-y-2 mt-3 pt-2 border-t border-stone-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={galleryTitle}
                      onChange={(e) => setGalleryTitle(e.target.value)}
                      placeholder="Tiêu đề ảnh..."
                      className="text-xs px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      value={galleryTag}
                      onChange={(e) => setGalleryTag(e.target.value)}
                      placeholder="Nhãn phân loại..."
                      className="text-xs px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <input
                    type="text"
                    value={galleryUrl}
                    onChange={(e) => setGalleryUrl(e.target.value)}
                    placeholder="URL ảnh trực tiếp (https://...)"
                    className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryItem}
                    className="px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm qua URL
                  </button>
                </div>
              </details>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Địa chỉ xác thực chính xác
                </label>
                <input
                  type="text"
                  value={formData.verifiedAddress}
                  onChange={(e) => setFormData({ ...formData, verifiedAddress: e.target.value })}
                  placeholder="VD: Xã Hy Cương, TP. Việt Trì, Phú Thọ"
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Vĩ độ (Latitude)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    placeholder="21.3644"
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Kinh độ (Longitude)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    placeholder="105.3283"
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Liên kết Google Maps
                </label>
                <input
                  type="text"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  placeholder="https://www.google.com/maps/search/?api=1&query=..."
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Khoảng cách từ trung tâm TP. Việt Trì (km)
                </label>
                <input
                  type="number"
                  value={formData.distanceFromVietTriKm || 0}
                  onChange={(e) => setFormData({ ...formData, distanceFromVietTriKm: parseInt(e.target.value, 10) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
            <div>
              {!isNew && onDelete && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Bạn có chắc chắn muốn xóa điểm di tích "${formData.name}" không?`)) {
                      setSaving(true);
                      await onDelete(formData.id);
                      setSaving(false);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5 cursor-pointer border border-red-200"
                >
                  <Trash2 className="w-4 h-4" /> Xóa di tích này
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu lên Cloud...' : 'Lưu di tích'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Lightbox Modal for Crisp Image Viewing */}
      {previewGalleryImage && previewGalleryImage.url && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewGalleryImage(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-stone-950 text-white flex items-center justify-between text-xs border-b border-stone-800">
              <span className="font-bold truncate max-w-md">{previewGalleryImage.title}</span>
              <button
                type="button"
                onClick={() => setPreviewGalleryImage(null)}
                className="p-1 text-stone-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-stone-950">
              <img
                src={previewGalleryImage.url}
                alt={previewGalleryImage.title}
                className="max-w-full max-h-[82vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
