"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GoBackButton from "../components/GoBackButton";
import { db, auth } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { addMoneyToGoal } from "../lib/updateGoal"; 
import { onAuthStateChanged } from "firebase/auth"; // ✅ Added for auth protection

export default function AddMoneyPage() {
  const [amount, setAmount] = useState("");
  const [showMethods, setShowMethods] = useState(false);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState("");
  const router = useRouter();

  // ✅ Authentication check: redirect if not logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ✅ Fetch all user goals from Firestore
  useEffect(() => {
    const fetchGoals = async () => {
      if (!auth.currentUser) return;
      const q = query(collection(db, "goals"), where("uid", "==", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      setGoals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchGoals();
  }, []);

  // ✅ Load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleContinue = () => {
    if (!amount || Number(amount) <= 0) return alert("Please enter a valid amount.");
    if (!selectedGoal) return alert("Please select a goal to fund.");
    setShowMethods(true);
  };

  // ✅ Handle Razorpay payment
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

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Check your internet connection.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Dream Gullak",
        description: "Add money to your goal",
        order_id: data.id,
        theme: { color: "#7C3AED" },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: data.amount,
                userId: auth.currentUser?.uid || "guest",
              }),
            });

            const j = await verifyRes.json();

            if (j?.success) {
              // ✅ Update Firestore Goal Balance
              await addMoneyToGoal(selectedGoal, Number(amount));
              alert(`🎉 ₹${amount} added to your goal successfully!`);
              router.push("/home");
            } else {
              alert("Payment done but verification failed. Contact support.");
            }
          } catch (err) {
            console.error("verify call failed", err);
            alert("Server verification failed. Try again later.");
          }
        },
        modal: { ondismiss: () => console.log("Payment cancelled") },
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
            {/* ✅ Show goal selector */}
            <label className="block font-medium mb-2 text-gray-700">Select Goal</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
            >
              <option value="">-- Choose a Goal --</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.goalName} (₹{goal.currentAmount || 0} / ₹{goal.targetAmount})
                </option>
              ))}
            </select>

            <p className="text-gray-600 mb-4">💰 Enter the amount you want to add</p>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <button
              onClick={handleContinue}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full py-2 rounded-lg transition"
            >
              Continue →
            </button>

            <div className="flex justify-center mt-4">
              <GoBackButton />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Choose Payment Method</h2>
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
