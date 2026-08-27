// ============================================================
// Firebase Web SDK Configuration — SmartTour / Tripzy
// Project: tripzy-56a4e
// ============================================================
// NOTE: Replace these values with your Firebase Web SDK config
// Found at: Firebase Console → Project Settings → Your Apps → Web
// The Admin SDK JSON file is server-side only and NOT used here.
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your actual web SDK config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "tripzy-56a4e.firebaseapp.com",
  projectId: "tripzy-56a4e",
  storageBucket: "tripzy-56a4e.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let app, auth, db, storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  // Firebase not yet configured — app runs in offline/mock mode
  console.warn('[SmartTour] Firebase not configured. Running in offline mode.');
}

export { app, auth, db, storage };
export const FIREBASE_READY = !!app;
