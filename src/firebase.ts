import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// Lê os nomes usados na Vercel (VITE_FIREBASE_*) e, por compatibilidade, os nomes curtos antigos (VITE_FB_*)
const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.VITE_FB_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.VITE_FB_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.VITE_FB_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: env.VITE_FIREBASE_APP_ID || env.VITE_FB_APP_ID,
};

export const configurado = Boolean(config.apiKey && config.projectId);

export const app = initializeApp(configurado ? config : { apiKey: 'x', projectId: 'x', appId: 'x' });
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
