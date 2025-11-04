"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

interface Goal {
  id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  isDeleted?: boolean;
}

export default function DashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const router = useRouter();

  // ✅ 1. Protect route — redirect to login if user not logged in
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login"); // redirect to login if not logged in
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  // ✅ 2. Fetch user's goals
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "goals"),
      where("uid", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Goal),
      }));
      setGoals(goalsData);
    });

    return unsubscribe;
  }, []);

  const handleDelete = async (goalId: string) => {
    await updateDoc(doc(db, "goals", goalId), { isDeleted: true });
    alert("Goal moved to Deleted Goals ✅");
  };

  const isGoalComplete = (goal: Goal) =>
    goal.currentAmount >= goal.targetAmount;

  // ✅ 3. Navigate to celebration screen if goal just completed
  useEffect(() => {
    const completedGoal = goals.find(
      (goal) => isGoalComplete(goal) && !goal.isDeleted
    );
    if (completedGoal) {
      router.push("/celebrate");
    }
  }, [goals, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-800 to-purple-700 text-white p-6">
      <h1 className="text-4xl font-bold mb-4">📊 Your Dashboard</h1>
      <p className="mb-6 text-lg">Track all your DreamGullak goals</p>

      {goals.filter((g) => !g.isDeleted).length === 0 ? (
        <p className="text-gray-300">No active goals yet! Create one 🎯</p>
      ) : (
        <div className="space-y-4 w-full max-w-md">
          {goals
            .filter((g) => !g.isDeleted)
            .map((goal) => (
              <div
                key={goal.id}
                className="bg-white text-black rounded-xl p-4 shadow-lg flex justify-between items-center"
              >
                <div className="flex-1 pr-3">
                  <h2 className="text-xl font-bold">{goal.goalName}</h2>
                  <p>💰 Target: ₹{goal.targetAmount}</p>
                  <p>🏦 Saved: ₹{goal.currentAmount}</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-3 w-full">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{
                        width: `${(goal.currentAmount / goal.targetAmount) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* 🗑️ Delete Button */}
                <button
                  onClick={() => handleDelete(goal.id)}
                  disabled={!isGoalComplete(goal)}
                  className={`p-2 rounded-full transition ${
                    isGoalComplete(goal)
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-300 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Deleted Goals Section */}
      <div className="mt-10 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-3">🗂️ Deleted Goals</h2>
        {goals.filter((g) => g.isDeleted).length === 0 ? (
          <p className="text-gray-300">No deleted goals yet.</p>
        ) : (
          goals
            .filter((g) => g.isDeleted)
            .map((goal) => (
              <div
                key={goal.id}
                className="bg-gray-200 text-gray-800 p-3 rounded-md mb-2"
              >
                {goal.goalName} — Completed 🎉
              </div>
            ))
        )}
      </div>

      {/* Buttons */}
      <button
        onClick={() => router.push("/create-goal")}
        className="mt-8 bg-pink-500 px-6 py-3 rounded-full text-lg font-semibold hover:bg-pink-600"
      >
        ➕ Add Another Goal
      </button>

      <button
        onClick={() => router.push("/home")}
        className="mt-4 text-sm underline"
      >
        ← Back to Home
      </button>
    </div>
  );
}
