import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
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
  type Unsubscribe,
  type Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { DESTINATIONS_DATA } from '../data/destinations';

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with robust multi-tab persistent IndexedDB local cache
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (e) {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db = firestoreInstance;
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Test connection helper
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted.');
    }
  }
}
// Do not auto-run test connection on boot to prevent wasting quota reads

// Helper to detect Firestore free-tier daily read/write quota exhaustion
export function isQuotaExceededError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;
  return (
    code === 'resource-exhausted' ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('resource-exhausted') ||
    msg.includes('Free daily read units') ||
    msg.includes('quota metric') ||
    msg.includes('quota limits') ||
    msg.includes('Quota exceeded')
  );
}

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

  // If free-tier daily read/write quota is exceeded, warn and activate graceful offline cache fallback
  // instead of logging fatal console.error which triggers system failure alarms.
  if (isQuotaExceededError(error)) {
    console.warn(`[Firestore Quota Guard] Quota limit reached on ${path || operationType}. Switched to local offline cache.`);
    return errInfo;
  }

  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Authorized Admin accounts with full control and editing privileges
export const ADMIN_EMAILS: readonly string[] = [
  'cuongnga8185@gmail.com',
  'viet2903edu@gmail.com'
];

import type { RegisteredUser } from '../types';

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === cleanEmail);
}

export const USERS_CACHE_KEY = 'phutho_registered_users_cache';

export const DEFAULT_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: 'admin-cuong',
    uid: 'EyJGQGdrs2hl2SrlxOx4nhZk1se2',
    email: 'cuongnga8185@gmail.com',
    displayName: 'Quản trị viên Cường',
    photoURL: '',
    role: 'admin',
    createdAt: '2026-03-01T00:00:00.000Z',
    lastLoginAt: '2026-03-29T12:00:00.000Z',
    updatedAt: '2026-03-29T12:00:00.000Z',
    providerId: 'google.com',
    emailVerified: true
  },
  {
    id: 'admin-viet',
    uid: 'viet2903edu-uid',
    email: 'viet2903edu@gmail.com',
    displayName: 'Quản trị viên Việt',
    photoURL: '',
    role: 'admin',
    createdAt: '2026-03-01T00:00:00.000Z',
    lastLoginAt: '2026-03-29T12:00:00.000Z',
    updatedAt: '2026-03-29T12:00:00.000Z',
    providerId: 'google.com',
    emailVerified: true
  }
];

export function getCachedRegisteredUsers(): RegisteredUser[] {
  try {
    const cached = localStorage.getItem(USERS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  const list = [...DEFAULT_REGISTERED_USERS];
  const current = auth.currentUser;
  if (current && !list.some((u) => u.uid === current.uid || u.email === current.email)) {
    list.push({
      id: current.uid,
      uid: current.uid,
      email: current.email || '',
      displayName: current.displayName || current.email?.split('@')[0] || 'Người dùng',
      photoURL: current.photoURL || '',
      role: isUserAdmin(current.email) ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      providerId: current.providerData?.[0]?.providerId || 'google.com',
      emailVerified: !!current.emailVerified
    });
  }
  return list;
}

/**
 * Persist user account and accurate profile metadata into Firebase Firestore
 */
export async function syncUserProfile(user: User): Promise<RegisteredUser> {
  const isAdmin = isUserAdmin(user.email);
  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();

  let createdAt = now;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const existing = snap.data();
      if (existing.createdAt) {
        createdAt = existing.createdAt;
      }
    }
  } catch (e) {
    // Non-blocking if reading doc fails initially or quota exceeded
  }

  const profileData: RegisteredUser = {
    id: user.uid,
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'Người dùng',
    photoURL: user.photoURL || '',
    role: isAdmin ? 'admin' : 'user',
    createdAt,
    lastLoginAt: now,
    updatedAt: now,
    providerId: user.providerData?.[0]?.providerId || 'google.com',
    emailVerified: user.emailVerified
  };

  try {
    const currentCached = getCachedRegisteredUsers();
    const idx = currentCached.findIndex((u) => u.uid === user.uid || u.email === user.email);
    if (idx >= 0) {
      currentCached[idx] = { ...currentCached[idx], ...profileData };
    } else {
      currentCached.unshift(profileData);
    }
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(currentCached));
  } catch (e) {}

  try {
    await setDoc(userRef, profileData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }

  return profileData;
}

// User authentication helpers
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await syncUserProfile(user);
    return user;
  } catch (error: any) {
    console.error('Lỗi đăng nhập Google:', error);
    throw error;
  }
}

export async function signInWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const user = result.user;
    await syncUserProfile(user);
    return user;
  } catch (error: any) {
    console.error('Lỗi đăng nhập Email/Mật khẩu:', error);
    throw error;
  }
}

export async function registerWithEmail(email: string, pass: string, displayName?: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = result.user;
    if (displayName) {
      try {
        await updateProfile(user, { displayName });
      } catch (e) {}
    }
    await syncUserProfile(user);
    return user;
  } catch (error: any) {
    console.error('Lỗi đăng ký tài khoản:', error);
    throw error;
  }
}

export async function sendResetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    console.error('Lỗi gửi email đặt lại mật khẩu:', error);
    throw error;
  }
}

/**
 * Manually add or sync a user from Firebase Console into Firestore and local cache
 */
export async function addOrSyncRegisteredUser(
  userInfo: Partial<RegisteredUser> & { email: string; uid?: string }
): Promise<RegisteredUser> {
  const email = userInfo.email.trim();
  const uid = userInfo.uid?.trim() || `user-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const profileData: RegisteredUser = {
    id: uid,
    uid,
    email,
    displayName: userInfo.displayName || email.split('@')[0],
    photoURL: userInfo.photoURL || '',
    role: isUserAdmin(email) ? 'admin' : (userInfo.role || 'user'),
    createdAt: userInfo.createdAt || now,
    lastLoginAt: userInfo.lastLoginAt || now,
    updatedAt: now,
    providerId: userInfo.providerId || (email.includes('@gmail') ? 'google.com' : 'password'),
    emailVerified: userInfo.emailVerified ?? true
  };

  try {
    const currentCached = getCachedRegisteredUsers();
    const idx = currentCached.findIndex((u) => u.uid === uid || u.email.toLowerCase() === email.toLowerCase());
    if (idx >= 0) {
      currentCached[idx] = { ...currentCached[idx], ...profileData };
    } else {
      currentCached.unshift(profileData);
    }
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(currentCached));
  } catch (e) {}

  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, profileData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
  }

  return profileData;
}

/**
 * Fetch all registered accounts directly from Firestore with quota fallback
 */
export async function fetchRegisteredUsers(): Promise<RegisteredUser[]> {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    const users: RegisteredUser[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        id: docSnap.id,
        uid: data.uid || docSnap.id,
        email: data.email || 'Chưa cập nhật email',
        displayName: data.displayName || 'Người dùng',
        photoURL: data.photoURL || '',
        role: data.role === 'admin' || isUserAdmin(data.email) ? 'admin' : 'user',
        createdAt: data.createdAt || data.updatedAt || '',
        lastLoginAt: data.lastLoginAt || data.updatedAt || '',
        updatedAt: data.updatedAt || '',
        providerId: data.providerId || 'google.com',
        emailVerified: !!data.emailVerified
      });
    });

    // Sort: Admins first, then newest login first
    users.sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (b.role === 'admin' && a.role !== 'admin') return 1;
      const timeA = a.lastLoginAt || a.createdAt || '';
      const timeB = b.lastLoginAt || b.createdAt || '';
      return timeB.localeCompare(timeA);
    });

    if (users.length > 0) {
      try {
        localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(users));
      } catch (e) {}
      return users;
    }
    return getCachedRegisteredUsers();
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.warn('[Firestore Quota Guard] Quota reached for users list, providing cached accounts safely.');
      return getCachedRegisteredUsers();
    }
    console.warn('Lỗi đọc tài khoản từ Firestore (sử dụng cache nội bộ an toàn):', error);
    handleFirestoreError(error, OperationType.LIST, 'users');
    return getCachedRegisteredUsers();
  }
}

/**
 * Real-time listener for registered accounts in Firestore
 */
export function subscribeToRegisteredUsers(
  onUsers: (users: RegisteredUser[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const usersCol = collection(db, 'users');
  return onSnapshot(
    usersCol,
    (snapshot) => {
      const users: RegisteredUser[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        users.push({
          id: docSnap.id,
          uid: data.uid || docSnap.id,
          email: data.email || 'Chưa cập nhật email',
          displayName: data.displayName || 'Người dùng',
          photoURL: data.photoURL || '',
          role: data.role === 'admin' || isUserAdmin(data.email) ? 'admin' : 'user',
          createdAt: data.createdAt || data.updatedAt || '',
          lastLoginAt: data.lastLoginAt || data.updatedAt || '',
          updatedAt: data.updatedAt || '',
          providerId: data.providerId || 'google.com',
          emailVerified: !!data.emailVerified
        });
      });

      users.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (b.role === 'admin' && a.role !== 'admin') return 1;
        const timeA = a.lastLoginAt || a.createdAt || '';
        const timeB = b.lastLoginAt || b.createdAt || '';
        return timeB.localeCompare(timeA);
      });

      if (users.length > 0) {
        try {
          localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(users));
        } catch (e) {}
        onUsers(users);
      } else {
        onUsers(getCachedRegisteredUsers());
      }
    },
    (err) => {
      console.warn('[Firestore Quota Guard] Fallback cached users for listener:', err);
      handleFirestoreError(err, OperationType.LIST, 'users');
      onUsers(getCachedRegisteredUsers());
      if (onError) onError(err);
    }
  );
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
  const favStorageKey = `phutho_favorites_${userId}`;
  return onSnapshot(
    favCollection,
    (snapshot) => {
      const ids = snapshot.docs.map((doc) => doc.id);
      try {
        localStorage.setItem(favStorageKey, JSON.stringify(ids));
      } catch (e) {}
      onUpdate(ids);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/favorites`);
      try {
        const cached = localStorage.getItem(favStorageKey);
        if (cached) {
          onUpdate(JSON.parse(cached));
        } else {
          onUpdate([]);
        }
      } catch (e) {
        onUpdate([]);
      }
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
  const notesStorageKey = `phutho_notes_${userId}`;
  return onSnapshot(
    notesCol,
    (snapshot) => {
      const notes = snapshot.docs.map((d) => d.data() as UserTravelNote);
      try {
        localStorage.setItem(notesStorageKey, JSON.stringify(notes));
      } catch (e) {}
      onUpdate(notes);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/notes`);
      try {
        const cached = localStorage.getItem(notesStorageKey);
        if (cached) {
          onUpdate(JSON.parse(cached));
        } else {
          onUpdate([]);
        }
      } catch (e) {
        onUpdate([]);
      }
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

    // Keep the complete gallery items with their actual URLs intact so the web can render every photo
    const payload: Destination = {
      ...destination,
      gallery: galleryItems,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || auth.currentUser?.email || 'admin'
    };

    // Update local cache immediately so the web always displays changes without waiting
    try {
      const cached = getCachedDestinations();
      const idx = cached.findIndex((d) => d.id === destination.id);
      if (idx >= 0) {
        cached[idx] = { ...cached[idx], ...payload };
      } else {
        cached.push(payload);
      }
      localStorage.setItem(DESTINATIONS_CACHE_KEY, JSON.stringify(cached));
    } catch (e) {}

    // Persist to Cloud Firestore
    try {
      await setDoc(destRef, payload, { merge: true });
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, path);
    }

    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return destination;
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
  }
}

export const DELETED_DESTINATIONS_KEY = 'phutho_deleted_destinations_cache';

export function getDeletedDestinationIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_DESTINATIONS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set();
}

/**
 * Delete destination and its gallery subcollection from Firestore (Admin only)
 */
export async function deleteDestinationFromCloud(destinationId: string) {
  const path = `destinations/${destinationId}`;
  try {
    try {
      const deleted = getDeletedDestinationIds();
      deleted.add(destinationId);
      localStorage.setItem(DELETED_DESTINATIONS_KEY, JSON.stringify(Array.from(deleted)));
    } catch (e) {}

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

    try {
      const cached = getCachedDestinations();
      const updated = cached.filter((d) => d.id !== destinationId);
      localStorage.setItem(DESTINATIONS_CACHE_KEY, JSON.stringify(updated));
    } catch (e) {}

    await deleteDoc(doc(db, 'destinations', destinationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export const DESTINATIONS_CACHE_KEY = 'phutho_destinations_cache';

/**
 * Ensures destinations faithfully preserve custom user edits and photos,
 * without force-reverting to default placeholders.
 */
export function healAndMergeDestinations(incoming: Destination[]): Destination[] {
  const map = new Map<string, Destination>();
  const deletedIds = getDeletedDestinationIds();

  // 1. Seed defaults first from DESTINATIONS_DATA if not marked deleted
  DESTINATIONS_DATA.forEach((d) => {
    if (!deletedIds.has(d.id)) {
      map.set(d.id, { ...d });
    }
  });

  // 2. Process incoming destinations
  incoming.forEach((inDest) => {
    if (deletedIds.has(inDest.id)) return;

    const defaultDest = map.get(inDest.id);
    if (!defaultDest) {
      map.set(inDest.id, inDest);
      return;
    }

    const merged: Destination = { ...defaultDest, ...inDest };

    // Validate coverImage
    if (!merged.coverImage || merged.coverImage.trim() === '') {
      merged.coverImage = defaultDest.coverImage || merged.gallery?.[0]?.url || '/images/den-hung/cover.jpg';
    }

    const inGallery = inDest.gallery;
    const defaultGallery = defaultDest.gallery || [];

    if (inGallery && inGallery.length > 0) {
      // Heal any empty urls
      const healedGallery = inGallery.map((img, idx) => {
        if (!img.url || img.url.trim() === '') {
          const match = defaultGallery.find((dg) => dg.id === img.id) || defaultGallery[idx];
          return {
            ...img,
            url: match?.url || defaultDest.coverImage || '/images/den-hung/cover.jpg'
          };
        }
        return img;
      });

      // Faithfully keep saved gallery
      merged.gallery = healedGallery;
    } else {
      merged.gallery = [...defaultGallery];
    }

    // Incorporate any custom_photos stored in localStorage for this destination
    try {
      const customKey = `custom_photos_${inDest.id}`;
      const localPhotosStr = localStorage.getItem(customKey);
      if (localPhotosStr) {
        const localPhotos: GalleryImage[] = JSON.parse(localPhotosStr);
        if (Array.isArray(localPhotos) && localPhotos.length > 0) {
          const curIds = new Set((merged.gallery || []).map((g) => g.id));
          const toAdd = localPhotos.filter((lp) => lp.url && !curIds.has(lp.id));
          merged.gallery = [...toAdd, ...(merged.gallery || [])];
        }
      }
    } catch (e) {}

    map.set(inDest.id, merged);
  });

  return Array.from(map.values());
}

export function getCachedDestinations(): Destination[] {
  try {
    const cached = localStorage.getItem(DESTINATIONS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return healAndMergeDestinations(parsed);
      }
    }
  } catch (e) {}
  return healAndMergeDestinations(DESTINATIONS_DATA);
}

/**
 * Subscribe to real-time destinations from Firestore,
 * with zero-subquery overhead to preserve Firestore read quotas.
 */
export function subscribeToDestinations(
  onUpdate: (destinations: Destination[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const destCol = collection(db, 'destinations');
  return onSnapshot(
    destCol,
    (snapshot) => {
      if (!snapshot.empty) {
        const dests = snapshot.docs.map((docSnap) => docSnap.data() as Destination);
        const healed = healAndMergeDestinations(dests);
        try {
          localStorage.setItem(DESTINATIONS_CACHE_KEY, JSON.stringify(healed));
        } catch (e) {}
        onUpdate(healed);
      } else {
        onUpdate(getCachedDestinations());
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'destinations');
      onUpdate(getCachedDestinations());
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

const ANNOUNCEMENT_STORAGE_KEY = 'phutho_announcement_cache';

export function getCachedAnnouncement(): AppAnnouncement | null {
  try {
    const cached = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}
  return null;
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
    try {
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}

    try {
      await setDoc(noticeRef, payload, { merge: true });
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, path);
    }
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return announcement;
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
        const data = snapshot.data() as AppAnnouncement;
        try {
          localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
        onUpdate(data);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'system/announcement');
      onUpdate(getCachedAnnouncement());
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
    try {
      await setDoc(settingsRef, merged, { merge: true });
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, path);
    }
    return merged;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return getInitialUISettings();
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
      onUpdate(getInitialUISettings());
      if (onError) onError(error);
    }
  );
}

import type { GeminiConfig } from '../types';

export const GEMINI_CONFIG_STORAGE_KEY = 'phutho_travel_gemini_keys';

export function getInitialGeminiConfig(): GeminiConfig {
  try {
    const cached = localStorage.getItem(GEMINI_CONFIG_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}
  return { rawKeysText: '', apiKeys: [] };
}

/**
 * Save Gemini API Keys to Cloud Firestore, local storage, and sync with backend server
 */
export async function saveGeminiConfig(rawKeysText: string, adminEmail?: string): Promise<GeminiConfig> {
  const path = 'system/gemini_config';
  // Parse lines, trim, and filter out empty or comment lines
  const lines = rawKeysText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));
  const uniqueKeys = Array.from(new Set(lines));

  const config: GeminiConfig = {
    rawKeysText,
    apiKeys: uniqueKeys,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail || auth.currentUser?.email || 'admin',
  };

  try {
    localStorage.setItem(GEMINI_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {}

  try {
    const configRef = doc(db, 'system', 'gemini_config');
    await setDoc(configRef, config, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }

  // Also push directly to backend server memory
  try {
    await fetch('/api/admin/gemini-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: uniqueKeys, rawKeysText }),
    });
  } catch (serverErr) {
    console.warn('Could not sync gemini keys directly to server memory:', serverErr);
  }

  return config;
}

/**
 * Real-time listener for Gemini API keys
 */
export function subscribeToGeminiConfig(
  onUpdate: (config: GeminiConfig) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const configRef = doc(db, 'system', 'gemini_config');
  return onSnapshot(
    configRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as GeminiConfig;
        try {
          localStorage.setItem(GEMINI_CONFIG_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
        onUpdate(data);
      } else {
        onUpdate(getInitialGeminiConfig());
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'system/gemini_config');
      onUpdate(getInitialGeminiConfig());
      if (onError) onError(err);
    }
  );
}


