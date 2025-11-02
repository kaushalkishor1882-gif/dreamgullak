// app/api/razorpay/verify/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

function initFirebaseAdmin() {
  if (!admin.apps.length) {
    const servicePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (servicePath) {
      const sa = JSON.parse(fs.readFileSync(servicePath, "utf8"));
      admin.initializeApp({ credential: admin.credential.cert(sa) });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({ credential: admin.credential.cert(sa) });
    } else {
      throw new Error("No Firebase service account provided (FIREBASE_SERVICE_ACCOUNT_PATH or JSON)");
    }
  }
}
initFirebaseAdmin();
const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, userId } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !amount) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(body).digest("hex");

    if (expected !== razorpay_signature) {
      console.warn("Invalid signature", { expected, got: razorpay_signature });
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    const rupees = Number(amount) / 100;

    const userRef = db.collection("users").doc(String(userId));
    const txRef = db.collection("transactions").doc();

    await db.runTransaction(async (t) => {
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) throw new Error("User not found");
      const prev = userDoc.data()?.balance || 0;
      t.update(userRef, { balance: Number(prev) + rupees });
      t.set(txRef, {
        userId: String(userId),
        type: "add_money",
        amount: rupees,
        amountPaise: Number(amount),
        razorpay_order_id,
        razorpay_payment_id,
        status: "success",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true, credited: rupees });
  } catch (err: any) {
    console.error("verify error:", err);
    return NextResponse.json({ error: err.message || "verify failed" }, { status: 500 });
  }
}
