import React, { useState } from 'react';
import {
  Lock,
  Shield,
  ShieldAlert,
  Sparkles,
  MapPin,
  Compass,
  BookOpen,
  Bookmark,
  CheckCircle2,
  LogIn,
  Mail,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { AppUISettings } from '../types';

interface LoginLockGateProps {
  onOpenAuthModal: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  uiSettings?: AppUISettings;
}

export const LoginLockGate: React.FC<LoginLockGateProps> = ({
  onOpenAuthModal,
  onShowToast,
  uiSettings,
}) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const brandTitle = uiSettings?.logoText || 'PHÚ THỌ TRAVEL';

  const handleQuickGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      onShowToast(`Đăng nhập thành công! Chào mừng ${user.displayName || user.email}`, 'success');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Cửa sổ đăng nhập Google đã được đóng trước khi hoàn tất.');
      } else {
        setErrorMessage(err.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại hoặc dùng Email.');
      }
      onShowToast('Chưa hoàn tất đăng nhập', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const LOCKED_FEATURES = [
    {
      icon: Compass,
      title: '5 Điểm di tích & Danh thắng Đất Tổ',
      desc: 'Toàn bộ dữ liệu chi tiết lịch sử, sự tích Hùng Vương, tọa độ GPS xác minh và bộ sưu tập ảnh cảnh sắc thực địa.',
    },
    {
      icon: MapPin,
      title: 'Bản đồ số du lịch & Điều hướng GPS',
      desc: 'Hệ thống bản đồ số đa lớp (đường phố, vệ tinh Esri, địa hình), chỉ đường Google Maps và trải nghiệm 3D Google Earth.',
    },
    {
      icon: Sparkles,
      title: 'Trợ lý AI Kiến tạo Lịch trình',
      desc: 'Công cụ trí tuệ nhân tạo thiết kế lịch trình du lịch thông minh, tối ưu cung đường cho gia đình, nhóm bạn và người cao tuổi.',
    },
    {
      icon: BookOpen,
      title: 'Cẩm nang du lịch & Di sản văn hóa',
      desc: 'Kho bài viết chuyên sâu về phong tục, hát Xoan Phú Thọ, ẩm thực truyền thống Đất Tổ và các dự án bảo tồn di sản.',
    },
    {
      icon: Bookmark,
      title: 'Lưu trữ yêu thích & Đồng bộ Cloud Firestore',
      desc: 'Lưu trữ hành trình cá nhân an toàn trên hệ thống máy chủ đám mây Firebase, truy cập mọi lúc trên các thiết bị.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-stone-900 via-emerald-950/80 to-stone-950 text-stone-100 relative overflow-hidden">
      {/* Heritage Atmospheric Glows & Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-r from-amber-500/15 via-emerald-600/20 to-amber-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lock-heritage-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 48 M 0 0 L 48 48" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-500/30" />
              <circle cx="24" cy="24" r="2" fill="currentColor" className="text-emerald-400/30" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lock-heritage-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl w-full mx-auto space-y-8">
        {/* Lock Hero Card */}
        <div className="bg-stone-900/90 backdrop-blur-xl border border-stone-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center">
          {/* Subtle Top Gold Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

          {/* Glowing Lock Badge */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 via-emerald-900/60 to-stone-950 border-2 border-amber-400/60 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-5 animate-pulse-glow">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
          </div>

          {/* Security Banner Status */}
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-300 mb-3 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>HỆ THỐNG YÊU CẦU ĐĂNG NHẬP</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-white mb-3">
            KHÓA QUYỀN TRUY CẬP ỨNG DỤNG
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-stone-300 leading-relaxed">
            Để bảo vệ cơ sở dữ liệu di tích, đảm bảo tính xác thực người dùng và đồng bộ hóa lịch trình cá nhân với máy chủ <strong>Cloud Firestore</strong>, ứng dụng yêu cầu bạn đăng nhập để mở khóa toàn bộ thông tin và các tính năng.
          </p>

          {/* Error notice if sign-in failed */}
          {errorMessage && (
            <div className="mt-4 max-w-md mx-auto p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            {/* Google Sign-In (Primary One-Click) */}
            <button
              onClick={handleQuickGoogleSignIn}
              disabled={googleLoading}
              className="w-full sm:w-auto flex-1 interactive-btn px-5 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-white/10 border border-stone-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
              ) : (
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
              )}
              <span>{googleLoading ? 'Đang kết nối...' : 'Đăng nhập với Google'}</span>
            </button>

            {/* Email / Password Options Button */}
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto interactive-btn px-5 py-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-emerald-800/80 shadow-md cursor-pointer transition-all shrink-0"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Email / Mật khẩu</span>
            </button>
          </div>

          <div className="mt-4 text-[11px] text-stone-400">
            Đăng nhập an toàn qua hạ tầng Google Firebase Auth · Miễn phí & Không lưu mật khẩu
          </div>
        </div>

        {/* Locked Information & Features Overview */}
        <div className="bg-stone-900/60 backdrop-blur-md border border-stone-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-stone-200">
                DANH SÁCH NỘI DUNG & TÍNH NĂNG BỊ KHÓA
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              Mở khóa ngay sau khi đăng nhập
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOCKED_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 flex items-start gap-3.5 group hover:border-amber-400/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800 text-amber-300 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-stone-200 group-hover:text-amber-300 transition-colors">
                        {feat.title}
                      </h4>
                      <Lock className="w-3 h-3 text-amber-400/70 shrink-0" />
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick prompt to login */}
          <div className="mt-6 pt-5 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-stone-400 text-center sm:text-left">
              Chưa có tài khoản? Bạn có thể đăng ký tài khoản mới miễn phí trong vòng 10 giây.
            </div>
            <button
              onClick={onOpenAuthModal}
              className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1 cursor-pointer underline"
            >
              <span>Đăng ký hoặc Đăng nhập ngay</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
