import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("BODY:", body);

    // AUTO SELECT SANDBOX / LIVE
    const isDev = process.env.NODE_ENV !== "production";

    const CASHFREE_BASE = isDev
      ? process.env.CASHFREE_SANDBOX_API_BASE
      : process.env.CASHFREE_LIVE_API_BASE;

    const CASHFREE_CLIENT_ID = isDev
      ? process.env.CASHFREE_SANDBOX_CLIENT_ID
      : process.env.CASHFREE_LIVE_CLIENT_ID;

    const CASHFREE_SECRET = isDev
      ? process.env.CASHFREE_SANDBOX_CLIENT_SECRET
      : process.env.CASHFREE_LIVE_CLIENT_SECRET;

    const APP_URL = isDev
      ? "http://localhost:3000"
      : process.env.APP_BASE_URL;

    // DEBUG INFORMATION
    console.log("ENV CHECK:", {
      mode: isDev ? "SANDBOX (local)" : "LIVE (production)",
      CF_BASE: CASHFREE_BASE,
      APP_URL: APP_URL,
      CF_ID: CASHFREE_CLIENT_ID ? "OK" : "MISSING",
      CF_SECRET: CASHFREE_SECRET ? "OK" : "MISSING",
    });

    const returnUrl = `${APP_URL}/add-money/success`;
    const notifyUrl = `${APP_URL}/api/cashfree/webhook`;

    // CREATE ORDER REQUEST
    const resp = await fetch(`${CASHFREE_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": process.env.CASHFREE_API_VERSION!,
        "x-client-id": CASHFREE_CLIENT_ID!,
        "x-client-secret": CASHFREE_SECRET!,
      },
      body: JSON.stringify({
        order_id: body.orderId,
        order_amount: Number(body.amount),
        order_currency: "INR",

        order_meta: {
          return_url: returnUrl,
          notify_url: notifyUrl,
          payment_methods: "cc,dc,upi,nb",
        },

        customer_details: {
          customer_id: body.customer.id,
          customer_name: body.customer.name,
          customer_email: body.customer.email,
          customer_phone:
            body.customer.phone?.length >= 10
              ? body.customer.phone
              : "9999999999",
        },

        order_tags: {
          platform: "dreamgullak",
          environment: isDev ? "sandbox" : "live",
        },
      }),
    });

    const data = await resp.json();
    console.log("CASHFREE RESPONSE:", data);

    if (!resp.ok) {
      return NextResponse.json({ error: data }, { status: resp.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
