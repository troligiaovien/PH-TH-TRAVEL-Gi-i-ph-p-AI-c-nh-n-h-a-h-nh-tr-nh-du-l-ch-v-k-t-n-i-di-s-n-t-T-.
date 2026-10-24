import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  MapPin,
  Sparkles,
  Info,
  Layers,
  Camera
} from 'lucide-react';
import { GalleryImage } from '../types';

interface SwipeablePhotoShowcaseProps {
  images: GalleryImage[];
  title?: string;
  subtitle?: string;
  onSelectImage?: (img: GalleryImage, index: number) => void;
  className?: string;
  defaultIndex?: number;
}

export const SwipeablePhotoShowcase: React.FC<SwipeablePhotoShowcaseProps> = ({
  images,
  title = 'Toàn cảnh & Cảnh sắc Đền Hùng',
  subtitle = 'Lướt ngón tay hoặc nhấn mũi tên để chuyển sang các góc ảnh tiếp theo',
  onSelectImage,
  className = '',
  defaultIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch and drag swipe state
  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const totalImages = images.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  }, [totalImages]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  }, [totalImages]);

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, isFullscreen]);

  // Autoplay timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      goToNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, goToNext]);

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    touchEndXRef.current = e.touches[0].clientX;
    const diff = touchEndXRef.current - touchStartXRef.current;
    // Dampen drag
    setDragOffset(diff * 0.4);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const diff = touchEndXRef.current - touchStartXRef.current;
    const threshold = 40; // min px to trigger swipe

    if (diff < -threshold) {
      goToNext();
    } else if (diff > threshold) {
      goToPrev();
    }
    setDragOffset(0);
  };

  // Mouse drag handlers for desktop swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartXRef.current = e.clientX;
    touchEndXRef.current = e.clientX;
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    touchEndXRef.current = e.clientX;
    const diff = touchEndXRef.current - touchStartXRef.current;
    setDragOffset(diff * 0.3);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const diff = touchEndXRef.current - touchStartXRef.current;
    const threshold = 45;

    if (diff < -threshold) {
      goToNext();
    } else if (diff > threshold) {
      goToPrev();
    }
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setDragOffset(0);
    }
  };

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      ref={containerRef}
      className={`relative select-none bg-stone-950 rounded-2xl overflow-hidden shadow-xl border border-stone-800 ${
        isFullscreen
          ? 'fixed inset-0 z-70 rounded-none border-0 h-screen w-screen flex flex-col justify-between'
          : className
      }`}
    >
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-stone-950/80 via-stone-950/40 to-transparent flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-900/90 text-emerald-200 text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 border border-emerald-500/30">
            <Camera className="w-3.5 h-3.5" />
            <span>Ảnh {currentIndex + 1} / {totalImages}</span>
          </span>
          <span className="text-xs font-medium text-stone-200 hidden sm:inline-block">
            {currentImage.tag}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white backdrop-blur-xs transition-colors cursor-pointer"
            title={isPlaying ? 'Tạm dừng tự động lướt' : 'Tự động lướt ảnh'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white backdrop-blur-xs transition-colors cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Swipeable Viewport */}
      <div
        className="relative w-full aspect-[16/10] sm:aspect-[21/10] overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center bg-stone-950"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Active Image Container with transition */}
        <div
          className="w-full h-full relative transition-transform duration-200 ease-out flex items-center justify-center"
          style={{ transform: `translateX(${dragOffset}px)` }}
        >
          {currentImage.url ? (
            <img
              src={currentImage.url}
              alt={currentImage.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-opacity duration-300"
              draggable={false}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/den-hung/1.jpg';
              }}
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${currentImage.colorGradient} flex flex-col items-center justify-center p-8 text-center text-white`}
            >
              <div className="text-6xl mb-3 drop-shadow-md">{currentImage.symbol}</div>
              <h4 className="text-xl font-serif font-bold">{currentImage.title}</h4>
              <p className="text-xs text-stone-300 mt-1">{currentImage.location}</p>
            </div>
          )}

          {/* Gradient Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/30 to-transparent pointer-events-none" />
        </div>

        {/* Prev & Next Floating Buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-xs transition-all hover:scale-105 shadow-lg cursor-pointer"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-xs transition-all hover:scale-105 shadow-lg cursor-pointer"
          aria-label="Ảnh kế tiếp"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Bottom Information Card on Image */}
        <div className="absolute bottom-12 sm:bottom-14 left-0 right-0 z-20 px-4 sm:px-6 pointer-events-none">
          <div className="max-w-2xl bg-stone-900/80 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-white/10 text-white pointer-events-auto shadow-lg">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-medium mb-1">
              <span className="px-2 py-0.5 rounded-sm bg-amber-400/20 text-amber-300 font-semibold text-[10px] uppercase">
                {currentImage.tag}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[11px] text-stone-300">
                <MapPin className="w-3 h-3 text-emerald-400" />
                {currentImage.location}
              </span>
              {currentImage.bestViewTime && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-200/90 ml-auto">
                  <Sparkles className="w-3 h-3" />
                  {currentImage.bestViewTime}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
              {currentImage.title}
            </h3>

            <p className="text-xs text-stone-300 mt-1 leading-relaxed line-clamp-2">
              {currentImage.description}
            </p>
          </div>
        </div>

        {/* Swipe Hint indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 text-[11px] text-stone-300/80 bg-stone-950/60 px-3 py-1 rounded-full backdrop-blur-xs pointer-events-none">
          <span>👈</span>
          <span>Lướt ngón tay hoặc bấm mũi tên để xem ảnh tiếp</span>
          <span>👉</span>
        </div>
      </div>

      {/* Bottom Thumbnails Navigation Strip */}
      <div className="p-3 bg-stone-900/90 border-t border-stone-800 overflow-x-auto flex items-center gap-2 z-20">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => goToIndex(idx)}
            className={`relative rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer ${
              currentIndex === idx
                ? 'ring-2 ring-amber-400 scale-105 shadow-md'
                : 'opacity-60 hover:opacity-100'
            }`}
            style={{ width: '64px', height: '42px' }}
            title={img.title}
          >
            {img.url ? (
              <img
                src={img.url}
                alt={img.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${img.colorGradient} flex items-center justify-center text-sm`}
              >
                {img.symbol}
              </div>
            )}
            <span className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-[8px] text-white text-center truncate px-0.5 font-medium">
              {idx + 1}. {img.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
