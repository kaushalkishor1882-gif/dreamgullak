import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "receipt_order_" + Math.random().toString(36).substring(2, 8),
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Order created:", order);

    return NextResponse.json(order);
  } catch (err: any) {
    console.error("Error creating Razorpay order:", err);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
