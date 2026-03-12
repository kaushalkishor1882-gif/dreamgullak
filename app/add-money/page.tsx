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
  doc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function AddMoneyPage() {
  const [amount, setAmount] = useState("");
  const [showMethods, setShowMethods] = useState(false);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState("");
  const router = useRouter();

  // ⭐ Format user data (left untouched)
  const getUserForCashfree = () => {
    const u = auth.currentUser;

    if (!u) {
      return {
        id: "guest",
        name: "Guest User",
        email: "guest@example.com",
        phone: "9999999999",
      };
    }

    const phone =
      u.phoneNumber && u.phoneNumber.replace("+91", "").length >= 10
        ? u.phoneNumber.replace("+91", "")
        : "9999999999";

    return {
      id: u.uid,
      name: u.displayName || "User",
      email: u.email || "user@example.com",
      phone,
    };
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

  // ⭐ Razorpay page redirect (UNCHANGED)
  const handleRazorpayPage = () => {
    window.open("https://razorpay.me/@kaushalkishor1976", "_blank");
  };

  // ⭐ Manual QR option (UNCHANGED)
  const handleConfirmPayment = async () => {
    if (!amount || Number(amount) <= 0)
      return alert("Enter a valid amount.");
    if (!selectedGoal) return alert("Please select a goal.");

    setLoading(true);
    try {
      await updateDoc(doc(db, "goals", selectedGoal), {
        currentAmount: increment(Number(amount)),
      });

      await addDoc(collection(db, "transactions"), {
        uid: auth.currentUser?.uid,
        goalId: selectedGoal,
        goalName:
          goals.find((g) => g.id === selectedGoal)?.goalName || "Goal",
        type: "QR Payment",
        amount: Number(amount),
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      alert(`₹${amount} added successfully!`);
      setAmount("");
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
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

              {/* ONLY RAZORPAY LEFT - CASHFREE REMOVED */}
              <button
                onClick={handleRazorpayPage}
                className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg"
              >
                🟧 Pay with Razorpay
              </button>

              {/* Manual QR Payment (UNCHANGED) */}
              <div className="mt-4 flex flex-col items-center">
                <img
                  src="/myqr.jpg"
                  alt="UPI QR Code"
                  className="w-60 h-60 mb-3 border-4 border-purple-200 rounded-xl shadow-md"
                />
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg w-full"
                >
                  {loading ? "Updating..." : "✅ Confirm Manual Payment"}
                </button>
              </div>

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


