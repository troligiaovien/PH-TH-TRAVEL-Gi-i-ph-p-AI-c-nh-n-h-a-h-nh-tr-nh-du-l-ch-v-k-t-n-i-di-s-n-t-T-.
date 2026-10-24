import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Sparkles,
  Eye,
  Star,
  Check,
  AlertCircle,
  FileCheck,
  Plus
} from 'lucide-react';
import { Destination, GalleryImage } from '../types';
import { optimizeImageFile, formatBytes, sanitizeImageTitle, ProcessedImage } from '../lib/imageUtils';
import { saveDestinationToCloud } from '../lib/firebase';

interface BatchPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  initialDestinationId?: string;
  onSuccess: (updatedDestination: Destination, count: number) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  adminEmail?: string;
}

export const BatchPhotoUploadModal: React.FC<BatchPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  destinations,
  initialDestinationId,
  onSuccess,
  onShowToast,
  adminEmail,
}) => {
  const [selectedDestId, setSelectedDestId] = useState<string>(
    initialDestinationId || (destinations[0]?.id ?? '')
  );
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<ProcessedImage | null>(null);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [setAsCover, setSetAsCover] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialDestinationId) {
      setSelectedDestId(initialDestinationId);
    } else if (destinations.length > 0 && !selectedDestId) {
      setSelectedDestId(destinations[0].id);
    }
  }, [initialDestinationId, destinations]);

  if (!isOpen) return null;

  const currentDestination = destinations.find((d) => d.id === selectedDestId);

  const handleFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      onShowToast('Vui lòng chọn các tệp định dạng hình ảnh (JPG, PNG, WebP...)', 'error');
      return;
    }

    setIsProcessing(true);
    const newProcessed: ProcessedImage[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const { dataUrl, width, height, sizeBytes } = await optimizeImageFile(file, 1600, 0.86);
        const title = sanitizeImageTitle(file.name);
        newProcessed.push({
          id: `batch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          dataUrl,
          name: file.name,
          title,
          caption: `Tư liệu hình ảnh thực tế ${title}`,
          tag: 'Cảnh quan di tích',
          sizeBytes,
          width,
          height
        });
      } catch (err: any) {
        console.error('Error processing file:', file.name, err);
      }
    }

    setIsProcessing(false);
    if (newProcessed.length > 0) {
      setImages((prev) => [...prev, ...newProcessed]);
      onShowToast(`Đã tải lên & xử lý xong ${newProcessed.length} ảnh sắc nét!`, 'success');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (coverIndex === index) {
      setCoverIndex(0);
    } else if (coverIndex > index) {
      setCoverIndex((c) => c - 1);
    }
  };

  const handleUpdateTitle = (index: number, newTitle: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, title: newTitle } : img))
    );
  };

  const handleUpdateTag = (index: number, newTag: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, tag: newTag } : img))
    );
  };

  const handleSaveBatch = async () => {
    if (!currentDestination) {
      onShowToast('Vui lòng chọn địa điểm cần thêm ảnh!', 'error');
      return;
    }

    if (images.length === 0) {
      onShowToast('Chưa có ảnh nào được tải lên từ máy tính.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Map processed images to GalleryImage format
      const newGalleryItems: GalleryImage[] = images.map((img) => ({
        id: img.id,
        title: img.title || 'Hình ảnh tư liệu',
        description: img.caption || 'Ảnh chụp thực tế địa điểm',
        tag: img.tag || 'Cảnh quan',
        tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
        url: img.dataUrl,
        colorGradient: 'from-emerald-900 to-stone-900',
        photographerOrSource: adminEmail || 'Ban Quản trị Phú Thọ Travel',
        symbol: '📸'
      }));

      // Combine with existing gallery or replace
      const updatedGallery = replaceExisting
        ? newGalleryItems
        : [...(currentDestination.gallery || []), ...newGalleryItems];

      // Update cover image if option selected
      let updatedCover = currentDestination.coverImage;
      if (setAsCover && images[coverIndex]) {
        updatedCover = images[coverIndex].dataUrl;
      }

      const updatedDestination: Destination = {
        ...currentDestination,
        gallery: updatedGallery,
        coverImage: updatedCover,
        lastVerified: new Date().toLocaleDateString('vi-VN')
      };

      // Save to Firebase Firestore Cloud
      await saveDestinationToCloud(updatedDestination, adminEmail, replaceExisting);

      // Also persist to custom_photos in localStorage so they never get lost even if Cloud quota resets
      try {
        const customKey = `custom_photos_${currentDestination.id}`;
        const existingCustomStr = localStorage.getItem(customKey);
        const existingCustom = existingCustomStr ? JSON.parse(existingCustomStr) : [];
        const combinedCustom = replaceExisting
          ? newGalleryItems
          : [...newGalleryItems, ...existingCustom];
        localStorage.setItem(customKey, JSON.stringify(combinedCustom));
      } catch (e) {
        console.warn('Could not cache custom photos to local storage:', e);
      }

      onSuccess(updatedDestination, images.length);
      onShowToast(
        `Đã tải lên và lưu ${images.length} ảnh hàng loạt cho "${currentDestination.name}" thành công!`,
        'success'
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      onShowToast(`Lỗi khi lưu ảnh lên máy chủ: ${err.message || err}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <UploadCloud className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold">
                  TẢI HÀNG LOẠT ẢNH TỪ MÁY TÍNH
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-300/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Chỉ 1 lần là xong
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Cho phép chọn nhiều tệp ảnh cùng lúc, nén rõ nét tự động, đồng bộ trực tiếp lên điểm đến
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destination Picker & Settings Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <label className="text-xs font-bold text-stone-700 whitespace-nowrap">
              Chọn điểm đến:
            </label>
            <select
              value={selectedDestId}
              onChange={(e) => setSelectedDestId(e.target.value)}
              className="w-full text-xs font-medium px-3 py-1.5 border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            >
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.gallery?.length || 0} ảnh hiện có)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={setAsCover}
                onChange={(e) => setSetAsCover(e.target.checked)}
                className="w-4 h-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-700"
              />
              <span className="font-medium">Đặt ảnh được chọn làm Ảnh Bìa</span>
            </label>

            <label className="flex items-center gap-1.5 text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="w-4 h-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-700"
              />
              <span className="font-medium">Ghi đè (thay thế ảnh cũ)</span>
            </label>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* File Drop & Picker Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-600 bg-emerald-50 scale-[0.99]'
                : 'border-stone-300 hover:border-emerald-500 bg-stone-50/60 hover:bg-emerald-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                }
              }}
            />

            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h4 className="font-serif text-base font-bold text-stone-900 mb-1">
              Nhấp để chọn hoặc Kéo thả ảnh từ máy tính vào đây
            </h4>
            <p className="text-xs text-stone-500 max-w-lg mx-auto">
              Hỗ trợ tải lên nhiều tệp ảnh cùng lúc (JPG, PNG, WebP). Tự động nén tối ưu độ phân giải cao,
              đảm bảo ảnh hiển thị rõ nét trên mọi thiết bị và đồng bộ nhanh 1 chạm.
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Chọn ảnh từ máy tính (Nhiều tệp)</span>
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-amber-900">
              <Sparkles className="w-4 h-4 animate-spin text-amber-700" />
              <span>Đang đọc và xử lý độ nét cho các tệp ảnh vừa chọn...</span>
            </div>
          )}

          {/* Uploaded Images Review Grid */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-stone-900">
                    Ảnh đã sẵn sàng tải lên ({images.length} ảnh):
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Tổng dung lượng: {formatBytes(images.reduce((acc, img) => acc + img.sizeBytes, 0))}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setImages([])}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                >
                  Xóa tất cả ảnh đã chọn
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img, idx) => {
                  const isThisCover = coverIndex === idx;
                  return (
                    <div
                      key={img.id}
                      className={`relative rounded-xl border p-2.5 transition-all bg-white group flex flex-col justify-between ${
                        isThisCover
                          ? 'border-amber-400 ring-2 ring-amber-300/50 shadow-md bg-amber-50/30'
                          : 'border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      {/* Image Thumbnail with zoom trigger */}
                      <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 mb-2">
                        <img
                          src={img.dataUrl}
                          alt={img.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewImage(img)}
                          className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                          title="Xem ảnh phóng to rõ nét"
                        >
                          <Eye className="w-6 h-6 drop-shadow-md" />
                        </button>

                        {/* Cover Badge */}
                        {isThisCover && (
                          <div className="absolute top-1.5 left-1.5 bg-amber-500 text-stone-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <Star className="w-3 h-3 fill-stone-950 text-stone-950" />
                            <span>Ảnh bìa đại diện</span>
                          </div>
                        )}

                        <span className="absolute bottom-1.5 right-1.5 bg-stone-900/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                          {img.width}x{img.height}
                        </span>
                      </div>

                      {/* Metadata Edit */}
                      <div className="space-y-1.5 flex-1">
                        <div>
                          <label className="text-[10px] font-bold text-stone-600 block">Tiêu đề:</label>
                          <input
                            type="text"
                            value={img.title}
                            onChange={(e) => handleUpdateTitle(idx, e.target.value)}
                            placeholder="Tiêu đề ảnh..."
                            className="w-full text-xs font-semibold px-2 py-1 border border-stone-200 rounded-md focus:ring-1 focus:ring-emerald-700 bg-stone-50/50"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-stone-600 block">Nhãn phân loại:</label>
                          <input
                            type="text"
                            value={img.tag}
                            onChange={(e) => handleUpdateTag(idx, e.target.value)}
                            placeholder="Nhãn (VD: Cảnh quan, Đền Hạ...)"
                            className="w-full text-[11px] px-2 py-1 border border-stone-200 rounded-md focus:ring-1 focus:ring-emerald-700 bg-stone-50/50"
                          />
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100 text-xs">
                        <button
                          type="button"
                          onClick={() => setCoverIndex(idx)}
                          className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                            isThisCover
                              ? 'text-amber-800'
                              : 'text-stone-500 hover:text-amber-700'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isThisCover ? 'fill-amber-500 text-amber-500' : ''}`} />
                          <span>{isThisCover ? 'Đã là ảnh bìa' : 'Chọn làm bìa'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="text-stone-400 hover:text-red-600 p-1 rounded cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with One-click Save */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-600">
            {images.length > 0 ? (
              <span className="font-medium text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Sẵn sàng tải lên <b>{images.length} ảnh</b> cho <b>{currentDestination?.name}</b>
              </span>
            ) : (
              <span>Chọn ảnh từ máy tính để tiến hành thêm hàng loạt.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={handleSaveBatch}
              disabled={isSaving || images.length === 0 || !currentDestination}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-stone-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Đang lưu lên đám mây...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>LƯU HÀNG LOẠT LÊN ĐỊA ĐIỂM (1 LẦN)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Preview Modal for Quality Inspection */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-stone-950 text-white flex items-center justify-between text-xs border-b border-stone-800">
              <span className="font-bold truncate max-w-md">{previewImage.title}</span>
              <div className="flex items-center gap-3">
                <span className="text-stone-400 font-mono">
                  {previewImage.width}x{previewImage.height} · {formatBytes(previewImage.sizeBytes)}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1 text-stone-400 hover:text-white rounded cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-stone-950">
              <img
                src={previewImage.dataUrl}
                alt={previewImage.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
