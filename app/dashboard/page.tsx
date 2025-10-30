"use client";
import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface Goal {
  id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
}

export default function DashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "goals"), where("uid", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Goal),
      }));
      setGoals(goalsData);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-800 to-purple-700 text-white p-6">
      <h1 className="text-4xl font-bold mb-4">📊 Your Dashboard</h1>
      <p className="mb-6 text-lg">Track all your DreamGullak goals</p>

      {goals.length === 0 ? (
        <p className="text-gray-300">No goals yet! Create one 🎯</p>
      ) : (
        <div className="space-y-4 w-full max-w-md">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white text-black rounded-xl p-4 shadow-lg">
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
          ))}
        </div>
      )}

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

