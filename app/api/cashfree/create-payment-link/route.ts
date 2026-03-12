import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { amount, userId, goalId, customer } = body;

    // FIXED SHORT LINK_ID
    const linkId =
      "dg_" +
      Date.now().toString().slice(-8) +
      "_" +
      Math.random().toString(36).substring(2, 8);

    const resp = await fetch("https://api.cashfree.com/pg/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": process.env.CASHFREE_LIVE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_LIVE_CLIENT_SECRET!,
      },
      body: JSON.stringify({
        customer_details: {
          customer_id: userId,
          customer_phone: customer.phone || "9999999999",
          customer_email: customer.email || "test@example.com",
        },

        link_amount: Number(amount),
        link_currency: "INR",
        link_id: linkId,
        link_purpose: "Add Money to Goal",

        link_expiry_time: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),

        link_notes: {
          goal_id: goalId,
          user_id: userId,
        },

        link_notify: {
          send_sms: false,
          send_email: false,
        },
      }),
    });

    const data = await resp.json();
    console.log("PAYMENT LINK RESPONSE:", data);

    if (!resp.ok) {
      return NextResponse.json(data, { status: 400 });
    }

    return NextResponse.json({ link_url: data.link_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }
}
