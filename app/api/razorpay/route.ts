import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const { amount, userId } = await req.json();

    if (!amount || !userId) {
      return NextResponse.json(
        { error: "Missing amount or userId" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    });

    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",

      receipt: "rcpt_" + Math.floor(Math.random() * 1000000),

      notes: {
        userId: userId
      }
    });

    console.log("Razorpay order created:", order.id);

    return NextResponse.json(order);

  } catch (err: any) {

    console.error("Razorpay order error:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );

  }
}
