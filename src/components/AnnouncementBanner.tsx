import React from 'react';
import { Bell, AlertTriangle, Sparkles, X, ChevronRight, Edit3 } from 'lucide-react';
import { AppAnnouncement } from '../types';

interface AnnouncementBannerProps {
  announcement: AppAnnouncement | null;
  isAdmin: boolean;
  onOpenAdminDashboard: () => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcement,
  isAdmin,
  onOpenAdminDashboard,
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  if (!announcement || !announcement.enabled || dismissed) {
    if (!isAdmin) return null;
    return null;
  }

  const getStyle = () => {
    switch (announcement.type) {
      case 'warning':
        return {
          bg: 'bg-amber-500 text-stone-950 border-amber-600',
          icon: <AlertTriangle className="w-4 h-4 shrink-0 text-stone-950" />
        };
      case 'festival':
        return {
          bg: 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-amber-900 text-amber-200 border-amber-600/40',
          icon: <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-emerald-950 text-white border-emerald-800',
          icon: <Bell className="w-4 h-4 shrink-0 text-emerald-400" />
        };
    }
  };

  const style = getStyle();

  return (
    <aside aria-label="Thông báo toàn hệ thống" className={`w-full py-2.5 px-4 text-xs border-b ${style.bg} relative transition-all shadow-xs`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {style.icon}
          <div className="truncate text-xs">
            <strong className="font-bold mr-1.5">{announcement.title}:</strong>
            <span className="opacity-95">{announcement.content}</span>
          </div>
          {announcement.link && (
            <a
              href={announcement.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 underline font-semibold shrink-0 hover:opacity-80"
            >
              Chi tiết <ChevronRight className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <button
              onClick={onOpenAdminDashboard}
              className="px-2 py-0.5 bg-black/20 hover:bg-black/40 text-[11px] font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors"
              title="Chỉnh sửa thông báo này với quyền Admin"
            >
              <Edit3 className="w-3 h-3" />
              <span className="hidden sm:inline">Sửa thông báo</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-black/20 rounded cursor-pointer opacity-75 hover:opacity-100"
            title="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
