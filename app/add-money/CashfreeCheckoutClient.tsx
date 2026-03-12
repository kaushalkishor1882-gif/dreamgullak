import { useState } from "react";

type User = { id: string; name?: string; email?: string; phone?: string };

export default function CashfreeCheckoutClient({
  user,
  orderId,
  amount
}: {
  user: User;
  orderId: string;
  amount: number;
}) {
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    setLoading(true);

    try {
      // Create Cashfree order through your backend
      const resp = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount,
          customer: user
        })
      });

      const data = await resp.json();
      console.log("CLIENT RECEIVED:", data);

      setLoading(false);

      const sessionId = data?.payment_session_id;

      if (!sessionId) {
        alert("Failed to create payment session");
        return;
      }

      // Redirect to Cashfree Hosted Checkout
const checkoutUrl =
  `https://payments.cashfree.com/pg/checkout/${sessionId}`;
window.location.href = checkoutUrl;

    } catch (err) {
      setLoading(false);
      console.error("CLIENT ERROR:", err);
      alert("Payment initiation failed");
    }
  };

  // ---------- BUTTON UI ----------
  return (
    <button
      onClick={startPayment}
      disabled={loading}
      className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition w-full"
    >
      {loading ? "Processing..." : "🟪 Pay with Cashfree"}
    </button>
  );
}

