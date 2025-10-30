"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

export default function AddMoneyPage() {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("demoUser123");

  useEffect(() => {
    const fetchBalance = async () => {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) setBalance(userSnap.data().balance || 0);
    };
    fetchBalance();
  }, []);

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount!");

    setLoading(true);
    try {
      // 1️⃣ Create payment order on backend
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      const { order } = data;

      // 2️⃣ Load Razorpay SDK dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "DreamGullak",
          description: "Add Money to Wallet",
          order_id: order.id,
          handler: async function (response: any) {
            // Update Firestore balance after successful payment
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { balance: increment(Number(amount)) });
            setBalance((prev) => prev + Number(amount));
            alert("💸 Payment successful!");
          },
          prefill: { name: "DreamGullak User", email: "user@example.com" },
          theme: { color: "#f59e0b" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error(error);
      alert("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-6">
      <div className="bg-white shadow-xl p-8 rounded-3xl text-center w-96">
        <h1 className="text-3xl font-bold mb-4 text-purple-700">💰 My Wallet</h1>
        <p className="text-lg mb-6">Current Balance: <strong>₹{balance}</strong></p>

        <input
          type="number"
          placeholder="Enter amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-3 border rounded-lg mb-4 w-full text-center"
        />

        <button
          onClick={handlePayment}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-600 w-full"
        >
          {loading ? "Processing..." : "Pay via Paytm / GPay / NetBanking"}
        </button>
      </div>
    </main>
  );
}
