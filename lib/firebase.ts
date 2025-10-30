// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase Config (from Firebase Console → Project Settings → Web App)
const firebaseConfig = {
  apiKey: "AIzaSyDquyt-nNLi58OyksaxoLIqjyQFlVlZ6Y8",
  authDomain: "dreamgullak-594ee.firebaseapp.com",
  projectId: "dreamgullak-594ee",
  storageBucket: "dreamgullak-594ee.firebasestorage.app",
  messagingSenderId: "881701645541",
  appId: "1:881701645541:web:a67a2c680b00cfe155380c",
  measurementId: "G-JSQCTL9DT8"
};

// ✅ Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Export Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
