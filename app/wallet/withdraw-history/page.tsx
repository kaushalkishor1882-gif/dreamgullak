"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentData
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function WithdrawHistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [withdrawals, setWithdrawals] = useState<DocumentData[]>([]);
  const router = useRouter();

  // ✅ AUTH CHECK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
      if (!u) router.replace("/login");
    });
    return () => unsub();
  }, [router]);

  // ✅ FETCH USER WITHDRAW HISTORY (by userEmail)
  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, "withdrawals"),
      where("userEmail", "==", user.email),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setWithdrawals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  if (loadingAuth)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  const statusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 font-bold";
      case "rejected":
        return "text-red-600 font-bold";
      default:
        return "text-yellow-600 font-bold"; // pending/processing
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-4">Withdraw History</h1>

        {withdrawals.length === 0 ? (
          <p className="text-gray-500">No withdrawals yet.</p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="p-3 rounded border">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold text-lg">₹{w.amount}</div>
                    <div className="text-sm text-gray-600">
                      Mode: {w.mode?.toUpperCase()}
                    </div>

                    {/* Show payment details */}
                    {w.mode === "bank" && w.bankInfo?.account && (
                      <div className="text-xs text-gray-500">
                        A/C: ****{w.bankInfo.account.slice(-4)} | {w.bankInfo.ifsc}
                      </div>
                    )}

                    {w.mode === "upi" && w.upiId && (
                      <div className="text-xs text-gray-500">UPI: {w.upiId}</div>
                    )}

                    {/* Show reject reason if rejected */}
                    {w.status === "rejected" && w.rejectReason && (
                      <div className="text-xs text-red-600 mt-1">
                        Reason: {w.rejectReason}
                      </div>
                    )}
                  </div>

                  <div className="text-right text-sm">
                    <div className={statusColor(w.status)}>{w.status.toUpperCase()}</div>
                    <div className="text-gray-500">
                      {w.createdAt?.toDate
                        ? w.createdAt.toDate().toLocaleString()
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push("/wallet")}
          className="w-full bg-blue-600 text-white py-3 mt-6 rounded-xl font-bold"
        >
          Back to Wallet
        </button>
      </div>
    </div>
  );
}
