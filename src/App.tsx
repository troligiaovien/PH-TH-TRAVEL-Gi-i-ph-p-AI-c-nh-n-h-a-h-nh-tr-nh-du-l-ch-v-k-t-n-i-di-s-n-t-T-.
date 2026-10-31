import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  auth,
  subscribeToAuth,
  bootstrapSyncUsersToFirebase,
  subscribeToFavorites,
  saveFavoriteToCloud,
  removeFavoriteFromCloud,
  isUserAdmin,
  subscribeToDestinations,
  saveDestinationToCloud,
  deleteDestinationFromCloud,
  subscribeToAnnouncement,
  getInitialUISettings,
  subscribeToUISettings,
  DEFAULT_UI_SETTINGS,
  syncUserProfile,
  healAndMergeDestinations,
  getCachedDestinations,
  getCachedAnnouncement
} from './lib/firebase';
import { Navbar, MainTabType } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { InteractiveDigitalMap } from './components/InteractiveDigitalMap';
import { DestinationsCatalog } from './components/DestinationsCatalog';
import { ItinerariesSection } from './components/ItinerariesSection';
import { GuideAndProjectSection } from './components/GuideAndProjectSection';
import { Footer } from './components/Footer';
import { DestinationDetailModal } from './components/DestinationDetailModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { DestinationEditModal } from './components/DestinationEditModal';
import { LoginLockGate } from './components/LoginLockGate';

import { DESTINATIONS_DATA } from './data/destinations';
import { Destination, AppAnnouncement, AppUISettings } from './types';
import { Compass, MapPin, Calendar, BookOpen, Shield, Sparkles, ExternalLink, Lock } from 'lucide-react';

export default function App() {
  const [destinations, setDestinations] = useState<Destination[]>(() => getCachedDestinations());
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'gallery' | 'activities' | 'location'>('overview');
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTabType>('destinations');
  const [plannerInitialPrompt, setPlannerInitialPrompt] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authNoticeMessage, setAuthNoticeMessage] = useState<string | null>(null);

  // Admin, System & UI Appearance state
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null | 'new'>(null);
  const [announcement, setAnnouncement] = useState<AppAnnouncement | null>(() => getCachedAnnouncement());
  const [uiSettings, setUiSettings] = useState<AppUISettings>(() => getInitialUISettings());

  const isAdmin = isUserAdmin(currentUser?.email);

  // Track Auth state (Firebase & Resilient Cloud Session) & notify Admin
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        // Sync full profile directly to Firestore 'users' collection
        syncUserProfile(user).catch((e) => console.warn('Sync profile error:', e));
        if (isUserAdmin(user.email)) {
          addToast(
            `Chào mừng Quản trị viên ${user.displayName || user.email}! Bạn có toàn quyền quản trị và chỉnh sửa hệ thống.`,
            'success'
          );
        } else {
          addToast(`Chào mừng ${user.displayName || user.email}!`, 'success');
        }
      }
    });

    // Proactively sync registered and admin accounts into Firebase Firestore
    bootstrapSyncUsersToFirebase().catch((e) => console.warn('Bootstrap sync notice:', e));

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time destinations, announcements & UI settings from Cloud Firestore
  useEffect(() => {
    const unsubDests = subscribeToDestinations(
      (cloudDests) => {
        if (cloudDests && cloudDests.length > 0) {
          setDestinations(healAndMergeDestinations(cloudDests));
        }
      },
      (err) => {
        console.warn('Destinations Firestore sync notice:', err);
      }
    );

    const unsubAnn = subscribeToAnnouncement(
      (ann) => {
        setAnnouncement(ann);
      },
      (err) => {
        console.warn('Announcement sync notice:', err);
      }
    );

    const unsubUi = subscribeToUISettings(
      (settings) => {
        setUiSettings(settings);
      },
      (err) => {
        console.warn('UI Settings sync notice:', err);
      }
    );

    return () => {
      unsubDests();
      unsubAnn();
      unsubUi();
    };
  }, []);

  const handleOpenDestination = (
    dest: Destination,
    tab: 'overview' | 'gallery' | 'activities' | 'location' = 'overview'
  ) => {
    if (!currentUser) {
      const tabLabels: Record<string, string> = {
        overview: 'Xem chi tiết',
        gallery: 'Bộ sưu tập ảnh',
        location: 'Bản đồ định vị & Chỉ đường',
        activities: 'Trải nghiệm & Hoạt động',
      };
      const label = tabLabels[tab] || 'Xem chi tiết điểm đến';
      setAuthNoticeMessage(`Tính năng "${label}" của "${dest.name}" đã bị khóa. Vui lòng đăng nhập để mở khóa xem đầy đủ thông tin.`);
      addToast(`🔒 Tính năng "${label}" đã bị khóa! Vui lòng đăng nhập để tiếp tục.`, 'error');
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedDestination(dest);
    setModalInitialTab(tab);
  };

  // Load favorites from localStorage (default is empty [])
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('phutho_travel_favorites');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Clean up legacy hardcoded default locations
      if (
        Array.isArray(parsed) &&
        parsed.length === 2 &&
        parsed.includes('den-hung') &&
        parsed.includes('doi-che-long-coc')
      ) {
        localStorage.removeItem('phutho_travel_favorites');
        return [];
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Real-time Firestore sync when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    // Upload existing local favorites to cloud only if user has saved items
    if (favorites.length > 0) {
      favorites.forEach((favId) => {
        const dest = destinations.find((d) => d.id === favId);
        saveFavoriteToCloud(currentUser.uid, favId, dest?.name || favId).catch(() => {});
      });
    }

    // Listen to real-time changes from Firestore
    const unsubscribeFavs = subscribeToFavorites(
      currentUser.uid,
      (cloudFavs) => {
        if (cloudFavs && cloudFavs.length > 0) {
          setFavorites((prev) => {
            const merged = Array.from(new Set([...prev, ...cloudFavs]));
            return merged;
          });
        }
      },
      (err) => {
        console.warn('Firestore real-time sync warning:', err);
      }
    );

    return () => unsubscribeFavs();
  }, [currentUser]);

  // Save favorites to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('phutho_travel_favorites', JSON.stringify(favorites));
    } catch {
      // localStorage error fallback
    }
  }, [favorites]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    if (!currentUser) {
      setAuthNoticeMessage('Tính năng Lưu điểm đến yêu thích đã bị khóa. Vui lòng đăng nhập để lưu trữ và đồng bộ đám mây.');
      addToast('🔒 Tính năng Lưu điểm đến yêu thích đã bị khóa! Vui lòng đăng nhập để lưu trữ.', 'error');
      setIsAuthModalOpen(true);
      return;
    }
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const dest = destinations.find((d) => d.id === id);
      if (exists) {
        removeFavoriteFromCloud(currentUser.uid, id).catch(console.error);
        addToast(`Đã bỏ "${dest?.name || id}" khỏi danh sách yêu thích`, 'info');
        return prev.filter((item) => item !== id);
      } else {
        saveFavoriteToCloud(currentUser.uid, id, dest?.name || id).catch(console.error);
        addToast(`Đã lưu "${dest?.name || id}" vào danh sách yêu thích (Đã đồng bộ Cloud)`, 'success');
        return [...prev, id];
      }
    });
  };

  const handleClearFavorites = () => {
    if (currentUser) {
      favorites.forEach((id) => {
        removeFavoriteFromCloud(currentUser.uid, id).catch(console.error);
      });
    }
    setFavorites([]);
  };

  const handleTabChange = (tab: MainTabType) => {
    if (!currentUser && tab !== 'destinations') {
      const tabNames: Record<string, string> = {
        map: 'Bản đồ số & Chỉ đường GPS',
        itineraries: 'AI Kiến tạo Lịch trình',
        guide: 'Cẩm nang & Dự án du lịch'
      };
      const label = tabNames[tab] || tab;
      setAuthNoticeMessage(`Tính năng "${label}" đã bị khóa. Vui lòng đăng nhập để mở khóa sử dụng.`);
      addToast(`🔒 Tính năng "${label}" đã bị khóa! Vui lòng đăng nhập để sử dụng.`, 'error');
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Destination Operations
  const handleSaveDestination = async (destData: Destination) => {
    try {
      await saveDestinationToCloud(destData, currentUser?.email || 'admin');
      setDestinations((prev) => {
        const idx = prev.findIndex((d) => d.id === destData.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = destData;
          return updated;
        }
        return [...prev, destData];
      });

      // Update selectedDestination if currently viewing it
      if (selectedDestination?.id === destData.id) {
        setSelectedDestination(destData);
      }

      addToast(`Đã lưu "${destData.name}" thành công!`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast(`Lỗi lưu điểm đến: ${err.message || err}`, 'error');
      throw err;
    }
  };

  const handleDeleteDestination = async (destId: string) => {
    try {
      await deleteDestinationFromCloud(destId);
      setDestinations((prev) => prev.filter((d) => d.id !== destId));
      if (selectedDestination?.id === destId) {
        setSelectedDestination(null);
      }
      addToast('Đã xóa di tích khỏi cơ sở dữ liệu.', 'info');
    } catch (err: any) {
      console.error(err);
      addToast(`Lỗi xóa: ${err.message || err}`, 'error');
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070d0b] text-stone-100 selection:bg-amber-400 selection:text-stone-950 relative overflow-x-hidden">
      {/* Radiant Imperial Heritage Ambient Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 blur-[180px] pointer-events-none rounded-full -z-10" />
      <div className="fixed top-1/3 right-10 w-[550px] h-[550px] bg-amber-500/10 blur-[180px] pointer-events-none rounded-full -z-10" />
      <div className="fixed bottom-10 left-10 w-[600px] h-[600px] bg-emerald-700/10 blur-[200px] pointer-events-none rounded-full -z-10" />

      {/* System Announcement Banner if active */}
      <AnnouncementBanner
        announcement={announcement}
        isAdmin={isAdmin}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
      />

      {/* Top Bar Navigation */}
      <Navbar
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        destinationsCount={destinations.length}
        uiSettings={uiSettings}
      />

      {/* Main Content Area: Always renders full UI like when logged in */}
      <main className="flex-1">
        {/* Compact Hero Banner */}
        <HeroSection
          destinations={destinations}
          onSelectDestination={(dest) => handleOpenDestination(dest, 'overview')}
          onOpenDigitalMap={() => handleTabChange('map')}
          uiSettings={uiSettings}
        />

        {/* Elevated View Tabs Switcher Bar with Dark Depth Dock */}
        <div className="bg-[#09120e]/95 backdrop-blur-xl border-b border-emerald-950/90 sticky top-16 z-30 shadow-[0_10px_35px_rgba(0,0,0,0.7)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between overflow-x-auto gap-4">
            <div className="flex items-center gap-1.5 p-1 bg-[#050907]/90 backdrop-blur-md rounded-2xl border border-emerald-900/70 shadow-inner shrink-0">
              <button
                onClick={() => handleTabChange('destinations')}
                data-cursor="Điểm đến"
                className={`interactive-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'destinations'
                    ? 'bg-gradient-to-r from-emerald-900 via-emerald-850 to-emerald-900 text-amber-300 shadow-[0_2px_15px_rgba(16,185,129,0.35)] ring-1 ring-amber-400/60'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${activeTab === 'destinations' ? 'text-amber-400' : 'text-stone-400'}`} />
                <span>{destinations.length} Điểm đến</span>
              </button>

              <button
                onClick={() => handleTabChange('map')}
                data-cursor="Bản đồ"
                className={`interactive-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'map'
                    ? 'bg-gradient-to-r from-emerald-900 via-emerald-850 to-emerald-900 text-amber-300 shadow-[0_2px_15px_rgba(16,185,129,0.35)] ring-1 ring-amber-400/60'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${activeTab === 'map' ? 'text-amber-400' : 'text-stone-400'}`} />
                <span>Bản đồ số & Chỉ đường</span>
                {!currentUser && <Lock className="w-3 h-3 text-stone-500" />}
              </button>

              <button
                onClick={() => handleTabChange('itineraries')}
                data-cursor="AI Lịch trình"
                className={`interactive-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'itineraries'
                    ? 'bg-gradient-to-r from-emerald-900 via-emerald-850 to-emerald-900 text-amber-300 shadow-[0_2px_15px_rgba(16,185,129,0.35)] ring-1 ring-amber-400/60'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>AI Kiến tạo Lịch trình</span>
                {!currentUser && <Lock className="w-3 h-3 text-stone-500" />}
              </button>

              <button
                onClick={() => handleTabChange('guide')}
                data-cursor="Cẩm nang"
                className={`interactive-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'guide'
                    ? 'bg-gradient-to-r from-emerald-900 via-emerald-850 to-emerald-900 text-amber-300 shadow-[0_2px_15px_rgba(16,185,129,0.35)] ring-1 ring-amber-400/60'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'guide' ? 'text-amber-400' : 'text-stone-400'}`} />
                <span>Cẩm nang & Dự án</span>
                {!currentUser && <Lock className="w-3 h-3 text-stone-500" />}
              </button>

              {/* NGẮM PHÚ THỌ QUA 360 Link */}
              <a
                href="https://dulichphutho.com.vn/vi/explore360"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!currentUser) {
                    e.preventDefault();
                    setAuthNoticeMessage('Tính năng "Ngắm Phú Thọ qua 360° VR" đã bị khóa. Vui lòng đăng nhập để mở khóa trải nghiệm.');
                    addToast('🔒 Tính năng "Ngắm Phú Thọ qua 360° VR" đã bị khóa! Vui lòng đăng nhập.', 'error');
                    setIsAuthModalOpen(true);
                  }
                }}
                data-cursor="360°"
                className="interactive-btn px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 hover:from-amber-400/40 hover:to-amber-300/50 text-amber-300 border border-amber-400/70 group shadow-[0_0_15px_rgba(245,158,11,0.25)] ml-0.5"
                title={currentUser ? "Khám phá toàn cảnh 360 độ du lịch Phú Thọ" : "Khám phá toàn cảnh 360 độ du lịch Phú Thọ (Cần đăng nhập)"}
              >
                <Compass className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-90 transition-transform duration-500" />
                <span>NGẮM PHÚ THỌ QUA 360°</span>
                {currentUser ? (
                  <>
                    <span className="text-[9px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.2 rounded-full">VR</span>
                    <ExternalLink className="w-3 h-3 text-amber-300 group-hover:text-amber-200" />
                  </>
                ) : (
                  <span className="text-[9px] bg-stone-900 text-amber-300 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 border border-amber-400/30">
                    <Lock className="w-2.5 h-2.5" /> Khóa
                  </span>
                )}
              </a>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isAdmin && (
                <button
                  onClick={() => setIsAdminDashboardOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer border border-amber-400/40 transition-colors shadow-2xs"
                >
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>Admin ({currentUser?.email?.split('@')[0]})</span>
                </button>
              )}
              <div className="text-[11px] text-stone-400 hidden lg:inline-flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Cổng thông tin Du lịch & Di sản Thông minh</span>
              </div>
            </div>
          </div>
        </div>

            {/* View 1: Destination Cards Catalog */}
            {activeTab === 'destinations' && (
              <DestinationsCatalog
                destinations={destinations}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectDestination={handleOpenDestination}
                isAdmin={isAdmin}
                onEditDestination={(dest) => setEditingDestination(dest)}
                onAddNewDestination={() => setEditingDestination('new')}
                currentUser={currentUser}
              />
            )}

            {/* View 2: Interactive Digital Map & Route Guidance */}
            {activeTab === 'map' && (
              <InteractiveDigitalMap
                destinations={destinations}
                onSelectDestination={(dest) => handleOpenDestination(dest, 'overview')}
                onOpenEarth={() => {}}
              />
            )}

            {/* View 3: Suggested Itineraries & AI Travel Planner */}
            {activeTab === 'itineraries' && (
              <ItinerariesSection
                destinations={destinations}
                currentUser={currentUser}
                onSelectDestination={(dest) => handleOpenDestination(dest, 'overview')}
                onShowToast={addToast}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                initialPrompt={plannerInitialPrompt}
              />
            )}

            {/* View 4: Concise Travel Handbook & Project Profile */}
            {activeTab === 'guide' && (
              <GuideAndProjectSection
                destinations={destinations}
                onSelectDestination={(dest) => handleOpenDestination(dest, 'overview')}
                onNavigateToTab={(tab) => handleTabChange(tab)}
                onShowToast={addToast}
                onTriggerAiPlannerWithPrompt={(prompt) => {
                  setPlannerInitialPrompt(prompt);
                  handleTabChange('itineraries');
                }}
              />
            )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateSection={(tabId) => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            addToast('Vui lòng đăng nhập để truy cập tính năng', 'info');
            return;
          }
          handleTabChange(tabId as any);
        }}
        uiSettings={uiSettings}
      />

      {/* Destination Detail Modal - Only visible when logged in */}
      {currentUser && (
        <DestinationDetailModal
          destination={selectedDestination}
          allDestinations={destinations}
          initialTab={modalInitialTab}
          isFavorite={selectedDestination ? favorites.includes(selectedDestination.id) : false}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedDestination(null)}
          onSelectRelated={(dest) => handleOpenDestination(dest, 'overview')}
          onShowToast={addToast}
          isAdmin={isAdmin}
          onEditDestination={(dest) => {
            setSelectedDestination(null);
            setEditingDestination(dest);
          }}
        />
      )}

      {/* Bookmarked Favorites Drawer - Only visible when logged in */}
      {currentUser && (
        <FavoritesDrawer
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
          favoriteIds={favorites}
          destinations={destinations}
          onRemoveFavorite={handleToggleFavorite}
          onClearAll={handleClearFavorites}
          onSelectDestination={(dest) => setSelectedDestination(dest)}
          onShowToast={addToast}
          currentUser={currentUser}
          onOpenAuth={() => {
            setIsFavoritesOpen(false);
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {/* Google Auth & Firebase Cloud Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthNoticeMessage(null);
        }}
        currentUser={currentUser}
        onShowToast={addToast}
        favoritesCount={favorites.length}
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        lockNotice={authNoticeMessage}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        currentUser={currentUser}
        destinations={destinations}
        onOpenEditDestination={(dest) => setEditingDestination(dest || 'new')}
        onShowToast={addToast}
        announcement={announcement}
        onRefreshData={() => {}}
        uiSettings={uiSettings}
        onUpdateUISettings={(updated) => setUiSettings(updated)}
      />

      {/* Destination Edit Modal (Admin Create / Edit) */}
      <DestinationEditModal
        isOpen={editingDestination !== null}
        destination={editingDestination === 'new' ? null : editingDestination}
        onClose={() => setEditingDestination(null)}
        onSave={handleSaveDestination}
        onDelete={handleDeleteDestination}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
