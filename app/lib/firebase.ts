// /app/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDquyt-nNLi58OyksaxoLIqjyQFlVlZ6Y8",
  authDomain: "dreamgullak-594ee.firebaseapp.com",
  projectId: "dreamgullak-594ee",
  storageBucket: "dreamgullak-594ee.firebasestorage.app",
  messagingSenderId: "881701645541",
  appId: "1:881701645541:web:a67a2c680b00cfe155380c",
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
