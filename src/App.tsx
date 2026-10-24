import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
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
  healAndMergeDestinations
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

import { DESTINATIONS_DATA } from './data/destinations';
import { Destination, AppAnnouncement, AppUISettings } from './types';
import { Compass, MapPin, Calendar, BookOpen, Shield, Sparkles, ExternalLink } from 'lucide-react';

export default function App() {
  const [destinations, setDestinations] = useState<Destination[]>(DESTINATIONS_DATA);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'gallery' | 'activities' | 'location'>('overview');
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<MainTabType>('destinations');
  const [plannerInitialPrompt, setPlannerInitialPrompt] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Admin, System & UI Appearance state
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null | 'new'>(null);
  const [announcement, setAnnouncement] = useState<AppAnnouncement | null>(null);
  const [uiSettings, setUiSettings] = useState<AppUISettings>(() => getInitialUISettings());

  const isAdmin = isUserAdmin(currentUser?.email);

  // Track Firebase Auth state & notify Admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
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
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const dest = destinations.find((d) => d.id === id);
      if (exists) {
        if (currentUser) {
          removeFavoriteFromCloud(currentUser.uid, id).catch(console.error);
        }
        addToast(`Đã bỏ "${dest?.name || id}" khỏi danh sách yêu thích`, 'info');
        return prev.filter((item) => item !== id);
      } else {
        if (currentUser) {
          saveFavoriteToCloud(currentUser.uid, id, dest?.name || id).catch(console.error);
        }
        addToast(`Đã lưu "${dest?.name || id}" vào danh sách yêu thích${currentUser ? ' (Đã đồng bộ Cloud)' : ''}`, 'success');
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
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800 selection:bg-emerald-900 selection:text-white">
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

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Compact Hero Banner */}
        <HeroSection
          destinations={destinations}
          onSelectDestination={(dest) => setSelectedDestination(dest)}
          onOpenDigitalMap={() => handleTabChange('map')}
          uiSettings={uiSettings}
        />

        {/* Clean View Tabs Switcher Bar */}
        <div className="bg-white/95 backdrop-blur-md border-b border-stone-200/90 sticky top-16 z-30 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between overflow-x-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTabChange('destinations')}
                data-cursor="Điểm đến"
                className={`interactive-btn px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'destinations'
                    ? 'bg-gradient-to-r from-emerald-900 to-emerald-950 text-white shadow-sm ring-1 ring-emerald-800'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{destinations.length} Điểm đến</span>
              </button>

              <button
                onClick={() => handleTabChange('map')}
                data-cursor="Bản đồ"
                className={`interactive-btn px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'map'
                    ? 'bg-gradient-to-r from-emerald-900 to-emerald-950 text-white shadow-sm ring-1 ring-emerald-800'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Bản đồ số & Chỉ đường</span>
              </button>

              <button
                onClick={() => handleTabChange('itineraries')}
                data-cursor="AI Lịch trình"
                className={`interactive-btn px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'itineraries'
                    ? 'bg-gradient-to-r from-emerald-900 to-emerald-950 text-amber-300 shadow-sm ring-1 ring-emerald-800'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Kiến tạo Lịch trình</span>
              </button>

              <button
                onClick={() => handleTabChange('guide')}
                data-cursor="Cẩm nang"
                className={`interactive-btn px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'guide'
                    ? 'bg-gradient-to-r from-emerald-900 to-emerald-950 text-white shadow-sm ring-1 ring-emerald-800'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Cẩm nang & Dự án</span>
              </button>

              {/* NGẮM PHÚ THỌ QUA 360 Link */}
              <a
                href="https://dulichphutho.com.vn/vi/explore360"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="360°"
                className="interactive-btn px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs bg-gradient-to-r from-amber-400/20 via-amber-300/30 to-amber-400/20 hover:from-amber-400/35 hover:to-amber-300/40 text-amber-950 border border-amber-400/70 group"
                title="Khám phá toàn cảnh 360 độ du lịch Phú Thọ"
              >
                <Compass className="w-3.5 h-3.5 text-amber-700 group-hover:rotate-90 transition-transform duration-500" />
                <span>NGẮM PHÚ THỌ QUA 360°</span>
                <span className="text-[9px] bg-amber-400 text-stone-950 font-extrabold px-1.5 py-0.2 rounded-full">VR</span>
                <ExternalLink className="w-3 h-3 text-amber-800/80 group-hover:text-amber-950" />
              </a>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={() => setIsAdminDashboardOpen(true)}
                  className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer border border-amber-300"
                >
                  <Shield className="w-3 h-3 text-amber-700" />
                  <span>Admin ({currentUser?.email})</span>
                </button>
              )}
              <div className="text-[11px] text-stone-500 hidden sm:block">
                Giao diện tinh gọn · Trải nghiệm trực quan
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
      <Footer onNavigateSection={(tabId) => handleTabChange(tabId as any)} uiSettings={uiSettings} />

      {/* Destination Detail Modal */}
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

      {/* Bookmarked Favorites Drawer */}
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

      {/* Google Auth & Firebase Cloud Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onShowToast={addToast}
        favoritesCount={favorites.length}
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
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
