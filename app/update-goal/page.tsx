"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function UpdateGoalPage() {
  const router = useRouter();
  const [goalId, setGoalId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [message, setMessage] = useState("");

  // ✅ Authentication protection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login"); // Redirect if user not logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ✅ Add amount to goal
  const handleAddSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const goalRef = doc(db, "goals", goalId);
      const goalSnap = await getDoc(goalRef);

      if (goalSnap.exists()) {
        const goalData = goalSnap.data();
        const newAmount = goalData.saved_amount + amount;

        await updateDoc(goalRef, {
          saved_amount: newAmount,
          is_completed: newAmount >= goalData.target_amount,
        });

        setMessage("✅ Amount added successfully!");
      } else {
        setMessage("❌ Goal not found.");
      }
    } catch (error) {
      console.error("Error adding amount:", error);
      setMessage("⚠️ Something went wrong.");
    }
  };

  // ✅ UI
  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-center mb-4">Add Money to Gullak 💰</h2>

      <form onSubmit={handleAddSavings} className="space-y-3">
        <input
          type="text"
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          placeholder="Enter Goal ID"
          className="border rounded p-2 w-full"
          required
        />

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Amount to Add"
          className="border rounded p-2 w-full"
          required
        />

        <button
          type="submit"
          className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
        >
          Add Savings
        </button>
      </form>

      {message && <p className="text-center mt-4 text-sm">{message}</p>}
    </div>
  );
}
