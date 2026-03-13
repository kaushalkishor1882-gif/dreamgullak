"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default function WalletPage() {

  const [goals, setGoals] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // 🔐 Protect route
  useEffect(() => {

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {

      if (!user) {
        router.replace("/login");
        return;
      }

      setLoading(false);

      // 🔹 Listen to wallet balance
      const userRef = doc(db, "users", user.uid);

      const unsubWallet = onSnapshot(userRef, (docSnap) => {

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTotalBalance(data.walletBalance || 0);
        }

        const now = new Date();
        setLastUpdated(
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );

      });

      // 🔹 Load goals
      const q = query(
        collection(db, "goals"),
        where("uid", "==", user.uid)
      );

      const unsubGoals = onSnapshot(q, (snapshot) => {

        const goalsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setGoals(goalsData);

      });

      return () => {
        unsubWallet();
        unsubGoals();
      };

    });

    return () => unsubscribeAuth();

  }, [router]);

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

        {/* Wallet Card */}
        <div className="bg-purple-600 text-white rounded-xl p-4 mb-6 text-center shadow-inner">

          <h2 className="text-lg font-semibold">Total Balance</h2>

          <p className="text-3xl font-bold mt-1">
            ₹{totalBalance.toFixed(2)}
          </p>

          <p className="text-xs mt-2 opacity-80">
            Updated at {lastUpdated || "Loading..."}
          </p>

          <button
            onClick={() => router.push("/withdraw")}
            className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-full font-semibold shadow-md transition-all"
          >
            Withdraw
          </button>

        </div>

        <h3 className="text-lg font-semibold mb-3 text-purple-800">
          🎯 Your Goals
        </h3>

        {goals.length > 0 ? (

          <div className="space-y-4">

            {goals.map((goal) => {

              const progress =
                goal.targetAmount > 0
                  ? Math.min(
                      (goal.currentAmount / goal.targetAmount) * 100,
                      100
                    )
                  : 0;

              return (

                <div key={goal.id} className="border rounded-xl p-4">

                  <div className="flex justify-between">

                    <p className="font-semibold text-purple-700">
                      {goal.goalName}
                    </p>

                    <p className="text-sm font-bold text-purple-600">
                      {progress.toFixed(0)}%
                    </p>

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">

                    <div
                      className="h-2.5 rounded-full bg-purple-500"
                      style={{ width: `${progress}%` }}
                    />

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
