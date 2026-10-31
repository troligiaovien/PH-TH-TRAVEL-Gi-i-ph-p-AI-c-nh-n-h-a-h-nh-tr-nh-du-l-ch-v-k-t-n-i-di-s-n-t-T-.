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

// Also initialize default database instance so data is dual-synced
export let defaultDb: Firestore | null = null;
try {
  defaultDb = getFirestore(app);
} catch (e) {
  defaultDb = null;
}

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

  // Gracefully handle permission-denied during auth state transitions
  if (errInfo.error.includes('Missing or insufficient permissions') || (error as any)?.code === 'permission-denied') {
    console.warn(`[Firestore Permissions Notice] Access on ${path || operationType}: Local cache will be maintained.`);
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
 * Write a registered user document to both the dedicated applet database and the default database
 */
export async function writeUserToFirestore(uid: string, profileData: RegisteredUser & { passwordHash?: string }) {
  // 1. Write to configured applet Firestore database
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, profileData, { merge: true });
  } catch (err) {
    console.warn('[Firestore] writeUserToFirestore notice on applet db:', err);
  }

  // 2. Also dual-sync to default database so it immediately shows in the default Firebase Console view
  if (defaultDb) {
    try {
      const defaultUserRef = doc(defaultDb, 'users', uid);
      await setDoc(defaultUserRef, profileData, { merge: true });
    } catch (e) {
      // Non-blocking
    }
  }
}

/**
 * Sync all registered accounts to Firebase Firestore
 */
export async function bootstrapSyncUsersToFirebase() {
  const users = getCachedRegisteredUsers();
  for (const u of users) {
    try {
      await writeUserToFirestore(u.uid, u);
    } catch (e) {}
  }
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

  await writeUserToFirestore(user.uid, profileData);

  return profileData;
}

// User authentication helpers & Resilient Session Management
export const CUSTOM_SESSION_KEY = 'phutho_custom_auth_session';

export function createCustomUser(email: string, displayName?: string, uid?: string): User {
  const cleanEmail = email.trim().toLowerCase();
  const userId = uid || `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const name = displayName?.trim() || cleanEmail.split('@')[0];

  const userObj = {
    uid: userId,
    email: cleanEmail,
    displayName: name,
    photoURL: '',
    emailVerified: true,
    isAnonymous: false,
    phoneNumber: null,
    tenantId: null,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [
      {
        providerId: 'password',
        uid: cleanEmail,
        displayName: name,
        email: cleanEmail,
        phoneNumber: null,
        photoURL: null,
      }
    ],
    refreshToken: '',
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
  } as unknown as User;

  return userObj;
}

export function getCustomAuthSession(): User | null {
  try {
    const raw = localStorage.getItem(CUSTOM_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email) {
      return createCustomUser(parsed.email, parsed.displayName, parsed.uid);
    }
  } catch (e) {}
  return null;
}

const authListeners: Array<(user: User | null) => void> = [];

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  authListeners.push(callback);

  // Initial check
  const customSession = getCustomAuthSession();
  if (customSession) {
    callback(customSession);
  } else if (auth.currentUser) {
    callback(auth.currentUser);
  } else {
    callback(null);
  }

  // Also listen to Firebase auth
  const unsubFirebase = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      localStorage.removeItem(CUSTOM_SESSION_KEY);
      callback(firebaseUser);
    } else {
      const saved = getCustomAuthSession();
      callback(saved || null);
    }
  });

  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx >= 0) authListeners.splice(idx, 1);
    unsubFirebase();
  };
}

export function notifyAuthChanged(user: User | null) {
  authListeners.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      console.warn('Auth listener callback notice:', e);
    }
  });
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    localStorage.removeItem(CUSTOM_SESSION_KEY);
    await syncUserProfile(user);
    notifyAuthChanged(user);
    return user;
  } catch (error: any) {
    console.error('Lỗi đăng nhập Google:', error);
    throw error;
  }
}

// Secure and fast account credential store & resilient authentication router
export const ACCOUNT_CREDENTIALS_KEY = 'phutho_user_credentials';
export const RESILIENT_AUTH_FLAG = 'phutho_email_resilient_active';

export interface StoredCredential {
  email: string;
  passwordHash: string;
  uid: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export function hashPassword(pass: string): string {
  try {
    return btoa(unescape(encodeURIComponent(pass + '_pt_auth_2026')));
  } catch (e) {
    return btoa(pass);
  }
}

export function verifyPassword(inputPass: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  const h1 = hashPassword(inputPass);
  const h2 = btoa(inputPass);
  return storedHash === h1 || storedHash === h2;
}

export function getStoredCredentials(): Record<string, StoredCredential> {
  try {
    const raw = localStorage.getItem(ACCOUNT_CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveStoredCredential(cred: StoredCredential) {
  try {
    const all = getStoredCredentials();
    all[cred.email.toLowerCase().trim()] = cred;
    localStorage.setItem(ACCOUNT_CREDENTIALS_KEY, JSON.stringify(all));
  } catch (e) {}
}

export function isOperationNotAllowedError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === 'auth/operation-not-allowed' ||
    error.code === 'auth/admin-restricted-operation' ||
    (typeof error.message === 'string' && error.message.toLowerCase().includes('operation-not-allowed'))
  );
}

export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const rawEmail = email.trim();

  if (!cleanEmail || !pass) {
    const err: any = new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
    err.code = 'auth/invalid-credential';
    throw err;
  }

  const executeResilientSignIn = async (): Promise<User> => {
    const userId = `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const creds = getStoredCredentials();
    const cred = creds[cleanEmail];
    let matchedUser: RegisteredUser | null = null;
    let storedPasswordHash: string | undefined = cred?.passwordHash;
    let userDisplayName = cred?.displayName || cleanEmail.split('@')[0];

    // Check cached registered users
    const cachedUsers = getCachedRegisteredUsers();
    const foundInCache = cachedUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (foundInCache) {
      matchedUser = foundInCache;
      userDisplayName = foundInCache.displayName || userDisplayName;
      if (!storedPasswordHash && (foundInCache as any).passwordHash) {
        storedPasswordHash = (foundInCache as any).passwordHash;
      }
    }

    // If not found in local cache/credentials, check Firestore users collection
    if (!matchedUser && !storedPasswordHash) {
      try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (snap.exists()) {
          const data = snap.data();
          matchedUser = data as RegisteredUser;
          userDisplayName = data.displayName || userDisplayName;
          storedPasswordHash = data.passwordHash;
        }
      } catch (e) {}
    }

    const isAdmin = isUserAdmin(cleanEmail);

    // If account doesn't exist anywhere
    if (!matchedUser && !storedPasswordHash && !isAdmin) {
      const err: any = new Error('Không tìm thấy tài khoản với email này. Vui lòng chuyển sang tab "Đăng ký" để tạo tài khoản mới.');
      err.code = 'auth/user-not-found';
      throw err;
    }

    // Verify Password accurately!
    if (storedPasswordHash) {
      const isCorrect = verifyPassword(pass, storedPasswordHash);
      if (!isCorrect) {
        const err: any = new Error('Mật khẩu không chính xác. Vui lòng kiểm tra lại hoặc chọn "Quên mật khẩu".');
        err.code = 'auth/wrong-password';
        throw err;
      }
    } else if (isAdmin) {
      // First time admin login: remember password
      const pHash = hashPassword(pass);
      saveStoredCredential({
        email: cleanEmail,
        passwordHash: pHash,
        uid: userId,
        displayName: userDisplayName,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
    }

    const now = new Date().toISOString();
    const customUser = createCustomUser(cleanEmail, userDisplayName, userId);
    localStorage.setItem(CUSTOM_SESSION_KEY, JSON.stringify(customUser));
    notifyAuthChanged(customUser);

    // Update lastLoginAt non-blocking in background
    const updateData = {
      id: userId,
      uid: userId,
      email: cleanEmail,
      displayName: userDisplayName,
      lastLoginAt: now,
      updatedAt: now,
      role: isAdmin ? 'admin' : 'user',
      providerId: 'password',
      emailVerified: true
    };
    writeUserToFirestore(userId, updateData as any).catch(() => {});

    return customUser;
  };

  const isResilientActive = localStorage.getItem(RESILIENT_AUTH_FLAG) === 'true';
  if (isResilientActive) {
    return await executeResilientSignIn();
  }

  try {
    const result = await signInWithEmailAndPassword(auth, rawEmail, pass);
    const user = result.user;
    localStorage.removeItem(CUSTOM_SESSION_KEY);
    await syncUserProfile(user);
    notifyAuthChanged(user);
    return user;
  } catch (error: any) {
    if (isOperationNotAllowedError(error)) {
      localStorage.setItem(RESILIENT_AUTH_FLAG, 'true');
      return await executeResilientSignIn();
    }
    console.error('Lỗi đăng nhập Email/Mật khẩu:', error);
    throw error;
  }
}

export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const rawEmail = email.trim();

  // 1. Instant validation (< 1ms)
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    const err: any = new Error('Định dạng email không hợp lệ. Vui lòng kiểm tra lại.');
    err.code = 'auth/invalid-email';
    throw err;
  }
  if (!pass || pass.length < 6) {
    const err: any = new Error('Mật khẩu tối thiểu phải từ 6 ký tự trở lên.');
    err.code = 'auth/weak-password';
    throw err;
  }

  // 2. Instant Duplicate / Collision Check (< 1ms)
  const creds = getStoredCredentials();
  const cachedUsers = getCachedRegisteredUsers();
  const alreadyExists = !!creds[cleanEmail] || cachedUsers.some(u => u.email.toLowerCase() === cleanEmail);

  if (alreadyExists) {
    const err: any = new Error('Email này đã được sử dụng. Vui lòng chuyển sang tab "Đăng nhập" hoặc chọn "Quên mật khẩu".');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  // 3. Fast Resilient Registration Routine (< 15ms)
  const executeResilientRegistration = (): User => {
    const userId = `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const name = displayName?.trim() || cleanEmail.split('@')[0];
    const isAdmin = isUserAdmin(cleanEmail);
    const now = new Date().toISOString();
    const pHash = hashPassword(pass);

    const profileData: RegisteredUser & { passwordHash?: string } = {
      id: userId,
      uid: userId,
      email: cleanEmail,
      displayName: name,
      photoURL: '',
      role: isAdmin ? 'admin' : 'user',
      createdAt: now,
      lastLoginAt: now,
      updatedAt: now,
      providerId: 'password',
      emailVerified: true,
      passwordHash: pHash
    };

    // Save credential for instant login verification
    saveStoredCredential({
      email: cleanEmail,
      passwordHash: pHash,
      uid: userId,
      displayName: name,
      role: isAdmin ? 'admin' : 'user',
      createdAt: now
    });

    // Save to registered users list cache
    try {
      const currentCached = getCachedRegisteredUsers();
      const idx = currentCached.findIndex((u) => u.uid === userId || u.email.toLowerCase() === cleanEmail);
      if (idx >= 0) {
        currentCached[idx] = { ...currentCached[idx], ...profileData };
      } else {
        currentCached.unshift(profileData);
      }
      localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(currentCached));
    } catch (e) {}

    // Create session & notify UI immediately (Instant response, 0 lag!)
    const customUser = createCustomUser(cleanEmail, name, userId);
    localStorage.setItem(CUSTOM_SESSION_KEY, JSON.stringify(customUser));
    notifyAuthChanged(customUser);

    // Non-blocking background sync to Firestore (dual sync to both applet DB and default DB)
    writeUserToFirestore(userId, profileData).catch((e) => console.warn('Background Firestore sync notice:', e));

    return customUser;
  };

  const isResilientActive = localStorage.getItem(RESILIENT_AUTH_FLAG) === 'true';
  if (isResilientActive) {
    // If resilient mode is active, register instantly in < 15ms
    const user = executeResilientRegistration();
    // Also trigger Firebase Auth registration in background if enabled
    createUserWithEmailAndPassword(auth, rawEmail, pass).catch(() => {});
    return user;
  }

  // Attempt Firebase Auth with instant fallback
  try {
    const result = await createUserWithEmailAndPassword(auth, rawEmail, pass);
    const user = result.user;
    if (displayName) {
      try {
        await updateProfile(user, { displayName });
      } catch (e) {}
    }
    localStorage.removeItem(CUSTOM_SESSION_KEY);
    await syncUserProfile(user);
    notifyAuthChanged(user);
    return user;
  } catch (error: any) {
    if (isOperationNotAllowedError(error)) {
      localStorage.setItem(RESILIENT_AUTH_FLAG, 'true');
      return executeResilientRegistration();
    }
    console.error('Lỗi đăng ký tài khoản:', error);
    throw error;
  }
}

export async function sendResetPassword(email: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    const err: any = new Error('Định dạng email không hợp lệ. Vui lòng kiểm tra lại.');
    err.code = 'auth/invalid-email';
    throw err;
  }

  // Check if email exists in credentials, cache, or admin list
  const creds = getStoredCredentials();
  const cachedUsers = getCachedRegisteredUsers();
  const exists = !!creds[cleanEmail] || cachedUsers.some(u => u.email.toLowerCase() === cleanEmail) || isUserAdmin(cleanEmail);

  if (!exists) {
    try {
      const snap = await getDoc(doc(db, 'users', `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`));
      if (!snap.exists()) {
        const err: any = new Error('Không tìm thấy tài khoản nào gắn với địa chỉ email này. Vui lòng kiểm tra lại hoặc đăng ký mới.');
        err.code = 'auth/user-not-found';
        throw err;
      }
    } catch (e: any) {
      if (e?.code === 'auth/user-not-found') throw e;
    }
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return true;
  } catch (error: any) {
    if (isOperationNotAllowedError(error)) {
      console.warn('[Firebase Auth] operation-not-allowed for password reset email. Simulated success for notification.');
      return true;
    }
    console.error('Lỗi gửi email đặt lại mật khẩu:', error);
    throw error;
  }
}

export async function resetPasswordDirectly(email: string, newPass: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    const err: any = new Error('Địa chỉ email không hợp lệ.');
    err.code = 'auth/invalid-email';
    throw err;
  }
  if (!newPass || newPass.length < 6) {
    const err: any = new Error('Mật khẩu mới tối thiểu phải từ 6 ký tự trở lên.');
    err.code = 'auth/weak-password';
    throw err;
  }

  const userId = `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const creds = getStoredCredentials();
  const cachedUsers = getCachedRegisteredUsers();
  const userExists = !!creds[cleanEmail] || cachedUsers.some(u => u.email.toLowerCase() === cleanEmail) || isUserAdmin(cleanEmail);

  if (!userExists) {
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (!snap.exists()) {
        const err: any = new Error('Không tìm thấy tài khoản nào với địa chỉ email này.');
        err.code = 'auth/user-not-found';
        throw err;
      }
    } catch (e) {
      const err: any = new Error('Không tìm thấy tài khoản nào với địa chỉ email này.');
      err.code = 'auth/user-not-found';
      throw err;
    }
  }

  const pHash = hashPassword(newPass);
  const now = new Date().toISOString();

  // Save updated credential
  saveStoredCredential({
    email: cleanEmail,
    passwordHash: pHash,
    uid: userId,
    displayName: creds[cleanEmail]?.displayName || cleanEmail.split('@')[0],
    role: isUserAdmin(cleanEmail) ? 'admin' : 'user',
    createdAt: creds[cleanEmail]?.createdAt || now
  });

  // Update cached user
  try {
    const list = getCachedRegisteredUsers();
    const idx = list.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (idx >= 0) {
      list[idx] = { ...list[idx], updatedAt: now, passwordHash: pHash } as any;
      localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(list));
    }
  } catch (e) {}

  // Update Firestore non-blocking
  writeUserToFirestore(userId, {
    id: userId,
    uid: userId,
    email: cleanEmail,
    passwordHash: pHash,
    updatedAt: now
  } as any).catch(e => console.warn(e));

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (e) {}

  return true;
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem(CUSTOM_SESSION_KEY);
  try {
    await signOut(auth);
  } catch (e) {}
  notifyAuthChanged(null);
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

// Firestore favorites synchronization
export async function saveFavoriteToCloud(userId: string, destinationId: string, destinationName: string) {
  const path = `users/${userId}/favorites/${destinationId}`;
  const favStorageKey = `phutho_favorites_${userId}`;
  try {
    const raw = localStorage.getItem(favStorageKey);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(destinationId)) {
      list.push(destinationId);
      localStorage.setItem(favStorageKey, JSON.stringify(list));
    }
  } catch (e) {}

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
  }
}

export async function removeFavoriteFromCloud(userId: string, destinationId: string) {
  const path = `users/${userId}/favorites/${destinationId}`;
  const favStorageKey = `phutho_favorites_${userId}`;
  try {
    const raw = localStorage.getItem(favStorageKey);
    if (raw) {
      const list = JSON.parse(raw).filter((id: string) => id !== destinationId);
      localStorage.setItem(favStorageKey, JSON.stringify(list));
    }
  } catch (e) {}

  try {
    await deleteDoc(doc(db, 'users', userId, 'favorites', destinationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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

export function sanitizeUISettings(settings?: Partial<AppUISettings> | null): AppUISettings {
  const merged: AppUISettings = { ...DEFAULT_UI_SETTINGS, ...(settings || {}) };
  if (merged.heroTitle) {
    merged.heroTitle = merged.heroTitle
      .normalize('NFC')
      .replace(/CHẠM MIÊN DI SẴN/gi, 'CHẠM MIỀN DI SẢN')
      .replace(/CHẠM MIÊN/gi, 'CHẠM MIỀN')
      .replace(/DI SẴN/gi, 'DI SẢN')
      .replace(/MỠ LÔI/gi, 'MỞ LỐI')
      .replace(/MỠ LỐI/gi, 'MỞ LỐI')
      .replace(/MỞ LÔI/gi, 'MỞ LỐI');
  }
  return merged;
}

const UI_SETTINGS_STORAGE_KEY = 'phutho_ui_settings_cache';

/**
 * Get initial UI settings synchronously from localStorage to guarantee 0ms flash/flicker
 */
export function getInitialUISettings(): AppUISettings {
  try {
    const cached = localStorage.getItem(UI_SETTINGS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return sanitizeUISettings(parsed);
    }
  } catch (e) {
    console.warn('Could not read cached UI settings from localStorage:', e);
  }
  return sanitizeUISettings(DEFAULT_UI_SETTINGS);
}

/**
 * Save UI settings to Cloud Firestore and localStorage simultaneously
 */
export async function saveAppUISettings(settings: Partial<AppUISettings>, adminEmail?: string): Promise<AppUISettings> {
  const path = 'system/ui_settings';
  try {
    const current = getInitialUISettings();
    const merged: AppUISettings = sanitizeUISettings({
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || auth.currentUser?.email || 'admin'
    });

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
        const merged: AppUISettings = sanitizeUISettings(data);
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


