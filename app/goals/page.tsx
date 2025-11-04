"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login"); // Redirect if not logged in
      } else {
        setAuthChecked(true); // Continue only if logged in
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!authChecked) return; // Wait until auth check is done

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
  }, [authChecked]);

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
