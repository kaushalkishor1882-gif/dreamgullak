"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { toast, Toaster } from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function WalletPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔐 Protect route - only logged-in users can access
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login"); // redirect to login if not logged in
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // 🔄 Real-time listener for goals (only runs after login)
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, "goals"), where("uid", "==", auth.currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGoals(goalsData);

      // 💰 Calculate total wallet balance
      const total = goalsData.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
      setTotalBalance(total);

      // ⏱️ Update time
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

      // 🎉 Toast notification
      toast.success("Wallet Updated 💸", {
        duration: 2000,
        position: "top-center",
      });
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-purple-700 text-lg">
        Loading your wallet...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <Toaster />

      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-purple-700 mb-4 text-center">
          💼 My Wallet
        </h1>

        {/* 💰 Total Balance Card */}
        <div className="bg-purple-600 text-white rounded-xl p-4 mb-6 text-center shadow-inner">
          <h2 className="text-lg font-semibold">Total Balance</h2>
          <p className="text-3xl font-bold mt-1 transition-all duration-300">
            ₹{totalBalance.toFixed(2)}
          </p>
          <p className="text-xs mt-2 opacity-80 animate-pulse">
            ⏱️ Updated at {lastUpdated || "Loading..."}
          </p>
        </div>

        <h3 className="text-lg font-semibold mb-3 text-purple-800">
          🎯 Your Goals
        </h3>

        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress =
                goal.targetAmount > 0
                  ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                  : 0;

              return (
                <div
                  key={goal.id}
                  className="border rounded-xl p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-purple-700">
                      {goal.goalName}
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        progress >= 100 ? "text-green-600" : "text-purple-600"
                      }`}
                    >
                      {progress.toFixed(0)}%
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full ${
                        progress >= 100 ? "bg-green-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <p className="text-sm text-gray-600">
                    ₹{goal.currentAmount || 0} / ₹{goal.targetAmount}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-6">
            No goals created yet. Start saving today 💡
          </p>
        )}
      </div>
    </div>
  );
}

