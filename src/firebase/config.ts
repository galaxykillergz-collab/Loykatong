import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  initializeAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import rawFirebaseConfig from '../../firebase-applet-config.json';

export interface FirebaseAppletConfig {
  projectId?: string;
  appId?: string;
  apiKey?: string;
  authDomain?: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
}

export const firebaseConfig: FirebaseAppletConfig = rawFirebaseConfig;

export const BOOTSTRAPPED_ADMIN_EMAIL = 'galaxykillergz@gmail.com';

/**
 * ตรวจสอบว่ามีการตั้งค่า Firebase Config จริงหรือไม่
 * หากยังเป็นค่าว่างหรือค่าตัวอย่าง แอปจะสลับเข้าสู่โหมดตัวอย่าง (Demo / Local Mode) อัตโนมัติ
 */
export function hasValidFirebaseConfig(cfg: FirebaseAppletConfig = firebaseConfig): boolean {
  if (!cfg || !cfg.apiKey || !cfg.projectId || !cfg.appId) return false;
  const placeholders = ['YOUR_API_KEY', 'MY_API_KEY', 'remixed-project-id', 'YOUR_PROJECT_ID'];
  return !placeholders.some(
    (p) => cfg.apiKey?.includes(p) || cfg.projectId?.includes(p)
  );
}

export const isFirebaseConfigured = hasValidFirebaseConfig();

let app: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

function resolveAuth(firebaseApp: FirebaseApp): Auth {
  try {
    return getAuth(firebaseApp);
  } catch {
    return initializeAuth(firebaseApp, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  }
}

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  firestoreInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
  authInstance = resolveAuth(app);
}

export const db = firestoreInstance;
export const auth = authInstance;

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
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) ?? [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function signInWithGoogle(): Promise<User> {
  if (!auth) {
    throw new Error('ยังไม่ได้เชื่อมต่อ Firebase Authentication');
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export function subscribeAuthState(
  callback: (user: User | null) => void
): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function checkIsAdminUser(user: User | null): Promise<boolean> {
  if (!user) return false;
  if (
    user.emailVerified &&
    user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL
  ) {
    return true;
  }
  if (!db) return false;
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

export async function testConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    return true;
  }
}

if (isFirebaseConfigured) {
  void testConnection();
}
