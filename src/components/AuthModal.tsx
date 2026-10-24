import React, { useState } from 'react';
import {
  X,
  LogIn,
  LogOut,
  Cloud,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Shield
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { signInWithGoogle, logoutUser, isUserAdmin } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  favoritesCount: number;
  onOpenAdmin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onShowToast,
  favoritesCount,
  onOpenAdmin
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await signInWithGoogle();
      onShowToast(`Đăng nhập thành công! Chào mừng ${user.displayName || user.email}`, 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Cửa sổ đăng nhập đã được đóng trước khi hoàn tất.');
      } else {
        setErrorMsg(err.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logoutUser();
      onShowToast('Đã đăng xuất tài khoản an toàn.', 'info');
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Không thể đăng xuất. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">
                {currentUser ? 'Tài khoản' : 'Đăng nhập Google'}
              </h3>
              <p className="text-xs text-stone-300">Dịch vụ lưu trữ dữ liệu thời gian thực</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            /* Signed-in View */
            <div className="space-y-5">
              <div className="flex items-center gap-3.5 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Avatar'}
                    className="w-13 h-13 rounded-full object-cover border-2 border-emerald-600 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center font-bold text-lg">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 text-sm truncate">
                      {currentUser.displayName || 'Người dùng Google'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Đang kết nối Firestore
                  </span>
                </div>
              </div>

              {/* Admin Privileges Card if user is Admin */}
              {isUserAdmin(currentUser.email) ? (
                <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                      <Shield className="w-4 h-4 text-amber-700" />
                      Quyền Quản Trị Viên Tối Cao (Super Admin)
                    </span>
                    <span className="bg-amber-400 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Toàn quyền
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-relaxed">
                    Tài khoản <strong>{currentUser.email}</strong> có toàn quyền chỉnh sửa di tích, ảnh bìa, gallery, phát thông báo và kiểm soát app.
                  </p>
                  {onOpenAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdmin();
                      }}
                      className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                      Mở Bảng Quản Trị Hệ Thống
                    </button>
                  )}
                </div>
              ) : null}

              {/* Cloud Sync Info */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between text-emerald-950 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-emerald-700" />
                    Trạng thái đám mây
                  </span>
                  <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Đã đồng bộ
                  </span>
                </div>
                <div className="text-stone-600 space-y-1.5 pt-1 border-t border-emerald-200/60">
                  <div className="flex justify-between items-center">
                    <span>Điểm đến yêu thích đã lưu:</span>
                    <span className="font-bold text-emerald-900">{favoritesCount} địa điểm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Chế độ sao lưu:</span>
                    <span className="text-stone-700 font-medium">Tự động theo thời gian thực</span>
                  </div>
                </div>
              </div>

              {/* Sign out button */}
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{loading ? 'Đang đăng xuất...' : 'Đăng xuất tài khoản'}</span>
              </button>
            </div>
          ) : (
            /* Guest / Login View */
            <div className="space-y-4">
              <div className="text-center space-y-1.5">
                <h4 className="font-bold text-stone-900 text-base">Đăng nhập bằng tài khoản Google</h4>
                <p className="text-xs text-stone-600 leading-relaxed">

                </p>
              </div>


              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm rounded-xl border-2 border-stone-300 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-800" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>{loading ? 'Đang kết nối Google...' : 'Tiếp tục với Google'}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Bảo mật theo tiêu chuẩn Google OAuth 2.0 & Firestore Rules</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
