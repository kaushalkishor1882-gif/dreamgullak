"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GoBackButton from "../components/GoBackButton";
import { db, auth } from "../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function AddMoneyPage() {
  const [amount, setAmount] = useState("");
  const [showMethods, setShowMethods] = useState(false);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState("");
  const router = useRouter();

  // Load Razorpay script safely
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, "goals"),
        where("uid", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      setGoals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchGoals();
  }, []);

  const handleContinue = () => {
    if (!amount || Number(amount) <= 0)
      return alert("Please enter a valid amount.");
    if (!selectedGoal) return alert("Please select a goal.");
    setShowMethods(true);
  };

  // ✅ NEW Razorpay Checkout (replaces razorpay.me)
  const handleRazorpayPage = async () => {

    const loaded = await loadRazorpayScript();

    if (!loaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    const res = await fetch("/api/razorpay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Number(amount) * 100,
        userId: user.uid
      })
    });

    const order = await res.json();

    const options: any = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Dream Gullak",
      description: "Add Money",
      order_id: order.id,

      handler: function () {
        window.location.href = "/wallet";
      },

      theme: {
        color: "#7c3aed"
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // ------------------- UI -------------------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">Add Money</h1>

        {!showMethods ? (
          <>
            <label className="block font-medium mb-2 text-gray-700">
              Select Goal
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
            >
              <option value="">-- Choose a Goal --</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.goalName} (₹{goal.currentAmount || 0} / ₹
                  {goal.targetAmount})
                </option>
              ))}
            </select>

            <p className="text-gray-600 mb-4">💰 Enter the amount</p>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
            />

            <button
              onClick={handleContinue}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full py-2 rounded-lg"
            >
              Continue →
            </button>

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
                onClick={handleRazorpayPage}
                className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg"
              >
                🟧 Pay with Razorpay
              </button>

              <button
                onClick={() => setShowMethods(false)}
                className="text-sm text-gray-600 hover:text-purple-600 mt-3"
              >
                ← Go Back
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
