import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { withdrawalId } = await req.json();
    if (!withdrawalId) return NextResponse.json({ ok: false, error: "Missing withdrawalId" }, { status: 400 });

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/withdraw/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": process.env.ADMIN_SECRET_TOKEN,
      },
      body: JSON.stringify({ withdrawalId }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error("Server-side admin call error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
