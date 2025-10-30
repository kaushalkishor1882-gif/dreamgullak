"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "goals"));
        const goalsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGoals(goalsList);
      } catch (error) {
        console.error("Error fetching goals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-gray-700">
        Loading your goals...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFBEA] flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-[#b45f06] mb-6">
        My Dream Goals 🎯
      </h1>

      {goals.length === 0 ? (
        <p className="text-gray-600 text-lg">No goals found yet.</p>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-md">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white border border-[#ffcc80] shadow-lg rounded-xl p-4"
            >
              <h2 className="text-xl font-bold text-[#b45f06] mb-2">
                {goal.title || "Untitled Goal"}
              </h2>
              <p className="text-gray-700">
                💰 <strong>Target Amount:</strong> ₹
                {goal.target_amount ? goal.target_amount : "Not set"}
              </p>
              <p className="text-gray-700">
                📅 <strong>Target Date:</strong>{" "}
                {goal.deadline ? goal.deadline : "Not set"}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
