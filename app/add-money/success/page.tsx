// /app/add-money/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type StatusResponse = {
  orderId?: string;
  status?: string;
  cf_payment_id?: string | null;
  payment_mode?: string | null;
  order_amount?: number | string | null;
  raw?: any;
  error?: string;
};

export default function SuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params?.get("order_id");

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<StatusResponse | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setRes({ error: "missing order_id in URL" });
      return;
    }

    const fetchStatus = async () => {
      try {
        setLoading(true);
        const r = await fetch(`/api/cashfree/status?order_id=${encodeURIComponent(orderId)}`);
        const json = await r.json();
        setRes(json);
      } catch (e) {
        setRes({ error: "network error" });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [orderId]);

  if (loading) return <div style={{padding:40}}>Checking payment status...</div>;

  if (!res) return <div style={{padding:40}}>No response</div>;
  if (res.error) return (
    <div style={{padding:40}}>
      <h2>Payment status unknown</h2>
      <p>{res.error}</p>
      <button onClick={() => router.push("/")}>Go to Home</button>
    </div>
  );

  const status = (res.status || "").toLowerCase();

  if (status.includes("success") || status === "paid" || status === "paid-success" || status === "PAID") {
    return (
      <div style={{padding:40, maxWidth:700, margin:"0 auto"}}>
        <div style={{padding:24, borderRadius:12, boxShadow:"0 6px 30px rgba(0,0,0,0.08)", background:"#fff"}}>
          <h2>Payment Successful ✅</h2>
          <p>Amount: ₹{res.order_amount || "—"}</p>
          <p>Order ID: {res.orderId}</p>
          <p>Payment ID: {res.cf_payment_id || "—"}</p>
          <button onClick={() => router.push("/")}>Go to Home</button>
        </div>
      </div>
    );
  }

  // fallback - show failed / pending info
  return (
    <div style={{padding:40, maxWidth:700, margin:"0 auto"}}>
      <div style={{padding:24, borderRadius:12, boxShadow:"0 6px 30px rgba(0,0,0,0.08)", background:"#fff"}}>
        <h2>{status.includes("pending") ? "Payment Pending" : "Payment Failed ❌"}</h2>
        <p>Order ID: {res.orderId}</p>
        <p>Payment ID: {res.cf_payment_id || "—"}</p>
        <p>Payment Mode: {res.payment_mode || "—"}</p>
        <p>Amount: ₹{res.order_amount || "—"}</p>
        <pre style={{whiteSpace:"pre-wrap", fontSize:12, marginTop:12}}>
          {JSON.stringify(res.raw || {}, null, 2)}
        </pre>
        <button onClick={() => router.push("/")}>Go to Home</button>
      </div>
    </div>
  );
}
