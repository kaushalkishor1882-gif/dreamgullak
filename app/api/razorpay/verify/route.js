import crypto from "crypto";
import admin from "firebase-admin";

let firebaseApp = null;

try {
  // Initialize Firebase Admin using JSON from environment variable
  if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("🔥 Firebase Admin initialized successfully");
  } else {
    console.warn("⚠️ No Firebase credentials found — skipping initialization.");
  }
} catch (err) {
  console.error("❌ Error initializing Firebase Admin:", err.message);
}

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("✅ Razorpay event received:", event.event);

    // Skip Firebase update if not initialized
    if (!firebaseApp) {
      console.log("⚠️ Firebase not initialized — skipping database update.");
      return new Response(JSON.stringify({ success: true, message: "Webhook received, Firebase skipped." }));
    }

    const db = admin.firestore();
    await db.collection("transactions").add({
      event: event.event,
      payload: event.payload,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("❌ Error in webhook verification:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
