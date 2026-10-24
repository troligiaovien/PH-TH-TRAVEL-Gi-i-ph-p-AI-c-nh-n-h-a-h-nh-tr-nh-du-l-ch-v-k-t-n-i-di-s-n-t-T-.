import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  writeBatch,
  serverTimestamp,
  type Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Critical: Use the provisioned firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted.');
    }
  }
}
testFirestoreConnection();

// Standard error handler conforming to skill requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Authorized Admin accounts with full control and editing privileges
export const ADMIN_EMAILS: readonly string[] = [
  'cuongnga8185@gmail.com',
  'viet2903edu@gmail.com'
];

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === cleanEmail);
}

// User authentication helper
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const isAdmin = isUserAdmin(user.email);

    // Upsert user profile
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Người dùng',
      photoURL: user.photoURL || '',
      role: isAdmin ? 'admin' : 'user',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return user;
  } catch (error: any) {
    console.error('Lỗi đăng nhập Google:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    throw error;
  }
}

// Firestore favorites synchronization
export async function saveFavoriteToCloud(userId: string, destinationId: string, destinationName: string) {
  const path = `users/${userId}/favorites/${destinationId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'favorites', destinationId), {
      id: destinationId,
      destinationId,
      destinationName,
      userId,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function removeFavoriteFromCloud(userId: string, destinationId: string) {
  const path = `users/${userId}/favorites/${destinationId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'favorites', destinationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// Subscribe to favorites for a user
export function subscribeToFavorites(
  userId: string,
  onUpdate: (favoriteIds: string[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const favCollection = collection(db, 'users', userId, 'favorites');
  return onSnapshot(
    favCollection,
    (snapshot) => {
      const ids = snapshot.docs.map(doc => doc.id);
      onUpdate(ids);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/favorites`);
      if (onError) onError(error);
    }
  );
}

// User Travel Notes & Itinerary storage
export interface UserTravelNote {
  id: string;
  destinationId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export async function saveNoteToCloud(userId: string, destinationId: string, noteId: string, content: string) {
  const path = `users/${userId}/notes/${noteId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'notes', noteId), {
      id: noteId,
      destinationId,
      userId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export function subscribeToNotes(
  userId: string,
  onUpdate: (notes: UserTravelNote[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const notesCol = collection(db, 'users', userId, 'notes');
  return onSnapshot(
    notesCol,
    (snapshot) => {
      const notes = snapshot.docs.map(d => d.data() as UserTravelNote);
      onUpdate(notes);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/notes`);
      if (onError) onError(error);
    }
  );
}

// -------------------------------------------------------------
// Admin Cloud Management: Destinations & App System Control
// -------------------------------------------------------------
import type { Destination, AppAnnouncement, GalleryImage, AppUISettings } from '../types';

/**
 * Save or update destination in Firestore (Admin only)
 */
export async function saveDestinationToCloud(
  destination: Destination,
  adminEmail?: string,
  replaceGallery = false
) {
  const path = `destinations/${destination.id}`;
  try {
    const destRef = doc(db, 'destinations', destination.id);
    const galleryItems = destination.gallery || [];

    // If replaceGallery is requested, clear existing subcollection photos first
    if (replaceGallery) {
      try {
        const existingSnap = await getDocs(collection(db, 'destinations', destination.id, 'gallery'));
        if (!existingSnap.empty) {
          const delBatch = writeBatch(db);
          existingSnap.docs.forEach((d) => delBatch.delete(d.ref));
          await delBatch.commit();
        }
      } catch (delErr) {
        console.warn('Could not clear previous subcollection photos:', delErr);
      }
    }

    // Separate base64 uploaded photos from standard static/lightweight URLs
    const heavyPhotos: GalleryImage[] = [];
    const lightGallery: GalleryImage[] = [];

    for (const item of galleryItems) {
      if (item.url && item.url.startsWith('data:')) {
        heavyPhotos.push(item);
      } else {
        lightGallery.push(item);
      }
    }

    // Save heavy photos to subcollection `destinations/{destination.id}/gallery/{photo.id}`
    if (heavyPhotos.length > 0) {
      const batch = writeBatch(db);
      for (let i = 0; i < heavyPhotos.length; i++) {
        const photo = heavyPhotos[i];
        const photoRef = doc(db, 'destinations', destination.id, 'gallery', photo.id);
        batch.set(
          photoRef,
          {
            id: photo.id,
            title: photo.title || 'Hình ảnh',
            subtitle: photo.subtitle || '',
            description: photo.description || '',
            tag: photo.tag || 'Cảnh quan',
            tagColor: photo.tagColor || 'bg-emerald-100 text-emerald-950 border-emerald-300',
            location: photo.location || '',
            photographerOrSource: photo.photographerOrSource || adminEmail || 'Ban Quản trị',
            url: photo.url,
            colorGradient: photo.colorGradient || 'from-emerald-900 to-stone-900',
            symbol: photo.symbol || '📸',
            isUserUploaded: true,
            order: i,
            updatedAt: new Date().toISOString(),
            updatedBy: adminEmail || auth.currentUser?.email || 'admin'
          },
          { merge: true }
        );
      }
      await batch.commit();
    }

    // In the parent document, store lightGallery plus metadata-only copies of heavyPhotos (with empty url)
    // so the parent document size remains ~50-100KB, preventing the 1MB Firestore limit violation
    const sanitizedGallery: GalleryImage[] = [
      ...lightGallery,
      ...heavyPhotos.map((p) => ({
        id: p.id,
        title: p.title || 'Hình ảnh',
        subtitle: p.subtitle || '',
        description: p.description || '',
        tag: p.tag || 'Cảnh quan',
        tagColor: p.tagColor || '',
        location: p.location || '',
        photographerOrSource: p.photographerOrSource || '',
        url: '',
        colorGradient: p.colorGradient || '',
        symbol: p.symbol || '📸',
        isUserUploaded: true
      }))
    ];

    const payload = {
      ...destination,
      gallery: sanitizedGallery,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || auth.currentUser?.email || 'admin'
    };

    await setDoc(destRef, payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Delete a specific gallery photo from the subcollection
 */
export async function deleteGalleryPhotoFromCloud(destinationId: string, photoId: string) {
  const path = `destinations/${destinationId}/gallery/${photoId}`;
  try {
    await deleteDoc(doc(db, 'destinations', destinationId, 'gallery', photoId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

/**
 * Delete destination and its gallery subcollection from Firestore (Admin only)
 */
export async function deleteDestinationFromCloud(destinationId: string) {
  const path = `destinations/${destinationId}`;
  try {
    try {
      const galleryCol = collection(db, 'destinations', destinationId, 'gallery');
      const gallerySnap = await getDocs(galleryCol);
      if (!gallerySnap.empty) {
        const batch = writeBatch(db);
        gallerySnap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();
      }
    } catch (e) {
      console.warn('Could not delete gallery subcollection:', e);
    }

    await deleteDoc(doc(db, 'destinations', destinationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

/**
 * Subscribe to real-time destinations from Firestore,
 * automatically hydrating gallery photos from the subcollection.
 */
export function subscribeToDestinations(
  onUpdate: (destinations: Destination[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const destCol = collection(db, 'destinations');
  return onSnapshot(
    destCol,
    async (snapshot) => {
      if (!snapshot.empty) {
        try {
          const dests = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const dest = docSnap.data() as Destination;
              try {
                const galleryCol = collection(db, 'destinations', dest.id, 'gallery');
                const gallerySnap = await getDocs(galleryCol);
                if (!gallerySnap.empty) {
                  const subPhotos = gallerySnap.docs.map(
                    (d) => d.data() as GalleryImage & { order?: number }
                  );
                  subPhotos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                  const existing = dest.gallery || [];
                  const mergedMap = new Map<string, GalleryImage>();
                  for (const item of existing) {
                    if (item.url) {
                      mergedMap.set(item.id, item);
                    }
                  }
                  for (const sub of subPhotos) {
                    mergedMap.set(sub.id, sub);
                  }
                  dest.gallery = Array.from(mergedMap.values());
                }
              } catch (subErr) {
                console.warn(`Could not hydrate gallery for ${dest.id}:`, subErr);
              }
              return dest;
            })
          );
          onUpdate(dests);
        } catch (err) {
          console.error('Error hydrating destinations:', err);
          const fallbackDests = snapshot.docs.map((d) => d.data() as Destination);
          onUpdate(fallbackDests);
        }
      } else {
        onUpdate([]);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'destinations');
      if (onError) onError(error);
    }
  );
}

/**
 * Seed all default destinations into Firestore (Admin action)
 */
export async function seedInitialDestinationsToCloud(destinations: Destination[], adminEmail?: string) {
  const results = [];
  for (const dest of destinations) {
    const res = await saveDestinationToCloud(dest, adminEmail);
    results.push(res);
  }
  return results;
}

/**
 * Save system-wide announcement banner (Admin only)
 */
export async function saveAppAnnouncement(announcement: AppAnnouncement, adminEmail?: string) {
  const path = 'system/announcement';
  try {
    const noticeRef = doc(db, 'system', 'announcement');
    const payload = {
      ...announcement,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || auth.currentUser?.email || 'admin'
    };
    await setDoc(noticeRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Subscribe to system announcement
 */
export function subscribeToAnnouncement(
  onUpdate: (announcement: AppAnnouncement | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const noticeRef = doc(db, 'system', 'announcement');
  return onSnapshot(
    noticeRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as AppAnnouncement);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'system/announcement');
      if (onError) onError(error);
    }
  );
}

// -------------------------------------------------------------
// Admin UI & Appearance Customization (Hero, Logo, Cover, Fonts)
// -------------------------------------------------------------

export const DEFAULT_UI_SETTINGS: AppUISettings = {
  heroTitle: 'CHẠM MIỀN DI SẢN\nMỞ LỐI HÀNH TRÌNH',
  heroSubtitle: 'Khám phá Đất Tổ Hùng Vương qua lăng kính công nghệ số. Lập lịch trình thông minh, tra cứu di sản văn hóa, ẩm thực danh tiếng và chỉ dẫn bản đồ chính xác.',
  heroKicker: 'CỔNG THÔNG TIN DU LỊCH & DI SẢN THÔNG MINH TỈNH PHÚ THỌ',
  heroFontTheme: 'sharp_gold',
  removeTextBg: true,
  heroBgUrl: '',
  heroBgOverlayOpacity: 65,
  logoUrl: '',
  logoText: 'PHU THO AI TRAVEL',
  logoHeight: 44,
  logoScale: 100,
  logoScaleX: 100,
  logoScaleY: 100
};

const UI_SETTINGS_STORAGE_KEY = 'phutho_ui_settings_cache';

/**
 * Get initial UI settings synchronously from localStorage to guarantee 0ms flash/flicker
 */
export function getInitialUISettings(): AppUISettings {
  try {
    const cached = localStorage.getItem(UI_SETTINGS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...DEFAULT_UI_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Could not read cached UI settings from localStorage:', e);
  }
  return DEFAULT_UI_SETTINGS;
}

/**
 * Save UI settings to Cloud Firestore and localStorage simultaneously
 */
export async function saveAppUISettings(settings: Partial<AppUISettings>, adminEmail?: string): Promise<AppUISettings> {
  const path = 'system/ui_settings';
  try {
    const current = getInitialUISettings();
    const merged: AppUISettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || auth.currentUser?.email || 'admin'
    };

    // Cache locally immediately to ensure instant display on next page load
    try {
      localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn('Could not cache UI settings to localStorage:', e);
    }

    // Persist to Cloud Firestore
    const settingsRef = doc(db, 'system', 'ui_settings');
    await setDoc(settingsRef, merged, { merge: true });
    return merged;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Real-time subscription to system UI settings
 */
export function subscribeToUISettings(
  onUpdate: (settings: AppUISettings) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const settingsRef = doc(db, 'system', 'ui_settings');
  return onSnapshot(
    settingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AppUISettings;
        const merged: AppUISettings = { ...DEFAULT_UI_SETTINGS, ...data };
        try {
          localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        } catch (e) {}
        onUpdate(merged);
      } else {
        onUpdate(getInitialUISettings());
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'system/ui_settings');
      if (onError) onError(error);
    }
  );
}


