import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { Bookmark, Menu, X, Compass, MapPin, User as UserIcon, Cloud, LogIn, Shield, ExternalLink } from 'lucide-react';
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
    onSelectTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-1.5 flex items-center justify-between gap-4 sm:gap-8">
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
                style={{
                  height: `${logoHeight}px`,
                  transform: `scale(${logoScale}) scale(${logoScaleX}, ${logoScaleY})`,
                  transformOrigin: 'left center',
                }}
                className="w-auto max-w-[280px] sm:max-w-[360px] object-contain transition-transform group-hover:scale-105 duration-200"
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
                activeTab === item.id
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* NGẮM PHÚ THỌ QUA 360 */}
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
        </nav>

        {/* Zone 3: Primary Action, Favorites & Google Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenFavorites}
            className="relative p-2 text-stone-700 hover:text-emerald-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title="Xem danh sách đã lưu"
            aria-label={`Điểm đến yêu thích (${favoritesCount})`}
          >
            <Bookmark className="w-5 h-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none">
                {favoritesCount}
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

          {/* Google Auth / Firebase Profile Button */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              currentUser
                ? isAdmin
                  ? 'bg-amber-50/80 border-amber-300 text-stone-900 hover:bg-amber-100/70'
                  : 'bg-emerald-50/70 border-emerald-300 text-stone-800 hover:bg-emerald-100/60'
                : 'bg-white border-stone-300 hover:border-emerald-600 text-stone-700 hover:bg-stone-50 shadow-2xs'
            }`}
            title={currentUser ? `Đang đăng nhập: ${currentUser.email}${isAdmin ? ' (Admin Tối Cao)' : ' (Đồng bộ Firebase)'}` : 'Đăng nhập Google để đồng bộ dữ liệu Firebase'}
          >
            {currentUser ? (
              <>
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
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline font-semibold">Đăng nhập</span>
              </>
            )}
          </button>

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
                  {currentUser ? `Tài khoản: ${currentUser.displayName || currentUser.email}` : 'Đăng nhập Google (Firebase)'}
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
