import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  type Analytics,
  isSupported as isAnalyticsSupported,
  getAnalytics,
} from "firebase/analytics";

// Firebase Web config values are public by design; access control is enforced
// via Firestore Security Rules, not by secrecy here.
// Values can be overridden with VITE_FIREBASE_* env vars (see .env).
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ??
    "AIzaSyBYhwdMf_1AEKVUXkNBNk8RpzyUzgbv6Ac",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    "festpay-ea5f6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "festpay-ea5f6",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    "festpay-ea5f6.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "1064396525547",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ??
    "1:1064396525547:web:6f0ef5d19e8303285953ae",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-ETYNY0PS38",
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics only works in a browser that supports it; guard to avoid breaking
// SSR/build environments or unsupported browsers.
export let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) analytics = getAnalytics(app);
    })
    .catch(() => {
      analytics = undefined;
    });
}

export default app;
