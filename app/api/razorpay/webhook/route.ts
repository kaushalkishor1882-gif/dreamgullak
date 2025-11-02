// app/api/razorpay/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import admin from "firebase-admin";
import fs from "fs";

function init() {
  if (!admin.apps.length) {
    const servicePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (servicePath) {
      const sa = JSON.parse(fs.readFileSync(servicePath, "utf8"));
      admin.initializeApp({ credential: admin.credential.cert(sa) });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({ credential: admin.credential.cert(sa) });
    } else {
      throw new Error("No Firebase service account provided");
    }
  }
}
init();
const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const expected = crypto.createHmac("sha256", secret).update(bodyText).digest("hex");
    if (secret && expected !== signature) {
      console.warn("Webhook signature mismatch");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;

    if (event === "payment.captured") {
      const payment = payload.payload?.payment?.entity || {};
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amountPaise = payment.amount;
      const notes = payment.notes || {};
      const userId = notes.userId || notes.user_id || payment.email || null;

      if (userId) {
        const rupees = Number(amountPaise) / 100;
        const userRef = db.collection("users").doc(String(userId));
        const txRef = db.collection("transactions").doc();

        await db.runTransaction(async (t) => {
          const userDoc = await t.get(userRef);
          if (!userDoc.exists) {
            // optionally record pending tx
            return;
          }
          const prev = userDoc.data()?.balance || 0;
          t.update(userRef, { balance: Number(prev) + rupees });
          t.set(txRef, {
            userId: String(userId),
            type: "webhook_capture",
            amount: rupees,
            amountPaise,
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            status: "captured",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("webhook error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
