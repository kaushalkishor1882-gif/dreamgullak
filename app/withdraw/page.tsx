"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  setDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase";

type BankInfo = {
  name: string;
  account: string;
  ifsc: string;
};

export default function WithdrawPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [mode, setMode] = useState<string>("bank");

  const [bankInputs, setBankInputs] = useState<BankInfo>({ name: "", account: "", ifsc: "" });
  const [upiInput, setUpiInput] = useState<string>("");

  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [upiInfo, setUpiInfo] = useState<string | null>(null);

  // ✅ AUTH CHECK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
      if (!u) router.replace("/login");
    });
    return () => unsub();
  }, [router]);

  // ✅ LOAD WALLET BALANCE
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "goals"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const total = snap.docs.reduce(
        (sum, d) => sum + (d.data().currentAmount || 0),
        0
      );
      setTotalBalance(total);
    });
    return () => unsub();
  }, [user]);

  // ✅ LOAD SAVED BANK/UPI SETTINGS
  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, "users", user.uid, "withdrawSettings", "settings");

    getDoc(settingsRef)
      .then((snap) => {
        if (snap.exists()) {
          const data: any = snap.data();
          if (data.bankInfo) setBankInfo(data.bankInfo);
          if (data.upi) setUpiInfo(data.upi);
        }
      })
      .catch((err) => console.error("Settings load failed:", err));
  }, [user]);

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // ✅ SAVE BANK INFO
  const saveBank = async () => {
    if (!bankInputs.name || !bankInputs.account || !bankInputs.ifsc)
      return toast.error("Fill all bank fields");

    const settingsRef = doc(db, "users", user.uid, "withdrawSettings", "settings");
    await setDoc(settingsRef, { bankInfo: bankInputs }, { merge: true });

    setBankInfo(bankInputs);
    toast.success("Bank details saved");
  };

  // ✅ SAVE UPI INFO
  const saveUpi = async () => {
    if (!upiInput) return toast.error("Enter a valid UPI ID");

    const settingsRef = doc(db, "users", user.uid, "withdrawSettings", "settings");
    await setDoc(settingsRef, { upi: upiInput }, { merge: true });

    setUpiInfo(upiInput);
    toast.success("UPI saved");
  };

  // ✅ OPEN WALLET APPS
  const openWallet = (app: "gpay" | "phonepe" | "paytm") => {
    if (!upiInfo) return toast.error("Save a UPI ID first");
    const pa = encodeURIComponent(upiInfo);

    const links: any = {
      gpay: `upi://pay?pa=${pa}`,
      phonepe: `phonepe://upi/pay?pa=${pa}`,
      paytm: `paytmmp://pay?pa=${pa}`
    };

    window.location.href = links[app];
  };

  // ✅ SUBMIT WITHDRAW REQUEST
  const submitWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (amount <= 0) return toast.error("Enter valid amount");
    if (amount > totalBalance) return toast.error("Insufficient balance");

    if (mode === "bank" && !bankInfo) return toast.error("Add bank account first");
    if (mode === "upi" && !upiInfo) return toast.error("Add UPI ID first");

    try {
      // ✅ Send withdraw request to API
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,       // ✅ Added this line
          amount,
          userEmail: user.email,
          mode,
          upiId: upiInfo || null,
          bankInfo: bankInfo || null
        })
      });

      const data = await res.json();

      if (data.ok) {
        toast.success("Withdraw request submitted ✅");
        setWithdrawAmount("");
      } else {
        toast.error("Failed: " + data.error);
      }
    } catch (err: any) {
      toast.error("Network error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      <Toaster />

      <div className="max-w-xl mx-auto bg-blue-800 p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-5">Withdraw</h1>

        <p className="text-lg font-semibold mb-3">
          Withdrawable Amount: <b>₹{totalBalance}</b>
        </p>

        <label className="block mb-1 text-sm">Withdrawal Amount</label>
        <input
          type="number"
          className="w-full p-3 text-black rounded"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />

        {/* BANK */}
        <div
          className={`mt-4 p-4 rounded-xl border cursor-pointer ${mode === "bank" ? "bg-blue-600" : "bg-blue-900"}`}
          onClick={() => setMode("bank")}
        >
          <div className="flex justify-between">
            <span><input type="radio" checked={mode === "bank"} readOnly /> Bank Transfer</span>

            {bankInfo && (
              <button
                className="bg-red-500 px-3 py-1 rounded"
                onClick={(e) => { e.stopPropagation(); setBankInfo(null); }}
              >
                Change
              </button>
            )}
          </div>

          {bankInfo ? (
            <div className="mt-2 text-sm">
              <p>****{bankInfo.account.slice(-4)}</p>
              <p>{bankInfo.ifsc}</p>
            </div>
          ) : (
            mode === "bank" && (
              <div className="mt-3 space-y-2">
                <input
                  className="w-full p-2 text-black rounded"
                  placeholder="Account Holder Name"
                  value={bankInputs.name}
                  onChange={(e) => setBankInputs({ ...bankInputs, name: e.target.value })}
                />
                <input
                  className="w-full p-2 text-black rounded"
                  placeholder="Account Number"
                  value={bankInputs.account}
                  onChange={(e) => setBankInputs({ ...bankInputs, account: e.target.value })}
                />
                <input
                  className="w-full p-2 text-black rounded"
                  placeholder="IFSC Code"
                  value={bankInputs.ifsc}
                  onChange={(e) => setBankInputs({ ...bankInputs, ifsc: e.target.value })}
                />
                <button onClick={saveBank} className="bg-green-500 w-full py-2 rounded font-bold">
                  Save Bank
                </button>
              </div>
            )
          )}
        </div>

        {/* UPI */}
        <div
          className={`mt-4 p-4 rounded-xl border cursor-pointer ${mode === "upi" ? "bg-blue-600" : "bg-blue-900"}`}
          onClick={() => setMode("upi")}
        >
          <div className="flex justify-between">
            <span><input type="radio" checked={mode === "upi"} readOnly /> UPI Withdraw</span>

            {upiInfo && (
              <button
                className="bg-red-500 px-3 py-1 rounded"
                onClick={(e) => { e.stopPropagation(); setUpiInfo(null); }}
              >
                Change
              </button>
            )}
          </div>

          {upiInfo ? (
            <p className="mt-2 text-sm">{upiInfo}</p>
          ) : (
            mode === "upi" && (
              <div className="mt-3 space-y-2">
                <input
                  className="w-full p-2 text-black rounded"
                  placeholder="Enter UPI ID"
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                />
                <button onClick={saveUpi} className="bg-green-500 w-full py-2 rounded font-bold">
                  Save UPI
                </button>
              </div>
            )
          )}
        </div>

        <h2 className="mt-5 font-semibold text-lg">Wallet Apps</h2>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <button disabled={!upiInfo} onClick={() => openWallet("gpay")} className="bg-green-500 py-3 rounded-lg font-bold">GPay</button>
          <button disabled={!upiInfo} onClick={() => openWallet("phonepe")} className="bg-purple-500 py-3 rounded-lg font-bold">PhonePe</button>
          <button disabled={!upiInfo} onClick={() => openWallet("paytm")} className="bg-blue-400 py-3 rounded-lg font-bold">Paytm</button>
        </div>

        <button onClick={() => router.push("/wallet/withdraw-history")} className="w-full bg-pink-600 py-3 mt-6 rounded-xl font-bold">Withdraw History</button>

        <button onClick={submitWithdraw} className="w-full bg-yellow-400 py-3 mt-3 rounded-xl font-bold text-black">Withdraw Money</button>
      </div>
    </div>
  );
}
