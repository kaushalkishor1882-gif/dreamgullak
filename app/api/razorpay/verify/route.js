import crypto from "crypto";

let admin = null;
try {
  // Try importing firebaseAdmin only if credentials exist
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    admin = await import("../../lib/firebaseAdmin.js");
  } else {
    console.warn("⚠️ Firebase credentials missing — skipping Firebase initialization.");
  }
} catch (err) {
  console.warn("⚠️ Firebase import skipped:", err.message);
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

    // Skip Firebase update if admin is not initialized
    if (!admin) {
      console.log("⚠️ Firebase not initialized — skipping database update.");
      return new Response(JSON.stringify({ success: true, message: "Webhook received, Firebase skipped." }));
    }

    // Example Firebase update if credentials exist
    const db = admin.db;
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
