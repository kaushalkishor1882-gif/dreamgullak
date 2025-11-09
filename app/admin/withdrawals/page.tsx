"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function AdminWithdrawalsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) router.replace("/login");
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "withdrawals"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setWithdrawals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

const approveWithdrawal = async (withdrawalId: string) => {
  if (!confirm("Approve and mark as paid?")) return;

  try {
    const res = await fetch("/api/admin/withdraw/callApprove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId }),
    });

    const data = await res.json();
    if (data.ok) alert("Withdrawal approved successfully ✅");
    else alert(`Error approving withdrawal: ${data.error}`);
  } catch (err) {
    console.error(err);
    alert("Unexpected error while approving withdrawal.");
  }
};

  const rejectWithdrawal = async (withdrawalId: string) => {
    const reason = prompt("Reason for rejection (optional):") || "";
    if (!confirm("Reject this withdrawal?")) return;

    try {
      await fetch("/api/admin/withdraw/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: withdrawalId, reason }),
      });
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Unexpected error while rejecting withdrawal.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Admin — Withdrawals</h1>

        {withdrawals.length === 0 ? (
          <p className="text-gray-500">No withdrawals found.</p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="p-3 rounded border flex justify-between items-start">
                <div className="max-w-xl">
                  <div className="flex items-baseline gap-4">
                    <div className="text-lg font-semibold">₹{w.amount}</div>
                    <div className="text-sm text-gray-600">[{w.mode}]</div>
                    <div className="text-xs text-gray-500">UID: {w.uid}</div>
                  </div>

                  <div className="text-sm mt-2 text-gray-700">
                    {w.paymentDetails?.account ? (
                      <div>Bank: ****{w.paymentDetails.account.slice(-4)} • IFSC: {w.paymentDetails.ifsc}</div>
                    ) : typeof w.paymentDetails === "string" ? (
                      <div>UPI: {w.paymentDetails}</div>
                    ) : w.walletApp ? (
                      <div>Wallet App: {w.walletApp}</div>
                    ) : null}
                  </div>

                  {w.note && <div className="mt-2 text-sm text-gray-600">Note: {w.note}</div>}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className={`text-sm ${w.status === "completed" ? "text-green-600" : w.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                    {w.status?.toUpperCase() || "PENDING"}
                  </div>

                  <div className="flex gap-2">
                    {w.status !== "completed" && (
                  <button onClick={() => approveWithdrawal(w.id)} className="bg-green-600 text-white px-3 py-1 rounded">
                    Approve
                  </button>
                    )}

                    {w.status !== "rejected" && (
                      <button onClick={() => rejectWithdrawal(w.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                        Reject
                      </button>
                    )}

                    <button onClick={() => navigator.clipboard.writeText(JSON.stringify(w, null, 2))} className="bg-gray-200 text-black px-3 py-1 rounded">
                      Copy JSON
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
