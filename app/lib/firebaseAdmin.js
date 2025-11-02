import admin from "firebase-admin";

let app;

// Load Firebase Admin SDK only if not initialized
if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccountKey) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
      });
      console.log("✅ Firebase initialized using environment variable");
    } else {
      console.warn("⚠️ No Firebase service account key found. Firebase disabled.");
    }
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin:", error);
  }
}

export const db = app ? admin.firestore() : null;
export const auth = app ? admin.auth() : null;
