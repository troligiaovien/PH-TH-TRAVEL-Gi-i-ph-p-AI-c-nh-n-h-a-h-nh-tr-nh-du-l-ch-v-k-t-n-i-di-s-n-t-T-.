import React, { useState } from 'react';
import {
  X,
  Shield,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Bell,
  Cloud,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Users,
  Database,
  Sliders,
  Check,
  UploadCloud,
  Palette,
  Image as ImageIcon,
  Type,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle,
  Eye,
  Wand2,
  Maximize2,
  Search,
  Copy,
  UserCheck,
  Calendar,
  Clock,
  Key,
  Mail,
  Filter,
  Cpu,
  Zap,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { Destination, AppAnnouncement, AppUISettings, RegisteredUser, GeminiConfig } from '../types';
import {
  ADMIN_EMAILS,
  isUserAdmin,
  saveDestinationToCloud,
  deleteDestinationFromCloud,
  seedInitialDestinationsToCloud,
  saveAppAnnouncement,
  DEFAULT_UI_SETTINGS,
  saveAppUISettings,
  subscribeToRegisteredUsers,
  fetchRegisteredUsers,
  addOrSyncRegisteredUser,
  getInitialGeminiConfig,
  saveGeminiConfig,
  subscribeToGeminiConfig
} from '../lib/firebase';
import { DESTINATIONS_DATA } from '../data/destinations';
import { BatchPhotoUploadModal } from './BatchPhotoUploadModal';

export const HERO_BG_PRESETS = [
  {
    name: 'Đồi chè Long Cốc (Biển mây)',
    desc: 'Đặc trưng Tân Sơn, đồi bát úp bồng bềnh mây sớm',
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80'
  },
  {
    name: 'Khu danh thắng Tây Thiên (Núi thiêng Tam Đảo)',
    desc: 'Cảnh sắc mây ngàn u tịch, thiền viện thanh tịnh',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'
  },
  {
    name: 'Đền Hùng linh thiêng (Non thiêng Nghĩa Lĩnh)',
    desc: 'Cội nguồn non sông Đất Tổ ngàn năm văn hiến',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80'
  },
  {
    name: 'Đại ngàn Vườn Quốc Gia Xuân Sơn',
    desc: 'Rừng nguyên sinh hùng vĩ, thác nước mát lành',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80'
  }
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function compressImageToDataUrl(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.85,
  forcePng = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's SVG, preserve vector markup as data URL directly so there's zero rasterization or black backdrop
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Enable ultra-high quality image smoothing filter
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Clear canvas with transparent pixels (NEVER draw black/white default)
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // For PNG, WebP or when forcePng is requested: ALWAYS use image/png to retain alpha transparency!
        const isTransparentType = forcePng || file.type === 'image/png' || file.type === 'image/webp';
        try {
          if (isTransparentType) {
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(canvas.toDataURL('image/jpeg', quality));
          }
        } catch {
          resolve(canvas.toDataURL('image/png'));
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Intelligent background isolation tool: converts solid black or solid white background to 100% transparent alpha
 */
function removeBackgroundFromDataUrl(
  dataUrl: string,
  targetColor: 'black' | 'white',
  tolerance = 45
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (targetColor === 'black') {
          const maxVal = Math.max(r, g, b);
          if (maxVal < tolerance) {
            data[i + 3] = 0; // Completely transparent
          } else if (maxVal < tolerance + 25) {
            // Smooth edge anti-aliasing
            data[i + 3] = Math.round(((maxVal - tolerance) / 25) * data[i + 3]);
          }
        } else {
          const minVal = Math.min(r, g, b);
          if (minVal > 255 - tolerance) {
            data[i + 3] = 0; // Completely transparent
          } else if (minVal > 255 - tolerance - 25) {
            data[i + 3] = Math.round(((255 - minVal) / (tolerance + 25)) * data[i + 3]);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  destinations: Destination[];
  onOpenEditDestination: (dest: Destination | null) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  announcement: AppAnnouncement | null;
  onRefreshData: () => void;
  uiSettings?: AppUISettings;
  onUpdateUISettings?: (settings: AppUISettings) => void;
}

function formatVietnamDateTime(isoStr?: string): string {
  if (!isoStr) return 'Chưa cập nhật';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return isoStr;
  }
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  destinations,
  onOpenEditDestination,
  onShowToast,
  announcement,
  onRefreshData,
  uiSettings,
  onUpdateUISettings,
}) => {
  const [activeTab, setActiveTab] = useState<'destinations' | 'announcement' | 'registered_users' | 'gemini_keys' | 'admins' | 'ui_settings'>('destinations');
  const [seeding, setSeeding] = useState(false);
  const [batchUploadDestId, setBatchUploadDestId] = useState<string | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Gemini API Keys State
  const [geminiConfig, setGeminiConfig] = useState<GeminiConfig>(() => getInitialGeminiConfig());
  const [geminiInputText, setGeminiInputText] = useState<string>(() => getInitialGeminiConfig().rawKeysText || '');
  const [savingGemini, setSavingGemini] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResults, setGeminiTestResults] = useState<any[] | null>(null);

  // Sync Gemini Config from Firestore in real-time
  React.useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToGeminiConfig(
      (cfg) => {
        setGeminiConfig(cfg);
        if (cfg.rawKeysText !== undefined && cfg.rawKeysText !== null) {
          setGeminiInputText(cfg.rawKeysText);
        }
      },
      (err) => {
        console.warn('Gemini config sync notice:', err);
      }
    );
    return () => unsub();
  }, [isOpen]);

  const handleSaveGeminiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGemini(true);
    try {
      const saved = await saveGeminiConfig(geminiInputText, currentUser?.email || 'admin');
      setGeminiConfig(saved);
      onShowToast(`Đã lưu và kích hoạt ${saved.apiKeys.length} Gemini API Key cho toàn hệ thống!`, 'success');
    } catch (err: any) {
      onShowToast(`Lỗi lưu API Key: ${err.message || err}`, 'error');
    } finally {
      setSavingGemini(false);
    }
  };

  const handleTestGeminiKeys = async () => {
    setTestingGemini(true);
    setGeminiTestResults(null);
    try {
      const lines = geminiInputText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('#'));
      const uniqueKeys = Array.from(new Set(lines));

      if (uniqueKeys.length === 0) {
        onShowToast('Vui lòng nhập ít nhất một Gemini API Key để kiểm tra!', 'info');
        setTestingGemini(false);
        return;
      }

      const res = await fetch('/api/admin/gemini-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: uniqueKeys }),
      });
      const data = await res.json();
      if (data.success) {
        setGeminiTestResults(data.results);
        const activeCount = data.results.filter((r: any) => r.status === 'active').length;
        onShowToast(`Kiểm tra xong: ${activeCount}/${data.results.length} API Key đang hoạt động tốt!`, 'success');
      } else {
        onShowToast(`Lỗi kiểm tra: ${data.error || 'Không xác định'}`, 'error');
      }
    } catch (err: any) {
      onShowToast(`Lỗi kết nối kiểm tra: ${err.message || err}`, 'error');
    } finally {
      setTestingGemini(false);
    }
  };

  // Registered Users from Firebase state
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [newUid, setNewUid] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Real-time synchronization of registered accounts from Firebase Firestore
  React.useEffect(() => {
    if (!isOpen) return;
    setLoadingUsers(true);
    const unsubscribe = subscribeToRegisteredUsers(
      (users) => {
        setRegisteredUsers(users);
        setLoadingUsers(false);
      },
      (err) => {
        console.warn('Real-time users fetch notice:', err);
        setLoadingUsers(false);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  const handleManualRefreshUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await fetchRegisteredUsers();
      setRegisteredUsers(users);
      onShowToast(`Đã tải dữ liệu chính xác: ${users.length} tài khoản người dùng.`, 'success');
    } catch (err: any) {
      onShowToast(`Lỗi lấy dữ liệu tài khoản: ${err.message || err}`, 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      onShowToast('Vui lòng nhập địa chỉ email.', 'error');
      return;
    }
    setIsAddingUser(true);
    try {
      const added = await addOrSyncRegisteredUser({
        email: newEmail.trim(),
        displayName: newName.trim() || undefined,
        role: newRole,
        uid: newUid.trim() || undefined
      });
      setRegisteredUsers((prev) => {
        const idx = prev.findIndex(
          (u) => u.uid === added.uid || u.email.toLowerCase() === added.email.toLowerCase()
        );
        if (idx >= 0) {
          const upd = [...prev];
          upd[idx] = added;
          return upd;
        }
        return [added, ...prev];
      });
      onShowToast(`Đã đồng bộ tài khoản "${added.email}" thành công!`, 'success');
      setNewEmail('');
      setNewName('');
      setNewUid('');
      setIsAddUserOpen(false);
    } catch (err: any) {
      onShowToast(`Lỗi thêm tài khoản: ${err.message || err}`, 'error');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      onShowToast(`Đã sao chép ${label}`, 'success');
      setCopiedUid(text);
      setTimeout(() => setCopiedUid(null), 2500);
    });
  };

  const handleOpenBatchUpload = (destId?: string | null) => {
    setBatchUploadDestId(destId || (destinations[0]?.id ?? null));
    setIsBatchModalOpen(true);
  };

  // UI Customization Form State
  const [uiForm, setUiForm] = useState<AppUISettings>(() => {
    return uiSettings ? { ...DEFAULT_UI_SETTINGS, ...uiSettings } : DEFAULT_UI_SETTINGS;
  });
  const [savingUi, setSavingUi] = useState(false);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [isProcessingBg, setIsProcessingBg] = useState(false);

  // Sync state if uiSettings prop updates from cloud
  React.useEffect(() => {
    if (uiSettings) {
      setUiForm((prev) => ({ ...DEFAULT_UI_SETTINGS, ...prev, ...uiSettings }));
    }
  }, [uiSettings]);

  // Announcement state
  const [annForm, setAnnForm] = useState<AppAnnouncement>(() => {
    if (announcement) return announcement;
    return {
      enabled: false,
      title: 'Chào mừng mùa Lễ hội Đền Hùng 2026',
      content: 'Chào mừng quý khách đến với vùng Đất Tổ Phú Thọ! Cập nhật thời tiết thuận lợi, lưu ý di chuyển tại các cung đường chính.',
      type: 'festival',
      link: ''
    };
  });
  const [savingAnn, setSavingAnn] = useState(false);

  // Helper to load logo files: preserves 100% original raw file bytes without downscaling for max crispness
  const handleLogoFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Vui lòng chọn tệp hình ảnh (PNG, SVG, WebP, JPG)', 'error');
      return;
    }
    setIsProcessingLogo(true);
    try {
      // 1. If SVG, WebP, PNG or file is <= 720KB (fits directly into Firestore without hitting 1MB document limit):
      // Keep 100% of the EXACT ORIGINAL RAW BYTES via FileReader DataURL!
      // This guarantees ZERO compression artifacts, zero downscaling, and pixel-for-pixel original sharpness!
      if (file.type === 'image/svg+xml' || file.size <= 720 * 1024) {
        const originalDataUrl = await readFileAsDataUrl(file);
        setUiForm((prev) => ({ ...prev, logoUrl: originalDataUrl }));
        onShowToast(
          '✓ Đã giữ 100% ĐỘ NÉT GỐC của tệp ảnh (Pixel-perfect nguyên bản, không nén mờ)! Nhấn "LƯU VÀ ÁP DỤNG" bên dưới.',
          'success'
        );
        return;
      }

      // 2. If file is larger than 720KB (e.g. large uncompressed graphic > 1MB):
      // Gently optimize to crisp high-resolution 2400px Retina canvas with high smoothing quality & PNG lossless alpha
      const highResCrisp = await compressImageToDataUrl(file, 2400, 1200, 0.98, true);
      setUiForm((prev) => ({ ...prev, logoUrl: highResCrisp }));
      onShowToast(
        '✓ Đã nạp và tối ưu độ nét cao chuẩn Retina (2400px, không vỡ hạt)! Nhấn "LƯU VÀ ÁP DỤNG" bên dưới.',
        'success'
      );
    } catch (err: any) {
      onShowToast(`Lỗi xử lý ảnh: ${err.message || err}`, 'error');
    } finally {
      setIsProcessingLogo(false);
    }
  };

  // Instant Magic Background Isolation: converts solid black or solid white background to 100% transparent alpha
  const handleRemoveLogoBg = async (targetColor: 'black' | 'white') => {
    if (!uiForm.logoUrl) {
      onShowToast('Chưa có ảnh logo để tách nền!', 'error');
      return;
    }
    setIsProcessingLogo(true);
    try {
      const transparentDataUrl = await removeBackgroundFromDataUrl(
        uiForm.logoUrl,
        targetColor,
        targetColor === 'black' ? 45 : 30
      );
      setUiForm((prev) => ({ ...prev, logoUrl: transparentDataUrl }));
      onShowToast(
        `Đã tách nền ${targetColor === 'black' ? 'đen' : 'trắng'} thành công! Logo hiện đã trong suốt hoàn toàn. Hãy nhấn "LƯU VÀ ÁP DỤNG".`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      onShowToast(`Lỗi tách nền: ${err.message || err}`, 'error');
    } finally {
      setIsProcessingLogo(false);
    }
  };

  const handleHeroBgFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Vui lòng chọn tệp hình ảnh (PNG, JPG, WebP)', 'error');
      return;
    }
    setIsProcessingBg(true);
    try {
      const compressed = await compressImageToDataUrl(file, 1600, 900, 0.85);
      setUiForm((prev) => ({ ...prev, heroBgUrl: compressed }));
      onShowToast('Đã nạp ảnh nền bìa thành công! Hãy nhấn "Lưu Giao Diện" bên dưới.', 'success');
    } catch (err: any) {
      onShowToast(`Lỗi xử lý ảnh nền: ${err.message || err}`, 'error');
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleSaveUISettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUi(true);
    try {
      const saved = await saveAppUISettings(uiForm, currentUser?.email || 'admin');
      if (onUpdateUISettings) {
        onUpdateUISettings(saved);
      }
      onShowToast('Đã lưu cấu hình giao diện & thương hiệu thành công! Hiển thị ngay lập tức.', 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast(`Lỗi lưu giao diện: ${err.message || err}`, 'error');
    } finally {
      setSavingUi(false);
    }
  };

  const handleResetUIDefaults = () => {
    if (confirm('Khôi phục giao diện trang chủ về thiết kế chuẩn mặc định (tiêu đề sắc nét "CHẠM MIỀN DI SẢN MỞ LỐI HÀNH TRÌNH", bỏ nền mờ và logo gốc)?')) {
      setUiForm(DEFAULT_UI_SETTINGS);
    }
  };

  if (!isOpen) return null;

  const handleSeedDefaults = async () => {
    if (
      !confirm(
        'Thao tác này sẽ tải và đồng bộ toàn bộ 5 di tích danh thắng mẫu lên cơ sở dữ liệu Cloud Firestore để sẵn sàng chỉnh sửa trực tuyến. Bạn có muốn tiếp tục?'
      )
    ) {
      return;
    }
    setSeeding(true);
    try {
      await seedInitialDestinationsToCloud(DESTINATIONS_DATA, currentUser?.email || 'admin');
      onShowToast('Đã đồng bộ 5 điểm di tích lên hệ thống dữ liệu thành công!', 'success');
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      onShowToast(`Lỗi đồng bộ: ${err.message || err}`, 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteDest = async (dest: Destination) => {
    if (!confirm(`Bạn có chắc muốn xóa điểm di tích "${dest.name}" khỏi cơ sở dữ liệu không?`)) {
      return;
    }
    try {
      await deleteDestinationFromCloud(dest.id);
      onShowToast(`Đã xóa "${dest.name}" khỏi hệ thống`, 'info');
      onRefreshData();
    } catch (err: any) {
      onShowToast(`Lỗi xóa: ${err.message || err}`, 'error');
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnn(true);
    try {
      await saveAppAnnouncement(annForm, currentUser?.email || 'admin');
      onShowToast(
        annForm.enabled
          ? 'Đã phát sóng thông báo toàn app thành công!'
          : 'Đã lưu và tắt thông báo toàn app.',
        'success'
      );
    } catch (err: any) {
      onShowToast(`Lỗi lưu thông báo: ${err.message || err}`, 'error');
    } finally {
      setSavingAnn(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Shield className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold">BẢNG QUẢN TRỊ HỆ THỐNG</h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-300/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Toàn quyền kiểm soát nội dung, di tích, thông báo và cơ sở dữ liệu Cloud
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

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 py-2.5 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'destinations'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Quản lý Điểm Đến ({destinations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'announcement'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Thông báo & Sự kiện App</span>
            {annForm.enabled && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>

          {/* TAB: TÀI KHOẢN ĐÃ ĐĂNG KÝ (FIREBASE AUTH & FIRESTORE) */}
          <button
            onClick={() => setActiveTab('registered_users')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'registered_users'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Tài khoản Đã đăng ký ({registeredUsers.length})</span>
            {loadingUsers && (
              <RefreshCw className="w-3 h-3 animate-spin text-amber-300" />
            )}
          </button>

          {/* TAB: CẤU HÌNH GEMINI API KEYS (ĐA KEY - XOAY VÒNG HẾT TOKEN) */}
          <button
            onClick={() => setActiveTab('gemini_keys')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'gemini_keys'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-xs ring-1 ring-amber-400'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Gemini API Keys ({geminiConfig.apiKeys.length})</span>
            {geminiConfig.apiKeys.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'admins'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Phân quyền Admin (2)</span>
          </button>

          <button
            onClick={() => setActiveTab('ui_settings')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ui_settings'
                ? 'bg-amber-400 text-stone-950 shadow-xs ring-1 ring-amber-500'
                : 'text-stone-700 hover:text-stone-900 hover:bg-amber-100/70'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-700" />
            <span>Sửa Giao Diện & Thương Hiệu</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenBatchUpload(null)}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border border-amber-300 sm:ml-auto"
            title="Tải lên nhiều tệp ảnh từ máy tính cho bất kỳ điểm đến nào chỉ 1 lần"
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-700" />
            <span>Tải ảnh hàng loạt (Từ máy tính)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DESTINATIONS */}
          {activeTab === 'destinations' && (
            <div className="space-y-5">
              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    Kho Dữ liệu Di tích & Điểm đến Phú Thọ
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Chỉnh sửa thông tin, tải hàng loạt ảnh máy tính, ảnh bìa, gallery và tọa độ trực tuyến
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenBatchUpload(null)}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Tải lên hàng loạt ảnh từ máy tính cho địa điểm chỉ 1 lần"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-stone-950" />
                    <span>Up hàng loạt ảnh</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSeedDefaults}
                    disabled={seeding}
                    className="px-3 py-1.5 bg-white border border-stone-300 hover:border-emerald-600 text-stone-700 hover:text-emerald-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="Đồng bộ 5 di tích mặc định lên Firestore"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{seeding ? 'Đang đồng bộ...' : 'Đồng bộ 5 di tích'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenEditDestination(null);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>Thêm điểm mới</span>
                  </button>
                </div>
              </div>

              {/* Destinations List Grid */}
              <div className="space-y-2.5">
                {destinations.map((dest, idx) => (
                  <div
                    key={dest.id || idx}
                    className="p-3 bg-white border border-stone-200 hover:border-emerald-300 rounded-xl flex items-center justify-between gap-4 transition-all hover:shadow-xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {dest.coverImage ? (
                        <img
                          src={dest.coverImage}
                          alt={dest.name}
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center text-lg font-serif shrink-0">
                          🏛️
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {dest.name}
                          </span>
                          <span className="text-[10px] bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded border border-stone-200 shrink-0">
                            {dest.categoryLabel || dest.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {dest.district} · {dest.gallery?.length || 0} ảnh gallery · {dest.verifiedAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenBatchUpload(dest.id)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-semibold rounded-lg flex items-center gap-1 border border-amber-300 transition-colors cursor-pointer"
                        title={`Tải hàng loạt ảnh từ máy tính cho "${dest.name}" chỉ 1 lần`}
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-amber-700" />
                        <span className="hidden sm:inline">Up ảnh loạt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenEditDestination(dest)}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 text-xs font-semibold rounded-lg flex items-center gap-1 border border-stone-200 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-800" />
                        <span className="hidden sm:inline">Chỉnh sửa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteDest(dest)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa điểm đến"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENT BANNER */}
          {activeTab === 'announcement' && (
            <form onSubmit={handleSaveAnnouncement} className="space-y-4 max-w-2xl">
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-xs text-amber-950">
                      Trạng thái phát sóng thông báo
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={annForm.enabled}
                      onChange={(e) => setAnnForm({ ...annForm, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-800"></div>
                    <span className="ml-2 text-xs font-semibold text-stone-800">
                      {annForm.enabled ? 'Đang bật' : 'Đang tắt'}
                    </span>
                  </label>
                </div>
                <p className="text-[11px] text-stone-600">
                  Khi bật, thông báo này sẽ hiển thị ở đầu trang chủ để thông tin cho tất cả du khách
                  về các sự kiện lễ hội, cập nhật thời tiết hoặc hướng dẫn di chuyển.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Loại thông báo
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'festival', label: 'Lễ hội & Sự kiện' },
                    { id: 'info', label: 'Thông tin chung' },
                    { id: 'warning', label: 'Lưu ý & Thời tiết' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAnnForm({ ...annForm, type: t.id as any })}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        annForm.type === t.id
                          ? 'bg-emerald-900 text-white border-emerald-900'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Tiêu đề thông báo
                </label>
                <input
                  type="text"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  placeholder="VD: Lễ hội Đền Hùng 2026 chính thức mở hội"
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nội dung chi tiết
                </label>
                <textarea
                  rows={3}
                  required
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  placeholder="Nội dung khuyến cáo, thời gian, địa điểm hoặc lưu ý cho du khách..."
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Liên kết đính kèm (tùy chọn)
                </label>
                <input
                  type="text"
                  value={annForm.link || ''}
                  onChange={(e) => setAnnForm({ ...annForm, link: e.target.value })}
                  placeholder="https://... hoặc mục điều hướng"
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingAnn}
                  className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>{savingAnn ? 'Đang lưu lên Cloud...' : 'Lưu và Cập nhật Thông báo'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CÁC TÀI KHOẢN ĐÃ ĐĂNG KÝ (DỮ LIỆU CHÍNH XÁC TỪ FIREBASE) */}
          {activeTab === 'registered_users' && (
            <div className="space-y-5">
              {/* Header Banner with Database Info */}
              <div className="p-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white rounded-2xl shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-400 text-stone-950 font-bold">
                        <Users className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold tracking-tight">
                        Quản Lý Các Tài Khoản Đã Đăng Ký Hệ Thống
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-800 text-amber-300 border border-emerald-700 font-bold">
                        Đồng bộ Dữ liệu Trực tuyến
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Toàn bộ thông tin tài khoản được truy xuất và đồng bộ trực tiếp từ cơ sở dữ liệu đám mây chính xác theo thời gian thực.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(!isAddUserOpen)}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddUserOpen ? 'Đóng form' : 'Thêm / Đồng bộ tài khoản'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleManualRefreshUsers}
                      disabled={loadingUsers}
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-stone-950 ${loadingUsers ? 'animate-spin' : ''}`} />
                      <span>{loadingUsers ? 'Đang nạp...' : 'Làm mới'}</span>
                    </button>
                  </div>
                </div>

                {/* Add User Form from Firebase Console */}
                {isAddUserOpen && (
                  <form onSubmit={handleAddUserSubmit} className="p-4 bg-emerald-950/90 border border-emerald-700/80 rounded-xl space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        Đồng bộ tài khoản từ Firebase Console
                      </span>
                      <span className="text-[10px] text-stone-300">
                        Nhập email hoặc UID đã tạo trên console.firebase.google.com
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                          Địa chỉ Email (*)
                        </label>
                        <input
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="cuongnga8185@gmail.com"
                          className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                          Tên hiển thị
                        </label>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Quản trị viên Cường"
                          className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                          Quyền hạn
                        </label>
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value as any)}
                          className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
                        >
                          <option value="admin">Quản trị viên (Admin)</option>
                          <option value="user">Người dùng (User)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                          Mã UID Firebase (Tùy chọn)
                        </label>
                        <input
                          type="text"
                          value={newUid}
                          onChange={(e) => setNewUid(e.target.value)}
                          placeholder="EyJGQGdrs2hl2SrlxOx4nhZk1se2"
                          className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddUserOpen(false)}
                        className="px-3 py-1.5 text-xs text-stone-300 hover:text-white cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isAddingUser}
                        className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isAddingUser ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>{isAddingUser ? 'Đang lưu...' : 'Lưu & Đồng bộ ngay'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Firestore Database Connection Bar */}
                <div className="pt-2 border-t border-emerald-800/80 flex flex-wrap items-center justify-between text-[11px] text-stone-300 gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-amber-300" />
                    <span>Database ID:</span>
                    <code className="text-amber-200 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      ai-studio-phthtravelkhmphd-09d29755-4e4b-46f3-b002-c9e57789d672
                    </code>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bảo mật Security Rules: Đã kiểm duyệt</span>
                  </div>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider">
                      Tổng tài khoản đăng ký
                    </div>
                    <div className="text-xl font-bold text-stone-900 mt-0.5 font-mono">
                      {registeredUsers.length}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-stone-200/80 text-stone-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-amber-800 font-semibold uppercase tracking-wider">
                      Quản trị viên Super Admin
                    </div>
                    <div className="text-xl font-bold text-amber-950 mt-0.5 font-mono">
                      {registeredUsers.filter((u) => u.role === 'admin' || isUserAdmin(u.email)).length}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">
                      Người dùng / Du khách
                    </div>
                    <div className="text-xl font-bold text-emerald-950 mt-0.5 font-mono">
                      {registeredUsers.filter((u) => u.role !== 'admin' && !isUserAdmin(u.email)).length}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-200/80 text-emerald-900 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tìm theo tên hiển thị, địa chỉ email, hoặc mã định danh UID..."
                    className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                  />
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                    <Filter className="w-3 h-3 text-stone-400" />
                    <span>Lọc:</span>
                  </span>
                  {(['all', 'admin', 'user'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        userRoleFilter === role
                          ? 'bg-emerald-900 text-white shadow-xs'
                          : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
                      }`}
                    >
                      {role === 'all' && `Tất cả (${registeredUsers.length})`}
                      {role === 'admin' && `Admin (${registeredUsers.filter((u) => u.role === 'admin' || isUserAdmin(u.email)).length})`}
                      {role === 'user' && `Người dùng (${registeredUsers.filter((u) => u.role !== 'admin' && !isUserAdmin(u.email)).length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users List / Table */}
              <div className="space-y-3">
                {loadingUsers && registeredUsers.length === 0 ? (
                  <div className="p-12 text-center bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    <RefreshCw className="w-7 h-7 text-emerald-800 animate-spin mx-auto" />
                    <p className="text-xs text-stone-600 font-medium">
                      Đang kết nối hệ thống đám mây và tải danh sách tài khoản đã đăng ký...
                    </p>
                  </div>
                ) : registeredUsers.filter((u) => {
                    const isAdminRole = u.role === 'admin' || isUserAdmin(u.email);
                    if (userRoleFilter === 'admin' && !isAdminRole) return false;
                    if (userRoleFilter === 'user' && isAdminRole) return false;
                    if (userSearch.trim()) {
                      const q = userSearch.toLowerCase().trim();
                      const matchName = (u.displayName || '').toLowerCase().includes(q);
                      const matchEmail = (u.email || '').toLowerCase().includes(q);
                      const matchUid = (u.uid || u.id || '').toLowerCase().includes(q);
                      return matchName || matchEmail || matchUid;
                    }
                    return true;
                  }).length === 0 ? (
                  <div className="p-10 text-center bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                    <Users className="w-8 h-8 text-stone-400 mx-auto" />
                    <p className="text-xs font-semibold text-stone-700">
                      Không tìm thấy tài khoản nào khớp với bộ lọc
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Làm mới danh sách".
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {registeredUsers
                      .filter((u) => {
                        const isAdminRole = u.role === 'admin' || isUserAdmin(u.email);
                        if (userRoleFilter === 'admin' && !isAdminRole) return false;
                        if (userRoleFilter === 'user' && isAdminRole) return false;
                        if (userSearch.trim()) {
                          const q = userSearch.toLowerCase().trim();
                          const matchName = (u.displayName || '').toLowerCase().includes(q);
                          const matchEmail = (u.email || '').toLowerCase().includes(q);
                          const matchUid = (u.uid || u.id || '').toLowerCase().includes(q);
                          return matchName || matchEmail || matchUid;
                        }
                        return true;
                      })
                      .map((u) => {
                        const isCurrent = currentUser?.uid === u.uid || currentUser?.email?.toLowerCase() === u.email.toLowerCase();
                        const isAdminRole = u.role === 'admin' || isUserAdmin(u.email);

                        return (
                          <div
                            key={u.id || u.uid}
                            className={`p-4 rounded-2xl border transition-all ${
                              isCurrent
                                ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                                : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              {/* User Avatar & Identity */}
                              <div className="flex items-start sm:items-center gap-3">
                                <div className="relative shrink-0">
                                  {u.photoURL ? (
                                    <img
                                      src={u.photoURL}
                                      alt={u.displayName}
                                      referrerPolicy="no-referrer"
                                      className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs">
                                      {(u.displayName || u.email || 'PT').slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  {isAdminRole && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center border border-white shadow-2xs" title="Super Admin">
                                      <Shield className="w-3 h-3 text-stone-950 fill-stone-950" />
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="text-sm font-bold text-stone-900">
                                      {u.displayName || 'Người dùng'}
                                    </h5>

                                    {isCurrent && (
                                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-400 text-stone-950">
                                        Tài khoản của bạn
                                      </span>
                                    )}

                                    {isAdminRole ? (
                                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 flex items-center gap-1 shadow-2xs">
                                        <Shield className="w-2.5 h-2.5 fill-stone-950" />
                                        <span>Super Admin</span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 flex items-center gap-1">
                                        <UserCheck className="w-2.5 h-2.5 text-emerald-700" />
                                        <span>Thành viên</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 text-xs text-stone-600">
                                    <span className="flex items-center gap-1 font-mono text-stone-800">
                                      <Mail className="w-3 h-3 text-stone-400" />
                                      <span>{u.email}</span>
                                    </span>

                                    <span className="text-stone-300">•</span>

                                    <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded font-mono">
                                      {u.providerId || 'google.com'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions & Copy Buttons */}
                              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(u.email, `email ${u.email}`)}
                                  className="px-2.5 py-1 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Sao chép địa chỉ email"
                                >
                                  <Copy className="w-3 h-3 text-stone-500" />
                                  <span>Copy Email</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCopyText(u.uid, `UID ${u.uid}`)}
                                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                                    copiedUid === u.uid
                                      ? 'bg-emerald-900 text-white'
                                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                  }`}
                                  title="Sao chép mã định danh UID"
                                >
                                  <Key className="w-3 h-3 text-stone-500" />
                                  <span>{copiedUid === u.uid ? 'Đã chép UID!' : 'Copy UID'}</span>
                                </button>
                              </div>
                            </div>

                            {/* Detail Metadata Grid */}
                            <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-12 gap-2 text-[11px] text-stone-500 bg-stone-50/60 p-2.5 rounded-xl">
                              {/* UID */}
                              <div className="sm:col-span-5 flex items-center gap-1.5 font-mono truncate">
                                <span className="text-stone-400 font-bold">Mã UID:</span>
                                <span className="text-stone-800 bg-white px-1.5 py-0.5 rounded border border-stone-200 truncate select-all">
                                  {u.uid}
                                </span>
                              </div>

                              {/* Registered Date */}
                              <div className="sm:col-span-4 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                <span className="text-stone-400">Đăng ký:</span>
                                <span className="font-semibold text-stone-700">
                                  {formatVietnamDateTime(u.createdAt)}
                                </span>
                              </div>

                              {/* Last Login Date */}
                              <div className="sm:col-span-3 flex items-center gap-1.5 sm:justify-end">
                                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="text-stone-400">Hoạt động:</span>
                                <span className="font-semibold text-emerald-900">
                                  {formatVietnamDateTime(u.lastLoginAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CẤU HÌNH GEMINI API KEYS (ĐA KEY & XOAY VÒNG HẾT TOKEN) */}
          {activeTab === 'gemini_keys' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-stone-100 border border-amber-300/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Cấu hình Gemini API Key Cho Toàn Bộ Hệ Thống AI</span>
                  </h4>
                  <p className="text-xs text-stone-600">
                    Hệ thống AI Travel Planner và trợ lý du lịch sẽ ưu tiên sử dụng danh sách API Key do bạn cung cấp dưới đây.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Lấy Key từ Google AI Studio</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                  </a>
                </div>
              </div>

              {/* High Performance Mechanism Explanation Banner */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wide">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Cơ chế Xoay vòng Token Tự động (Failover High Performance)</span>
                </div>
                <div className="text-xs text-emerald-900/90 leading-relaxed space-y-1">
                  <p>
                    • <strong>Cho phép nhiều API Key:</strong> Nhập nhiều key, mỗi key trên 1 dòng riêng biệt.
                  </p>
                  <p>
                    • <strong>Tự động chuyển key khi hết Token/Quota:</strong> Nếu một API Key chạm ngưỡng giới hạn (HTTP 429 / Resource Exhausted), hệ thống sẽ ngay lập tức tự động đảo sang API Key tiếp theo trong tích tắc mà không làm gián đoạn trải nghiệm của khách du lịch.
                  </p>
                  <p>
                    • <strong>Ghi nhớ Key hoạt động:</strong> Hệ thống tự động lưu giữ vị trí key hoạt động tốt nhất để phục vụ các yêu cầu tiếp theo với tốc độ phản hồi nhanh nhất.
                  </p>
                </div>
              </div>

              {/* Form Input Section */}
              <form onSubmit={handleSaveGeminiKeys} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span>Danh sách Gemini API Key (Mỗi key một dòng):</span>
                    </label>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                      {geminiInputText.split('\n').filter((l) => l.trim().length > 10).length} API Key hợp lệ
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    value={geminiInputText}
                    onChange={(e) => setGeminiInputText(e.target.value)}
                    placeholder="Dán các API Key của bạn vào đây, mỗi key một dòng:&#10;AIzaSyD-1234567890abcdefghijklmnopqrstuv&#10;AIzaSyB-9876543210zyxwvutsrqponmlkjihgfed&#10;AIzaSyC-1122334455aabbccddeeffgghhiijjkk"
                    className="w-full text-xs p-3.5 bg-stone-900 text-amber-300 font-mono rounded-xl border border-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400 leading-relaxed selection:bg-amber-400 selection:text-stone-950"
                  />
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>Hỗ trợ cả API key cá nhân và Google Cloud Enterprise API Keys.</span>
                    <span>Tự động loại bỏ khoảng trắng và dòng trống khi lưu.</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={savingGemini}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-900 to-emerald-950 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>{savingGemini ? 'Đang lưu lên hệ thống...' : 'Lưu và Kích hoạt Toàn Hệ Thống'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestGeminiKeys}
                    disabled={testingGemini}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Zap className={`w-4 h-4 text-stone-950 ${testingGemini ? 'animate-spin' : ''}`} />
                    <span>{testingGemini ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối các API Key'}</span>
                  </button>

                  {geminiConfig.updatedAt && (
                    <span className="text-[11px] text-stone-500 ml-auto flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Cập nhật gần nhất: {formatVietnamDateTime(geminiConfig.updatedAt)}</span>
                    </span>
                  )}
                </div>
              </form>

              {/* Testing Results Inspection Panel */}
              {geminiTestResults && (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                    <span className="flex items-center gap-1.5">
                      <CheckCheck className="w-4 h-4 text-emerald-700" />
                      <span>Kết quả kiểm định thực tế từ máy chủ Gemini:</span>
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      Tổng số: {geminiTestResults.length} key
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {geminiTestResults.map((r, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                          r.status === 'active'
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : r.status === 'exhausted'
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                            : 'bg-rose-50/80 border-rose-300 text-rose-950'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-mono font-bold flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 bg-white/80 rounded text-[10px]">Key #{r.index}</span>
                            <span>{r.masked}</span>
                          </div>
                          <div className="text-[11px] text-stone-600">{r.message}</div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            r.status === 'active'
                              ? 'bg-emerald-600 text-white'
                              : r.status === 'exhausted'
                              ? 'bg-amber-500 text-stone-950'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {r.status === 'active' ? 'Hoạt động tốt' : r.status === 'exhausted' ? 'Hết token' : 'Lỗi'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ADMIN ACCOUNTS & CLOUD PERMISSIONS */}
          {activeTab === 'admins' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  Danh Sách Quản Trị Viên Tối Cao (Super Admin)
                </div>
                <p className="text-xs text-stone-600">
                  Hai địa chỉ email sau đây được cấp toàn quyền chỉnh sửa cơ sở dữ liệu và kiểm soát ứng dụng theo quy định của hệ thống:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {ADMIN_EMAILS.map((email, idx) => {
                  const isCurrent = currentUser?.email?.toLowerCase() === email.toLowerCase();
                  return (
                    <div
                      key={email}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-stone-900 block font-mono">
                              {email}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded inline-block mt-0.5">
                              Toàn quyền quản trị (Super Admin)
                            </span>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Tài khoản hiện tại
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-200/60 space-y-1 text-[11px] text-stone-600">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Quyền chỉnh sửa, thêm, xóa điểm di tích</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Quyền phát sóng thông báo toàn hệ thống</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Quyền ghi đè trực tiếp Firestore Rules</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cloud Database Info */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-800" />
                    Cơ sở dữ liệu Google Cloud Firestore
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Đang hoạt động
                  </span>
                </div>
                <div className="font-mono text-[11px] bg-white p-2.5 rounded border border-stone-200 text-stone-700 space-y-1">
                  <div>Database ID: ai-studio-phthtravelkhmphd-09d29755-4e4b-46f3-b002-c9e57789d672</div>
                  <div>Security Rules: Đã kiểm duyệt và kích hoạt quyền Admin cho 2 email trên.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SỬA GIAO DIỆN & THƯƠNG HIỆU (UI CUSTOMIZATION) */}
          {activeTab === 'ui_settings' && (
            <form onSubmit={handleSaveUISettings} className="space-y-6">
              {/* Header Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-stone-100 border border-amber-300/50 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-700" />
                    Tùy biến Giao diện Website & Thương hiệu Đất Tổ
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Thay đổi logo, ảnh nền bìa không bị chớp giật, tinh chỉnh tiêu đề sắc nét và loại bỏ nền mờ sau text.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetUIDefaults}
                  className="px-3 py-1.5 text-xs text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  title="Khôi phục thiết kế gốc"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục mặc định</span>
                </button>
              </div>

              {/* SECTION 1: LOGO & THƯƠNG HIỆU */}
              <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-800" />
                      1. Logo Website & Tên Thương Hiệu
                    </h5>
                    <p className="text-[11px] text-stone-500">
                      Tải ảnh logo từ máy tính (PNG trong suốt, SVG, JPG) hoặc nhập URL. Tự động lưu trữ và hiển thị mọi lúc không lo mất ảnh.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left: Preview Box */}
                  <div className="md:col-span-5 p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                    <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider text-center">
                      Xem trước thực tế (Chỉ hiển thị ảnh Logo)
                    </div>

                    {/* Light preview with transparency checkerboard pattern */}
                    <div>
                      <div className="text-[10px] text-stone-500 mb-1 flex items-center justify-between">
                        <span>Hiển thị trên Header (Nền sáng)</span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                          {uiForm.logoUrl ? `${uiForm.logoHeight ?? 44}px · Zoom ${uiForm.logoScale ?? 100}%` : 'Logo mặc định'}
                        </span>
                      </div>
                      <div className="min-h-20 p-3 rounded-xl border border-stone-200 flex items-center justify-center overflow-hidden bg-white relative">
                        {/* Transparency checkerboard background grid */}
                        <div
                          className="absolute inset-0 opacity-40 pointer-events-none"
                          style={{
                            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                            backgroundSize: '10px 10px'
                          }}
                        />
                        <div className="relative z-10 flex items-center justify-center max-h-full">
                          {uiForm.logoUrl ? (
                            <img
                              src={uiForm.logoUrl}
                              alt="Logo Preview"
                              style={{
                                height: `${Math.round((uiForm.logoHeight ?? 44) * ((uiForm.logoScale ?? 100) / 100) * ((uiForm.logoScaleY ?? 100) / 100))}px`,
                                transform: (uiForm.logoScaleX ?? 100) !== 100 ? `scaleX(${(uiForm.logoScaleX ?? 100) / 100})` : undefined,
                                transformOrigin: 'center center',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                              }}
                              className="w-auto max-w-full object-contain transition-transform"
                              onError={() => {}}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center font-serif text-base font-bold shadow-xs">
                                PT
                              </div>
                              <span className="font-serif text-sm font-bold text-stone-900">
                                {uiForm.logoText || 'PHÚ THỌ TRAVEL'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dark preview (Footer simulation) */}
                    <div>
                      <div className="text-[10px] text-stone-500 mb-1 flex items-center justify-between">
                        <span>Hiển thị trên Footer (Nền tối)</span>
                        <span className="text-[10px] text-stone-400">Kiểm tra viền & độ trong suốt</span>
                      </div>
                      <div className="min-h-20 p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-center overflow-hidden">
                        {uiForm.logoUrl ? (
                          <img
                            src={uiForm.logoUrl}
                            alt="Logo Dark Preview"
                            style={{
                              height: `${Math.round((uiForm.logoHeight ?? 44) * ((uiForm.logoScale ?? 100) / 100) * ((uiForm.logoScaleY ?? 100) / 100))}px`,
                              transform: (uiForm.logoScaleX ?? 100) !== 100 ? `scaleX(${(uiForm.logoScaleX ?? 100) / 100})` : undefined,
                              transformOrigin: 'center center',
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                            }}
                            className="w-auto max-w-full object-contain transition-transform"
                            onError={() => {}}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center font-serif text-base font-bold">
                              PT
                            </div>
                            <span className="font-serif text-sm font-bold text-white">
                              {uiForm.logoText || 'PHÚ THỌ TRAVEL'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Magic Background Removal Tools if Logo exists */}
                    {uiForm.logoUrl && (
                      <div className="pt-2 border-t border-stone-200/80 space-y-2">
                        <div className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                          <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Công cụ tách nền tự động:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveLogoBg('black')}
                            disabled={isProcessingLogo}
                            className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer border border-stone-700 disabled:opacity-50"
                            title="Xóa bỏ nền đen và biến các pixel đen xung quanh thành trong suốt"
                          >
                            <Wand2 className="w-3 h-3 text-amber-400" />
                            <span>Tách nền đen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveLogoBg('white')}
                            disabled={isProcessingLogo}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer border border-stone-300 disabled:opacity-50"
                            title="Xóa bỏ nền trắng và biến các pixel trắng xung quanh thành trong suốt"
                          >
                            <Wand2 className="w-3 h-3 text-stone-600" />
                            <span>Tách nền trắng</span>
                          </button>
                        </div>
                        <div className="text-[10px] text-stone-500 text-center">
                          Bấm nút trên nếu ảnh logo của bạn còn dính nền đen hoặc trắng.
                        </div>
                      </div>
                    )}

                    {uiForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setUiForm((prev) => ({
                            ...prev,
                            logoUrl: '',
                            logoHeight: 44,
                            logoScale: 100,
                            logoScaleX: 100,
                            logoScaleY: 100
                          }))
                        }
                        className="w-full text-center text-[11px] text-red-600 hover:text-red-700 underline cursor-pointer pt-1"
                      >
                        Bỏ ảnh logo riêng (Quay về huy hiệu PT + chữ)
                      </button>
                    )}
                  </div>

                  {/* Right: Controls & Guidance */}
                  <div className="md:col-span-7 space-y-3.5">
                    {/* Visual notice about image-only rendering */}
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                      <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Chế độ hiển thị: Chỉ ảnh Logo duy nhất</span>
                      </div>
                      <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                        Khi bạn tải ảnh logo lên, trang chủ sẽ <strong>chỉ hiển thị duy nhất hình ảnh Logo</strong> này trên thanh điều hướng và chân trang mà <strong>không cần kèm chữ "PHÚ THỌ AI TRAVEL"</strong>, giúp thương hiệu hiển thị trọn vẹn và gọn gàng.
                      </p>
                    </div>

                    {/* Upload from PC */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center justify-between">
                        <span>Tải ảnh logo từ máy tính (Giữ 100% độ nét gốc, không mờ):</span>
                        <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Độ nét nguyên bản · Chuẩn Retina
                        </span>
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                        <label className="px-4 py-2 bg-gradient-to-r from-emerald-900 to-emerald-950 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-xs">
                          <UploadCloud className="w-4 h-4 text-amber-300" />
                          <span>{isProcessingLogo ? 'Đang tải ảnh...' : 'Chọn tệp ảnh logo từ máy'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isProcessingLogo}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleLogoFileUpload(file);
                            }}
                          />
                        </label>
                        <span className="text-[11px] text-stone-500">
                          Bảo toàn 100% định dạng gốc (PNG trong suốt, SVG, WebP, JPG). Không bị nén làm mờ, không bị nền đen.
                        </span>
                      </div>
                    </div>

                    {/* Direct URL */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Hoặc nhập liên kết URL ảnh logo trực tiếp:
                      </label>
                      <input
                        type="url"
                        value={uiForm.logoUrl || ''}
                        onChange={(e) => setUiForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="https://example.com/logo-phutho.png (tùy chọn)"
                        className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    {/* INTERACTIVE LOGO SIZING & STRETCHING CONTROLS */}
                    <div className="p-3.5 bg-stone-100/90 border border-stone-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5 text-emerald-800" />
                          <span>Kích cỡ & Dãn tỉ lệ Logo (Phóng to, Dãn ngang, Dãn dọc)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setUiForm((prev) => ({
                              ...prev,
                              logoHeight: 44,
                              logoScale: 100,
                              logoScaleX: 100,
                              logoScaleY: 100
                            }))
                          }
                          className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-stone-200 hover:border-stone-400 transition-colors"
                          title="Đặt lại về tỉ lệ chuẩn 100%"
                        >
                          <RotateCcw className="w-3 h-3 text-stone-600" />
                          <span>Đặt lại chuẩn</span>
                        </button>
                      </div>

                      {/* 1. Phóng to / Thu nhỏ tổng thể (Zoom / Scale %) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-stone-700">1. Phóng to / Thu nhỏ tổng thể (Scale %):</span>
                          <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-stone-200">
                            {uiForm.logoScale ?? 100}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="50"
                            max="220"
                            step="5"
                            value={uiForm.logoScale ?? 100}
                            onChange={(e) =>
                              setUiForm((prev) => ({
                                ...prev,
                                logoScale: parseInt(e.target.value, 10)
                              }))
                            }
                            className="w-full accent-emerald-800 cursor-pointer"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            {[80, 100, 125, 150].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setUiForm((prev) => ({ ...prev, logoScale: val }))}
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                  (uiForm.logoScale ?? 100) === val
                                    ? 'bg-emerald-900 text-white'
                                    : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                                }`}
                              >
                                {val}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 2. Chiều cao Logo (Height in pixels) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-stone-700">2. Chiều cao Logo (Height):</span>
                          <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-stone-200">
                            {uiForm.logoHeight ?? 44}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="24"
                          max="80"
                          step="2"
                          value={uiForm.logoHeight ?? 44}
                          onChange={(e) =>
                            setUiForm((prev) => ({
                              ...prev,
                              logoHeight: parseInt(e.target.value, 10)
                            }))
                          }
                          className="w-full accent-emerald-800 cursor-pointer"
                        />
                      </div>

                      {/* 3 & 4: Dãn ngang (Scale X) & Dãn dọc (Scale Y) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/90">
                        {/* Dãn ngang */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-stone-700">3. Dãn ngang (Scale X):</span>
                            <span className="font-mono font-bold text-amber-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                              {uiForm.logoScaleX ?? 100}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="200"
                            step="5"
                            value={uiForm.logoScaleX ?? 100}
                            onChange={(e) =>
                              setUiForm((prev) => ({
                                ...prev,
                                logoScaleX: parseInt(e.target.value, 10)
                              }))
                            }
                            className="w-full accent-amber-600 cursor-pointer"
                          />
                          <div className="flex items-center justify-between text-[9px] text-stone-400">
                            <span>Co hẹp (50%)</span>
                            <span>Chuẩn (100%)</span>
                            <span>Dãn rộng (200%)</span>
                          </div>
                        </div>

                        {/* Dãn dọc */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-stone-700">4. Dãn dọc (Scale Y):</span>
                            <span className="font-mono font-bold text-amber-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                              {uiForm.logoScaleY ?? 100}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="200"
                            step="5"
                            value={uiForm.logoScaleY ?? 100}
                            onChange={(e) =>
                              setUiForm((prev) => ({
                                ...prev,
                                logoScaleY: parseInt(e.target.value, 10)
                              }))
                            }
                            className="w-full accent-amber-600 cursor-pointer"
                          />
                          <div className="flex items-center justify-between text-[9px] text-stone-400">
                            <span>Nén lùn (50%)</span>
                            <span>Chuẩn (100%)</span>
                            <span>Dãn cao (200%)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Brand Name Text for fallback & accessibility */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-stone-700">
                          Tên thương hiệu dự phòng (khi không dùng ảnh logo):
                        </label>
                        <span className="text-[10px] text-stone-400">
                          (Dùng cho SEO & fallback)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={uiForm.logoText || ''}
                        onChange={(e) => setUiForm((prev) => ({ ...prev, logoText: e.target.value }))}
                        placeholder="PHÚ THỌ TRAVEL"
                        className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ẢNH NỀN BÌA (HERO COVER BACKGROUND) */}
              <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
                    2. Ảnh Nền Bìa Trang Chủ (Hero Cover Background)
                  </h5>
                  <p className="text-[11px] text-stone-500">
                    Tải ảnh phong cảnh độ nét cao từ máy tính hoặc chọn các danh thắng biểu trưng. Hệ thống tự động nén tối ưu, không giật lag.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* File upload or URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <label className="px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-stone-100 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs border border-emerald-800">
                      <UploadCloud className="w-4 h-4 text-amber-400" />
                      <span>{isProcessingBg ? 'Đang tối ưu ảnh nền...' : 'Tải ảnh nền bìa từ máy tính'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isProcessingBg}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleHeroBgFileUpload(file);
                        }}
                      />
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={uiForm.heroBgUrl || ''}
                        onChange={(e) => setUiForm((prev) => ({ ...prev, heroBgUrl: e.target.value }))}
                        placeholder="Dán link ảnh nền bìa online..."
                        className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 font-mono"
                      />
                      {uiForm.heroBgUrl && (
                        <button
                          type="button"
                          onClick={() => setUiForm((prev) => ({ ...prev, heroBgUrl: '' }))}
                          className="px-2.5 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 shrink-0 cursor-pointer"
                          title="Bỏ ảnh nền"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Curated Landmarks Presets */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Gợi ý ảnh bìa tiêu biểu Phú Thọ:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {HERO_BG_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setUiForm((prev) => ({ ...prev, heroBgUrl: preset.url }))}
                          className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                            uiForm.heroBgUrl === preset.url
                              ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/50'
                              : 'border-stone-200 bg-white hover:border-emerald-500'
                          }`}
                        >
                          <div className="h-14 rounded-lg overflow-hidden mb-2 relative bg-stone-900">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {uiForm.heroBgUrl === preset.url && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-stone-950 font-bold" />
                              </div>
                            )}
                          </div>
                          <div className="text-[11px] font-bold text-stone-900 truncate">
                            {preset.name}
                          </div>
                          <div className="text-[10px] text-stone-500 truncate">
                            {preset.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Overlay Opacity Slider */}
                  <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                        <span>Độ tối lớp phủ nền bìa (Dark Overlay):</span>
                        <strong className="text-emerald-900 font-mono">
                          {uiForm.heroBgOverlayOpacity ?? 65}%
                        </strong>
                      </label>
                      <span className="text-[11px] text-stone-500">
                        (Khuyên dùng 60% - 75% để chữ nổi rõ nét)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="90"
                      step="5"
                      value={uiForm.heroBgOverlayOpacity ?? 65}
                      onChange={(e) =>
                        setUiForm((prev) => ({
                          ...prev,
                          heroBgOverlayOpacity: parseInt(e.target.value, 10)
                        }))
                      }
                      className="w-full accent-emerald-800 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: TIÊU ĐỀ & PHONG CÁCH CHỮ SẮC NÉT (TYPOGRAPHY) */}
              <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-800" />
                    3. Tiêu Đề Hero & Phong Cách Chữ Sắc Nét
                  </h5>
                  <p className="text-[11px] text-stone-500">
                    Cấu hình tiêu đề hai dòng cách điệu, loại bỏ bóng mờ sau chữ, tạo diện mạo sang trọng và quyền uy.
                  </p>
                </div>

                {/* Important Toggle: Remove Text Background */}
                <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="removeTextBgCheckbox"
                    checked={uiForm.removeTextBg !== false}
                    onChange={(e) =>
                      setUiForm((prev) => ({ ...prev, removeTextBg: e.target.checked }))
                    }
                    className="mt-1 w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                  <label htmlFor="removeTextBgCheckbox" className="text-xs cursor-pointer">
                    <strong className="text-stone-900 block font-bold">
                      Bỏ nền phát sáng / vầng mờ sau text tiêu đề (Khuyên dùng)
                    </strong>
                    <span className="text-stone-600 text-[11px] leading-relaxed block mt-0.5">
                      Loại bỏ hoàn toàn đốm sáng mờ ảo và lưới trang trí phía sau chữ, giúp từng nét chữ hiển thị sắc cạnh, trong trẻo, không bị bóng mờ gây nhòe mắt.
                    </span>
                  </label>
                </div>

                {/* Typography Theme Picker */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    Lựa chọn phong cách chữ (Typography Style):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'sharp_gold',
                        name: 'Hoàng Kim Sắc Cạnh',
                        desc: 'Gradient vàng ánh kim hoàng gia, sắc sảo và uy nghiêm',
                        badge: 'from-amber-100 via-amber-200 to-amber-400'
                      },
                      {
                        id: 'luminous_white',
                        name: 'Bạch Ngọc Tinh Khôi',
                        desc: 'Trắng ngọc sắc lẹm, tương phản tuyệt đối trên nền tối',
                        badge: 'from-white via-stone-100 to-stone-300'
                      },
                      {
                        id: 'emerald_modern',
                        name: 'Ngọc Bích Đất Tổ',
                        desc: 'Ngọc bích chuyển sắc ánh vàng, phong thái đương đại',
                        badge: 'from-emerald-200 via-emerald-300 to-amber-200'
                      }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() =>
                          setUiForm((prev) => ({
                            ...prev,
                            heroFontTheme: theme.id as any
                          }))
                        }
                        className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                          (uiForm.heroFontTheme || 'sharp_gold') === theme.id
                            ? 'border-amber-500 bg-white ring-2 ring-amber-400 shadow-xs'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-stone-900">{theme.name}</span>
                          {(uiForm.heroFontTheme || 'sharp_gold') === theme.id && (
                            <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />
                          )}
                        </div>
                        <div className="text-[10px] text-stone-500 leading-tight mb-2">
                          {theme.desc}
                        </div>
                        <div className="p-1.5 bg-stone-950 rounded-lg text-center">
                          <span className={`font-serif font-black text-xs text-transparent bg-clip-text bg-gradient-to-r ${theme.badge}`}>
                            CHẠM MIỀN DI SẢN
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hero Title Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-800">
                      Tiêu đề Hero chính (Hỗ trợ xuống dòng):
                    </label>
                    <span className="text-[10px] text-stone-500">
                      Mỗi dòng hiển thị riêng biệt theo phong cách sắc nét
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={uiForm.heroTitle}
                    onChange={(e) => setUiForm((prev) => ({ ...prev, heroTitle: e.target.value }))}
                    className="w-full text-xs font-serif font-bold px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 leading-snug"
                    placeholder="CHẠM MIỀN DI SẢN&#10;MỞ LỐI HÀNH TRÌNH"
                  />
                </div>

                {/* Hero Kicker */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Dòng chữ nhỏ trên tiêu đề (Kicker):
                  </label>
                  <input
                    type="text"
                    value={uiForm.heroKicker}
                    onChange={(e) => setUiForm((prev) => ({ ...prev, heroKicker: e.target.value }))}
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                    placeholder="CỔNG THÔNG TIN DU LỊCH & DI SẢN THÔNG MINH TỈNH PHÚ THỌ"
                  />
                </div>

                {/* Hero Subtitle */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phụ đề giới thiệu (Subtitle):
                  </label>
                  <textarea
                    rows={2}
                    value={uiForm.heroSubtitle}
                    onChange={(e) => setUiForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                    placeholder="Khám phá Đất Tổ Hùng Vương qua lăng kính công nghệ số..."
                  />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="p-4 bg-stone-100 border border-stone-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-stone-600 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Dữ liệu sẽ được đồng bộ ngay tức khắc lên Firestore & lưu đệm máy tính.</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={savingUi || isProcessingLogo || isProcessingBg}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingUi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu giao diện...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 font-bold" />
                        <span>LƯU & ÁP DỤNG GIAO DIỆN NGAY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-500">
            Tài khoản đăng nhập: <strong className="text-stone-800">{currentUser?.email || 'Chưa đăng nhập'}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Đóng bảng quản trị
          </button>
        </div>
      </div>

      {/* Batch Photo Uploader Modal */}
      <BatchPhotoUploadModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        destinations={destinations}
        initialDestinationId={batchUploadDestId || destinations[0]?.id}
        onSuccess={(_updatedDest, _count) => {
          onRefreshData();
        }}
        onShowToast={onShowToast}
        adminEmail={currentUser?.email || undefined}
      />
    </div>
  );
};
