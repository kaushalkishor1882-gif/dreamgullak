"use client";
import { useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreateGoalPage() {
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please login first!");
    try {
      await addDoc(collection(db, "goals"), {
        uid: auth.currentUser.uid,
        goalName,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount) || 0,
        createdAt: serverTimestamp(),
      });
      alert("🎯 Goal created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      alert("Error adding goal: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🎯 Create a Saving Goal</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-80">
        <input
          type="text"
          placeholder="Goal Name (e.g., New Phone)"
          className="p-2 rounded text-black"
          value={goalName}
          onChange={(e) => setGoalName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Target Amount"
          className="p-2 rounded text-black"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
        />
        <input
          type="number"
          placeholder="Current Savings"
          className="p-2 rounded text-black"
          value={currentAmount}
          onChange={(e) => setCurrentAmount(e.target.value)}
        />
        <button
          type="submit"
          className="bg-pink-500 p-2 rounded text-lg font-semibold hover:bg-pink-600"
        >
          Save Goal
        </button>
        <button
          type="button"
          onClick={() => router.push("/home")}
          className="text-sm underline mt-4"
        >
          ← Back to Home
        </button>
      </form>
    </div>
  );
}
