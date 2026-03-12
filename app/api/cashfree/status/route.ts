// /app/api/cashfree/status/route.ts
import { NextResponse } from "next/server";

const LIVE_BASE = "https://api.cashfree.com/pg";
const SANDBOX_BASE = "https://sandbox.cashfree.com/pg";

function getBaseUrl() {
  return process.env.CASHFREE_ENV === "SANDBOX" ? SANDBOX_BASE : LIVE_BASE;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ error: "missing order_id" }, { status: 400 });
    }

    const base = getBaseUrl();
    const endpoint = `${base}/orders/${encodeURIComponent(orderId)}/payments`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "x-client-id": process.env.CASHFREE_ID || "",
        "x-client-secret": process.env.CASHFREE_SECRET || "",
        "x-api-version": process.env.CASHFREE_API_VERSION || "2025-01-01",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Cashfree status API error:", res.status, text);
      return NextResponse.json({ error: "cashfree error", details: text }, { status: 502 });
    }

    const body = await res.json();
    // Cashfree returns an array of payments for the order — pick most recent or the first
    const paymentInfo = Array.isArray(body) && body.length ? body[0] : body;

    // Normalize the response so frontend can read simple fields
    const normalized = {
      orderId,
      status: paymentInfo?.tx_status || paymentInfo?.status || paymentInfo?.transaction_status || "UNKNOWN",
      cf_payment_id: paymentInfo?.cf_payment_id || paymentInfo?.transaction_id || null,
      payment_mode: paymentInfo?.payment_method || paymentInfo?.payment_mode || null,
      order_amount: paymentInfo?.order_amount || null,
      raw: paymentInfo,
    };

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("Status route error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
