import admin from "firebase-admin";

let adminApp;

try {
  // Try to initialize Firebase if credentials are available
  if (!admin.apps.length) {
    const serviceAccount =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
        : process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : null;

    if (serviceAccount) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      console.warn("⚠️ No Firebase credentials found — skipping initialization.");
    }
  } else {
    adminApp = admin.app();
  }
} catch (err) {
  console.warn("⚠️ Firebase initialization skipped due to error:", err.message);
}

export const adminDb = adminApp ? adminApp.firestore() : null;
