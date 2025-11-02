import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    console.log("Creating Razorpay order for:", amount);

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create order on Razorpay
    const order = await razorpay.orders.create({
      amount: amount, // amount in paise
      currency: "INR",
      receipt: "rcpt_" + Math.floor(Math.random() * 1000000),
      payment_capture: 1,
    });

    console.log("✅ Razorpay order created:", order.id);
    return NextResponse.json(order);
  } catch (err: any) {
    console.error("❌ Razorpay order creation failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
