export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import crypto from "crypto";
import admin from "@/lib/firebaseAdmin";

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

export async function POST(req) {
  try {

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expected) {
      console.log("Invalid signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);

    console.log("Webhook event:", event.event);

    // Handle all successful payment events
    if (
      event.event === "order.paid" ||
      event.event === "payment.captured" ||
      event.event === "payment.authorized"
    ) {

      const payment = event.payload.payment.entity;

      const paymentId = payment.id;
      const amount = payment.amount / 100;
      const userId = payment.notes?.userId || "unknown";

      console.log("Payment received:", paymentId, amount, userId);

      // Prevent duplicate transactions
      const existing = await db.collection("transactions").doc(paymentId).get();

      if (existing.exists) {
        console.log("Transaction already stored");
        return new Response("Already processed", { status: 200 });
      }

      // Store transaction
      await db.collection("transactions").doc(paymentId).set({
        paymentId,
        userId,
        amount,
        status: "success",
        method: payment.method || "razorpay",
        createdAt: new Date()
      });

      console.log("Transaction stored in Firebase");

      // 🔹 Update wallet balance
      if (userId !== "unknown") {

        await db.collection("users").doc(userId).set(
          {
            walletBalance: FieldValue.increment(amount),
            updatedAt: new Date()
          },
          { merge: true }
        );

        console.log("Wallet updated for user:", userId);
      }

    }

    return new Response("Webhook received", { status: 200 });

  } catch (err) {

    console.error("Webhook error:", err);
    return new Response("Server error", { status: 500 });

  }
}
