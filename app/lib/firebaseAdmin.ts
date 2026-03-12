import admin from "firebase-admin";
import serviceAccount from "./serviceAccount.json";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    console.log("🔥 Firebase Admin initialized (LOCAL)");
  } catch (err) {
    console.error("❌ Firebase Admin init error:", err);
  }
}

export const adminDb = admin.firestore();
