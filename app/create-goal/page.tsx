"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function CreateGoalPage() {
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const router = useRouter();

  // ✅ Auth Protection (redirect if not logged in)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login"); // Redirect to login if user not found
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please login first!");

    try {
      await addDoc(collection(db, "goals"), {
        uid: auth.currentUser.uid,
        goalName,
        targetAmount: Number(targetAmount),
        currentAmount: 0,
        targetDate,
        createdAt: serverTimestamp(),
      });

      alert("🎯 Goal created successfully!");
      router.push("/wallet");
    } catch (error: any) {
      alert("Error adding goal: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🎯 Create a Saving Goal</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 w-80 bg-white text-black p-6 rounded-2xl shadow-lg"
      >
        {/* Goal Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Goal Name</label>
          <input
            type="text"
            placeholder="e.g., New Phone"
            className="w-full p-2 rounded border focus:ring-2 focus:ring-purple-600 outline-none"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            required
          />
        </div>

        {/* Target Amount */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Target Amount (₹)</label>
          <input
            type="number"
            placeholder="e.g., 5000"
            className="w-full p-2 rounded border focus:ring-2 focus:ring-purple-600 outline-none"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </div>

        {/* Target Completion Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            🗓️ Target Completion Date
          </label>
          <input
            type="date"
            className="w-full p-2 rounded border focus:ring-2 focus:ring-purple-600 outline-none cursor-pointer"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
          />
        </div>

        {/* Save Goal Button */}
        <button
          type="submit"
          className="bg-purple-600 text-white p-2 rounded text-lg font-semibold hover:bg-purple-700 transition"
        >
          Save Goal
        </button>

        {/* Back to Home */}
        <button
          type="button"
          onClick={() => router.push("/home")}
          className="text-sm underline text-gray-600 mt-2 hover:text-purple-700"
        >
          ← Back to Home
        </button>
      </form>
    </div>
  );
}
