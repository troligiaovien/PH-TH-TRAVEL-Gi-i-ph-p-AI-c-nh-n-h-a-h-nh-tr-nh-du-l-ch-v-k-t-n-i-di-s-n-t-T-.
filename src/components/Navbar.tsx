import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { Bookmark, Menu, X, Compass, MapPin, User as UserIcon, Cloud, LogIn, Shield, ExternalLink, Lock } from 'lucide-react';
import { AppUISettings } from '../types';

export type MainTabType = 'destinations' | 'map' | 'itineraries' | 'guide';

interface NavbarProps {
  favoritesCount: number;
  onOpenFavorites: () => void;
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  destinationsCount?: number;
  uiSettings?: AppUISettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  favoritesCount,
  onOpenFavorites,
  activeTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  isAdmin = false,
  onOpenAdmin,
  destinationsCount,
  uiSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  const brandTitle = uiSettings?.logoText || 'PHÚ THỌ TRAVEL';
  const logoUrl = uiSettings?.logoUrl?.trim();

  const logoHeight = uiSettings?.logoHeight ?? 44;
  const logoScale = (uiSettings?.logoScale ?? 100) / 100;
  const logoScaleX = (uiSettings?.logoScaleX ?? 100) / 100;
  const logoScaleY = (uiSettings?.logoScaleY ?? 100) / 100;

  const navItems: { id: MainTabType; label: string }[] = [
    { id: 'destinations', label: destinationsCount ? `Điểm đến (${destinationsCount})` : 'Điểm đến' },
    { id: 'map', label: 'Bản đồ số' },
    { id: 'itineraries', label: 'AI Lịch trình' },
    { id: 'guide', label: 'Cẩm nang & Dự án' },
  ];

  const handleLinkClick = (id: MainTabType) => {
    if (!currentUser) {
      onOpenAuth();
      setMobileMenuOpen(false);
      return;
    }
    onSelectTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-1.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Brand Wordmark / Custom Logo */}
        <button
          onClick={() => handleLinkClick('destinations')}
          className="flex items-center text-left group shrink-0 focus-visible:outline-emerald-800 cursor-pointer overflow-visible"
          aria-label={`${brandTitle} - Trang chủ`}
        >
          {logoUrl && !logoLoadFailed ? (
            <div className="py-1 overflow-visible flex items-center">
              <img
                src={logoUrl}
                alt={brandTitle}
                loading="eager"
                decoding="async"
                style={{
                  height: `${Math.round(logoHeight * logoScale * logoScaleY)}px`,
                  transform: logoScaleX !== 1 ? `scaleX(${logoScaleX})` : undefined,
                  transformOrigin: 'left center',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className="w-auto max-w-[320px] sm:max-w-[460px] object-contain transition-all duration-200"
                onError={() => setLogoLoadFailed(true)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center font-serif text-lg font-bold shadow-xs transition-transform group-hover:scale-105">
                PT
              </div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap">
                {brandTitle}
              </span>
            </div>
          )}
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLinkClick(item.id)}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer text-xs font-semibold ${
                activeTab === item.id && currentUser
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {item.label}
              {!currentUser && <Lock className="w-3 h-3 inline-block ml-1 text-stone-400" />}
            </button>
          ))}

          {/* NGẮM PHÚ THỌ QUA 360 */}
          {currentUser ? (
            <a
              href="https://dulichphutho.com.vn/vi/explore360"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 text-xs font-bold text-amber-900 bg-gradient-to-r from-amber-400/25 via-amber-300/30 to-amber-400/25 hover:from-amber-400/40 hover:to-amber-300/45 border border-amber-400/60 flex items-center gap-1.5 shadow-2xs group"
              title="Khám phá di sản & danh thắng Đất Tổ bằng công nghệ thực tế ảo 360 độ"
            >
              <Compass className="w-3.5 h-3.5 text-amber-700 group-hover:rotate-90 transition-transform duration-500" />
              <span>NGẮM PHÚ THỌ QUA 360°</span>
              <ExternalLink className="w-3 h-3 text-amber-700/80 group-hover:text-amber-900" />
            </a>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 flex items-center gap-1.5 cursor-pointer"
              title="Đăng nhập để mở khóa tính năng VR 360 độ"
            >
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>NGẮM PHÚ THỌ QUA 360°</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action, Favorites & Google Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth();
                return;
              }
              onOpenFavorites();
            }}
            className="relative p-2 text-stone-700 hover:text-emerald-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title={currentUser ? "Xem danh sách đã lưu" : "Đăng nhập để xem danh sách yêu thích"}
            aria-label={`Điểm đến yêu thích (${favoritesCount})`}
          >
            <Bookmark className="w-5 h-5" />
            {currentUser && favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none">
                {favoritesCount}
              </span>
            )}
            {!currentUser && (
              <span className="absolute -top-1 -right-1 bg-stone-500 text-white text-[9px] font-bold px-1 rounded-full">
                🔒
              </span>
            )}
          </button>

          {/* Admin Dashboard Trigger (Golden Badge) */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-xs hover:shadow transition-all cursor-pointer border border-amber-300"
              title="Mở Bảng Quản Trị Hệ Thống (Toàn quyền Admin)"
            >
              <Shield className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
              <span>Quản Trị</span>
            </button>
          )}

          {/* Google Auth / Cloud Profile Button */}
          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-amber-50/80 border-amber-300 text-stone-900 hover:bg-amber-100/70'
                  : 'bg-emerald-50/70 border-emerald-300 text-stone-800 hover:bg-emerald-100/60'
              }`}
              title={`Đang đăng nhập: ${currentUser.email}${isAdmin ? ' (Quản trị viên)' : ' (Đồng bộ đám mây)'}`}
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="User"
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-5 h-5 rounded-full ${isAdmin ? 'bg-amber-600 text-stone-950' : 'bg-emerald-900 text-amber-300'} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline max-w-[85px] truncate font-semibold">
                {currentUser.displayName?.split(' ').pop() || 'Tài khoản'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse shrink-0`} title={isAdmin ? 'Quyền Admin Toàn Hệ Thống' : 'Đã kết nối Firestore'}></span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl border border-amber-400 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all cursor-pointer shadow-xs animate-pulse-glow"
              title="Đăng nhập tài khoản để mở khóa thông tin và tính năng"
            >
              <Lock className="w-3.5 h-3.5 text-stone-950" />
              <span className="hidden sm:inline font-bold">Đăng nhập để mở khóa</span>
              <span className="sm:hidden font-bold">Đăng nhập</span>
            </button>
          )}

          <button
            onClick={() => handleLinkClick('map')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Bản đồ</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Mở menu điều hướng"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-stone-50 px-4 pt-3 pb-5 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLinkClick(item.id)}
                className={`text-left px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-emerald-900 text-white font-bold'
                    : 'text-stone-800 hover:bg-stone-200/60'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Mobile NGẮM PHÚ THỌ QUA 360 */}
            <a
              href="https://dulichphutho.com.vn/vi/explore360"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 text-sm font-bold text-amber-950 bg-gradient-to-r from-amber-200/70 via-amber-100 to-amber-200/60 rounded-lg border border-amber-300 shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-800" />
                <span>NGẮM PHÚ THỌ QUA 360°</span>
              </span>
              <span className="text-[10px] bg-amber-300 text-amber-950 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-400">
                <span>360° VR</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </a>

            <div className="pt-2 border-t border-stone-200 mt-1 space-y-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    if (onOpenAdmin) onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg border border-amber-300 shadow-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-stone-950 fill-stone-950" />
                    Bảng Quản Trị Hệ Thống
                  </span>
                  <span className="text-[10px] bg-stone-950 text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase">
                    Admin
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-stone-800 bg-white rounded-lg border border-stone-200"
              >
                <span className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-emerald-700" />
                  {currentUser ? `Tài khoản: ${currentUser.displayName || currentUser.email}` : 'Đăng nhập Google'}
                </span>
                {currentUser ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Đã đồng bộ
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-semibold">Kết nối ngay</span>
                )}
              </button>

              <button
                onClick={() => {
                  onOpenFavorites();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium text-stone-800 bg-white rounded-lg border border-stone-200"
              >
                <span className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-700" />
                  Điểm đến đã lưu
                </span>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  {favoritesCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
