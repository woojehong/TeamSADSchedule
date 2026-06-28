import { initializeApp, getApps, deleteApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase web configuration.
 * These values are safe to commit (they are public client identifiers).
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyC_ioAH2ZOtFbUvJeIaYR2M_ibeiZNk4ZU',
  authDomain: 'abandoneddogs-43520.firebaseapp.com',
  projectId: 'abandoneddogs-43520',
  storageBucket: 'abandoneddogs-43520.firebasestorage.app',
  messagingSenderId: '364257611064',
  appId: '1:364257611064:web:12f68f5f9d27bda16a45cd',
};

const app = initializeApp(firebaseConfig);

// Durable login persistence (IndexedDB → localStorage fallback). Helps keep
// the session on iOS "add to home screen" PWAs where storage is isolated.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
});
export const db = getFirestore(app);

/**
 * Creates an auth account on a secondary app instance so the
 * current (super admin) session is not replaced by the new account.
 * Returns the new account's auth uid.
 */
export async function createAuthAccountIsolated(email, password) {
  const name = `secondary-${Date.now()}`;
  const secondary = initializeApp(firebaseConfig, name);
  try {
    const secondaryAuth = getAuth(secondary);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = cred.user.uid;
    await fbSignOut(secondaryAuth);
    return uid;
  } finally {
    const orphan = getApps().find((a) => a.name === name);
    if (orphan) await deleteApp(orphan).catch(() => {});
  }
}
