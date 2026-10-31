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
  Shield,
  Mail,
  Lock,
  UserPlus,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  Send,
  Sparkles
} from 'lucide-react';
import type { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  sendResetPassword,
  logoutUser,
  isUserAdmin
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  favoritesCount: number;
  onOpenAdmin?: () => void;
  lockNotice?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onShowToast,
  favoritesCount,
  onOpenAdmin,
  lockNotice
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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
        setErrorMsg('Cửa sổ đăng nhập Google đã được đóng trước khi hoàn tất.');
      } else {
        setErrorMsg(err.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await signInWithEmail(email, password);
      onShowToast(`Đăng nhập thành công! Chào mừng ${user.displayName || user.email}`, 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('Tài khoản email này chưa được đăng ký. Vui lòng chuyển sang tab "Đăng ký" để tạo tài khoản mới.');
      } else if (err.code === 'auth/wrong-password') {
        setErrorMsg('Mật khẩu không chính xác. Vui lòng kiểm tra lại hoặc bấm "Quên mật khẩu?" để đặt lại.');
      } else if (err.code === 'auth/invalid-credential') {
        setErrorMsg('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Định dạng email không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.');
      } else {
        setErrorMsg(err.message || 'Không thể đăng nhập. Vui lòng kiểm tra kết nối.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Mật khẩu tối thiểu phải từ 6 ký tự trở lên.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp. Vui lòng kiểm tra lại.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await registerWithEmail(email, password, displayName.trim() || undefined);
      onShowToast(`Đăng ký tài khoản thành công! Chào mừng ${user.displayName || user.email}`, 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email này đã được sử dụng. Vui lòng chuyển sang tab "Đăng nhập" hoặc chọn "Quên mật khẩu".');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Định dạng email không hợp lệ.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Mật khẩu quá ngắn. Vui lòng chọn mật khẩu từ 6 ký tự trở lên.');
      } else {
        setErrorMsg(err.message || 'Không thể tạo tài khoản. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ Email của bạn.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await sendResetPassword(email);
      setResetSent(true);
      onShowToast(`Đã gửi liên kết khôi phục mật khẩu tới ${email}`, 'success');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('Không tìm thấy tài khoản nào gắn với địa chỉ email này. Vui lòng kiểm tra lại hoặc đăng ký mới.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Định dạng email không hợp lệ.');
      } else {
        setErrorMsg(err.message || 'Không thể gửi email khôi phục. Vui lòng thử lại.');
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
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-stone-200/90 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Heritage Gold-Emerald Hairline Accent */}
        <div className="h-1 bg-gradient-to-r from-emerald-900 via-amber-400 to-emerald-900 w-full" />

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900 px-6 py-5 text-white flex items-center justify-between border-b border-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-900 to-stone-950 border border-amber-400/40 flex items-center justify-center text-amber-300 font-serif font-black text-sm shadow-[0_2px_10px_rgba(245,158,11,0.2)] shrink-0">
              PT
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold tracking-tight text-stone-100 flex items-center gap-1.5">
                <span>PHÚ THỌ TRAVEL</span>
              </h3>
              <p className="text-xs text-stone-300/90">
                {currentUser
                  ? 'Quản lý tài khoản & Dữ liệu đám mây'
                  : authMode === 'register'
                  ? 'Tạo tài khoản mới & Đồng bộ dữ liệu'
                  : authMode === 'forgot'
                  ? 'Khôi phục mật khẩu qua Email'
                  : 'Đăng nhập để mở khóa đầy đủ tính năng'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {currentUser ? (
            /* ================= SIGNED-IN PROFILE VIEW ================= */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-4 bg-stone-50 rounded-2xl border border-stone-200/90 shadow-2xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Avatar'}
                    className="w-13 h-13 rounded-full object-cover border-2 border-emerald-700 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-full bg-emerald-950 text-amber-300 border border-emerald-800 flex items-center justify-center font-bold text-lg shadow-xs">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 text-sm truncate">
                      {currentUser.displayName || 'Người dùng'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Đã đồng bộ
                    </span>
                    {isUserAdmin(currentUser.email) && (
                      <span className="text-[10px] font-bold text-amber-950 bg-amber-300 px-2 py-0.5 rounded-md uppercase">
                        Quản trị viên
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Privileges Card */}
              {isUserAdmin(currentUser.email) && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                      <Shield className="w-4 h-4 text-amber-700" />
                      Quyền Quản Trị Viên (Super Admin)
                    </span>
                    <span className="bg-amber-400 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Toàn quyền
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-relaxed">
                    Tài khoản <strong>{currentUser.email}</strong> có quyền quản trị, chỉnh sửa điểm đến, thông báo và cấu hình giao diện.
                  </p>
                  {onOpenAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdmin();
                      }}
                      className="interactive-btn w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                      <span>Mở Bảng Quản Trị Hệ Thống</span>
                    </button>
                  )}
                </div>
              )}

              {/* Cloud Sync Summary */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-stone-800 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-emerald-700" />
                    Lưu trữ & Yêu thích
                  </span>
                  <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-bold">
                    {favoritesCount} địa điểm đã lưu
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Dữ liệu yêu thích, lịch trình cá nhân và ghi chú được sao lưu an toàn theo tài khoản của bạn.
                </p>
              </div>

              {/* Sign out Button */}
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="interactive-btn w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{loading ? 'Đang đăng xuất...' : 'Đăng xuất tài khoản'}</span>
              </button>
            </div>
          ) : (
            /* ================= GUEST AUTH FORMS ================= */
            <div className="space-y-4">
              {/* Feature Lock Notice Banner (When invoked from locked features) */}
              {lockNotice && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950 animate-in fade-in duration-150">
                  <div className="p-1 rounded-lg bg-amber-200 text-amber-900 shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="leading-snug">
                    <strong className="block font-bold text-amber-950 mb-0.5">
                      Tính năng yêu cầu đăng nhập:
                    </strong>
                    <span className="text-stone-700">{lockNotice}</span>
                  </div>
                </div>
              )}

              {/* SEGMENTED CONTROL: [ĐĂNG NHẬP] & [ĐĂNG KÝ] (hidden when in forgot password view) */}
              {authMode !== 'forgot' && (
                <div className="p-1.5 bg-stone-100/90 backdrop-blur-sm rounded-2xl border border-stone-200/80 shadow-inner grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMsg(null);
                    }}
                    className={`interactive-btn py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-white text-emerald-950 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-stone-200/80'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>ĐĂNG NHẬP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg(null);
                    }}
                    className={`interactive-btn py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-white text-emerald-950 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-stone-200/80'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>ĐĂNG KÝ</span>
                  </button>
                </div>
              )}

              {/* Error Message Box */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* Success Notification for Password Reset Email */}
              {resetSent && authMode === 'forgot' && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đã gửi email khôi phục thành công!</span>
                  </div>
                  <p className="leading-relaxed text-stone-700">
                    Hệ thống đã gửi thư xác thực kèm liên kết đặt lại mật khẩu đến: <strong className="text-stone-900">{email}</strong>.
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Vui lòng kiểm tra hộp thư đến (Inbox) hoặc hòm thư rác (Spam) và nhấp vào liên kết để tạo mật khẩu mới.
                  </p>
                </div>
              )}

              {/* ================= TAB 1: ĐĂNG NHẬP (LOGIN) ================= */}
              {authMode === 'login' && (
                <div className="space-y-4">
                  {/* Google Sign-in */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    type="button"
                    className="interactive-btn w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs rounded-xl border border-stone-300 shadow-2xs hover:shadow-xs hover:border-stone-400 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-800" />
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
                    <span>Tiếp tục với Google</span>
                  </button>

                  {/* Clean Divider */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-stone-200 w-full" />
                    <span className="bg-white px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Hoặc với Email
                    </span>
                  </div>

                  <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ten-cua-ban@gmail.com"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-stone-700">
                          Mật khẩu
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('forgot');
                            setErrorMsg(null);
                            setResetSent(false);
                          }}
                          className="text-[11px] font-bold text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <KeyRound className="w-3 h-3 text-amber-700" />
                          <span>Quên mật khẩu?</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Nhập mật khẩu"
                          className="w-full pl-10 pr-10 py-2.5 text-xs bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="interactive-btn w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 hover:from-emerald-900 hover:to-emerald-800 text-amber-300 font-bold text-xs rounded-xl shadow-[0_4px_16px_rgba(6,78,59,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      ) : (
                        <LogIn className="w-4 h-4 text-amber-300" />
                      )}
                      <span>{loading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
                    </button>
                  </form>

                  <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-600">
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMsg(null);
                      }}
                      className="text-emerald-900 font-bold hover:underline cursor-pointer"
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: ĐĂNG KÝ (REGISTER) ================= */}
              {authMode === 'register' && (
                <div className="space-y-4">
                  {/* Google Sign-up */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    type="button"
                    className="interactive-btn w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs rounded-xl border border-stone-300 shadow-2xs hover:shadow-xs hover:border-stone-400 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-800" />
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
                    <span>Đăng ký nhanh với Google</span>
                  </button>

                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-stone-200 w-full" />
                    <span className="bg-white px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Hoặc tạo tài khoản bằng Email
                    </span>
                  </div>

                  <form onSubmit={handleEmailRegister} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Họ và Tên (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ten-cua-ban@gmail.com"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Mật khẩu (Tối thiểu 6 ký tự)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Tối thiểu 6 ký tự"
                          className="w-full pl-10 pr-10 py-2.5 text-xs bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Xác nhận lại Mật khẩu
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu"
                          className="w-full pl-10 pr-10 py-2.5 text-xs bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                          aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="interactive-btn w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 hover:from-emerald-900 hover:to-emerald-800 text-amber-300 font-bold text-xs rounded-xl shadow-[0_4px_16px_rgba(6,78,59,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      ) : (
                        <UserPlus className="w-4 h-4 text-amber-300" />
                      )}
                      <span>{loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản & Đăng ký'}</span>
                    </button>
                  </form>

                  <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-600">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMsg(null);
                      }}
                      className="text-emerald-900 font-bold hover:underline cursor-pointer"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                </div>
              )}

              {/* ================= VIEW 3: QUÊN MẬT KHẨU (FORGOT PASSWORD) ================= */}
              {authMode === 'forgot' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMsg(null);
                        setResetSent(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-700 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay lại Đăng nhập</span>
                    </button>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Khôi phục mật khẩu
                    </span>
                  </div>

                  {!resetSent ? (
                    <>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Nhập địa chỉ email tài khoản của bạn. Hệ thống sẽ gửi một email xác thực kèm liên kết khôi phục an toàn tới hòm thư của bạn.
                      </p>

                      <form onSubmit={handleSendResetEmail} className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Địa chỉ Email đã đăng ký
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="ten-cua-ban@gmail.com"
                              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="interactive-btn w-full py-3 px-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 hover:from-emerald-900 hover:to-emerald-800 text-amber-300 font-bold text-xs rounded-xl shadow-[0_4px_16px_rgba(6,78,59,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                          ) : (
                            <Send className="w-4 h-4 text-amber-300" />
                          )}
                          <span>{loading ? 'Đang gửi email...' : 'Gửi email khôi phục mật khẩu'}</span>
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setErrorMsg(null);
                          setResetSent(false);
                        }}
                        className="interactive-btn w-full py-3 px-4 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Quay lại Đăng nhập ngay</span>
                      </button>
                    </div>
                  )}

                  <div className="text-center pt-2 border-t border-stone-100 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMsg(null);
                        setResetSent(false);
                      }}
                      className="text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Nhớ lại mật khẩu? <strong className="text-emerald-900">Đăng nhập</strong>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Security Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-3 border-t border-stone-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Mã hóa bảo mật 256-bit · Đồng bộ an toàn Đất Tổ Phú Thọ</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
