"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoBackButton from "../components/GoBackButton"; // ✅ Import GoBackButton

export default function AddMoneyPage() {
  const [amount, setAmount] = useState("");
  const [showMethods, setShowMethods] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Step 1 → Show payment methods after entering amount
  const handleContinue = () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setShowMethods(true);
  };

  // Step 2 → Process payment based on selected method
  const handlePayment = async (method: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) * 100 }),
      });

      const data = await res.json();
      if (!data?.id) {
        alert("Failed to create payment order.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Dream Gullak",
        description: "Add money to your wallet",
        order_id: data.id,
        theme: { color: "#7C3AED" },
        handler: function (response: any) {
          alert("Payment successful 🎉 " + response.razorpay_payment_id);
          router.push("/home"); // ✅ Redirect after success
        },
        modal: {
          ondismiss: function () {
            console.log("Payment cancelled");
          },
        },
        method: {
          upi: method === "gpay" || method === "paytm",
          netbanking: method === "netbanking",
          wallet: false,
          card: false,
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong during payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">Add Money</h1>

        {!showMethods ? (
          <>
            <p className="text-gray-600 mb-4">💰 Current Balance: ₹0.00</p>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-black-500"
            />
            <button
              onClick={handleContinue}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full py-2 rounded-lg transition"
            >
              Continue →
            </button>

            {/* ✅ Go Back Button (always visible, goes to /home ) */}
            <div className="flex justify-center mt-4">
              <GoBackButton />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Choose Payment Method
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handlePayment("paytm")}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
              >
                🟦 Pay with Paytm
              </button>
              <button
                onClick={() => handlePayment("gpay")}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
              >
                🟩 Pay with GPay
              </button>
              <button
                onClick={() => handlePayment("netbanking")}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg transition"
              >
                🟪 Pay with Net Banking
              </button>
            </div>
            <div className="flex justify-center mt-4">
             <button
               onClick={() => setShowMethods(false)}
               className="text-sm text-gray-600 hover:text-purple-600 transition"
             >
               Go Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
