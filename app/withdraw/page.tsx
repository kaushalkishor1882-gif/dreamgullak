// /app/wallet/withdraw/page.tsx
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
  setDoc,
  addDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase"; // adjust path if your lib is elsewhere

type BankInfo = {
  name: string;
  account: string;
  ifsc: string;
};

export default function WithdrawPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // wallet balance (computed from goals)
  const [totalBalance, setTotalBalance] = useState<number>(0);

  // withdraw inputs
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  // mode: "bank" | "upi" | "gpay" | "phonepe" | "paytm"
  const [mode, setMode] = useState<string>("bank");

  // local form inputs (temporary until saved)
  const [bankInputs, setBankInputs] = useState<BankInfo>({ name: "", account: "", ifsc: "" });
  const [upiInput, setUpiInput] = useState<string>("");

  // saved settings loaded from Firestore
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [upiInfo, setUpiInfo] = useState<string | null>(null);

  // ---------- AUTH CHECK ----------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
      if (!u) router.replace("/login");
    });
    return () => unsub();
  }, [router]);

  // ---------- LOAD WALLET BALANCE (goals) ----------
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "goals"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const goals = snap.docs.map((d) => d.data() as any);
      const total = goals.reduce((s: number, g: any) => s + (g.currentAmount || 0), 0);
      setTotalBalance(total);
    });
    return () => unsub();
  }, [user]);

  // ---------- LOAD SAVED WITHDRAW SETTINGS ----------
  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, "users", user.uid, "withdrawSettings", "settings");
    // getDoc once (you can also set up onSnapshot if you want realtime updates)
    getDoc(settingsRef)
      .then((snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as any;
        if (data.bankInfo) setBankInfo(data.bankInfo as BankInfo);
        if (data.upi) setUpiInfo(data.upi as string);
      })
      .catch((err) => {
        console.error("Failed to load withdrawSettings:", err);
      });
  }, [user]);

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // ---------- SAVE BANK INFO ----------
  const saveBank = async () => {
    if (!user) return toast.error("Login required");
    if (!bankInputs.account || !bankInputs.ifsc || !bankInputs.name)
      return toast.error("Fill all bank fields");

    try {
      const settingsRef = doc(db, "users", user.uid, "withdrawSettings", "settings");
      await setDoc(settingsRef, { bankInfo: bankInputs }, { merge: true });
      setBankInfo(bankInputs);
      toast.success("Bank details saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save bank details");
    }
  };

  // ---------- SAVE UPI INFO ----------
  const saveUpi = async () => {
    if (!user) return toast.error("Login required");
    if (!upiInput) return toast.error("Enter a valid UPI ID");

    try {
      const settingsRef = doc(db, "users", user.uid, "withdrawSettings", "settings");
      await setDoc(settingsRef, { upi: upiInput }, { merge: true });
      setUpiInfo(upiInput);
      toast.success("UPI saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save UPI");
    }
  };

  // ---------- OPEN WALLET APP (mobile only) ----------
  // Requires a valid UPI ID (upiInfo). This attempts to open the app via URL scheme.
  // Note: On desktop this will likely do nothing — expected behavior.
  const openWalletApp = (wallet: "gpay" | "phonepe" | "paytm") => {
    if (!upiInfo) return toast.error("Please save a UPI ID first");
    // These schemes are common but can vary across OS and app versions.
    let url = "";
    const pa = encodeURIComponent(upiInfo);
    switch (wallet) {
      case "gpay":
        // gpay accepts generic UPI deep link
        url = `upi://pay?pa=${pa}`;
        break;
      case "phonepe":
        // phonepe supports a phonepe-specific scheme on some devices
        url = `phonepe://upi/pay?pa=${pa}`;
        break;
      case "paytm":
        // paytm UPI intent
        url = `paytmmp://pay?pa=${pa}`; // fallback variants exist; use paytmmp
        break;
    }

    // navigate to the URL (trigger user gesture); on mobile will open app if installed
    window.location.href = url;
  };

  // ---------- PERFORM WITHDRAWAL ----------
  // Adds a withdrawal doc and atomically deducts from goals (sequential reduce).
  const submitWithdraw = async () => {
    if (!user) return toast.error("Login required");
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (amount > totalBalance) return toast.error("Insufficient balance");

    try {
      // create withdrawal doc first (status = processing/pending)
      const wRef = await addDoc(collection(db, "withdrawals"), {
        uid: user.uid,
        amount,
        mode,
        paymentDetails: mode === "bank" ? bankInfo : mode === "upi" ? upiInfo : { wallet: mode },
        status: "processing",
        createdAt: serverTimestamp(),
      });

      // Atomically deduct from goals using runTransaction
      await runTransaction(db, async (tx) => {
        // fetch user's goals
        const goalsQ = query(collection(db, "goals"), where("uid", "==", user.uid));
        const goalsSnap = await (await import("firebase/firestore")).getDocs(goalsQ); // dynamic import to avoid top-level unused import type issues
        let remaining = amount;

        for (const gdoc of goalsSnap.docs) {
          if (remaining <= 0) break;
          const gRef = doc(db, "goals", gdoc.id);
          const gSnap = await tx.get(gRef);
          if (!gSnap.exists()) continue;
          const currentAmount = Number(gSnap.data().currentAmount || 0);
          if (currentAmount <= 0) continue;
          const deduct = Math.min(currentAmount, remaining);
          const newAmount = currentAmount - deduct;
          tx.update(gRef, { currentAmount: newAmount });
          remaining -= deduct;
        }

        // mark withdrawal completed (or keep processing depending on your flow)
        const wDocRef = doc(db, "withdrawals", wRef.id);
        tx.update(wDocRef, { status: "completed", completedAt: serverTimestamp() });
      });

      toast.success(`Withdrawn ₹${amount}`);
      setWithdrawAmount("");
    } catch (err) {
      console.error("Withdraw failed:", err);
      toast.error("Withdraw failed. Try again.");
    }
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      <Toaster />
      <div className="max-w-xl mx-auto bg-blue-800 p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-5">Withdraw</h1>

        {/* Withdrawable Amount */}
        <p className="text-lg font-semibold mb-3">
          Withdrawable Amount : <span className="font-bold">₹{totalBalance}</span>
        </p>

        {/* Amount input */}
        <label className="block text-sm mb-1">Withdrawal Amount</label>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="₹ Enter Amount"
          className="w-full p-3 rounded-lg text-black mt-1 mb-4"
        />

        <h2 className="font-semibold text-lg">Withdrawal Mode</h2>

        {/* Bank Transfer */}
        <div
          className={`p-4 mt-3 rounded-xl border cursor-pointer ${mode === "bank" ? "bg-blue-600" : "bg-blue-900"}`}
          onClick={() => setMode("bank")}
        >
          <div className="flex items-center justify-between">
            <div>
              <input type="radio" checked={mode === "bank"} readOnly />
              <span className="ml-2 text-lg font-semibold">Bank Transfer</span>
            </div>

            {bankInfo ? (
              <button
                className="bg-red-500 px-3 py-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setBankInfo(null);
                }}
              >
                Change account
              </button>
            ) : null}
          </div>

          {bankInfo ? (
            <div className="mt-3 text-sm">
              <p>Account: ****{bankInfo.account.slice(-4)}</p>
              <p>IFSC: {bankInfo.ifsc}</p>
            </div>
          ) : (
            mode === "bank" && (
              <div className="mt-3 space-y-2">
                <input
                  placeholder="Account Holder Name"
                  className="w-full p-2 text-black rounded"
                  value={bankInputs.name}
                  onChange={(e) => setBankInputs({ ...bankInputs, name: e.target.value })}
                />
                <input
                  placeholder="Account Number"
                  className="w-full p-2 text-black rounded"
                  value={bankInputs.account}
                  onChange={(e) => setBankInputs({ ...bankInputs, account: e.target.value })}
                />
                <input
                  placeholder="IFSC Code"
                  className="w-full p-2 text-black rounded"
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
          className={`p-4 mt-3 rounded-xl border cursor-pointer ${mode === "upi" ? "bg-blue-600" : "bg-blue-900"}`}
          onClick={() => setMode("upi")}
        >
          <div className="flex items-center justify-between">
            <div>
              <input type="radio" checked={mode === "upi"} readOnly />
              <span className="ml-2 text-lg font-semibold">UPI Withdraw</span>
            </div>

            {upiInfo ? (
              <button
                className="bg-red-500 px-3 py-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setUpiInfo(null);
                }}
              >
                Change UPI
              </button>
            ) : null}
          </div>

          {upiInfo ? (
            <div className="mt-3 text-sm">
              <p>{upiInfo}</p>
            </div>
          ) : (
            mode === "upi" && (
              <div className="mt-3 space-y-2">
                <input
                  placeholder="Enter UPI ID (e.g. name@bank)"
                  className="w-full p-2 text-black rounded"
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

        {/* Wallet Apps */}
        <h2 className="mt-5 font-semibold text-lg">Wallet Apps</h2>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <button
            disabled={!upiInfo}
            onClick={() => openWalletApp("gpay")}
            className={`py-3 rounded-lg font-bold ${upiInfo ? "bg-green-500" : "bg-gray-500/60 cursor-not-allowed"}`}
          >
            GPay
          </button>

          <button
            disabled={!upiInfo}
            onClick={() => openWalletApp("phonepe")}
            className={`py-3 rounded-lg font-bold ${upiInfo ? "bg-purple-500" : "bg-gray-500/60 cursor-not-allowed"}`}
          >
            PhonePe
          </button>

          <button
            disabled={!upiInfo}
            onClick={() => openWalletApp("paytm")}
            className={`py-3 rounded-lg font-bold ${upiInfo ? "bg-blue-400" : "bg-gray-500/60 cursor-not-allowed"}`}
          >
            Paytm
          </button>
        </div>

        {/* Actions */}
        <button onClick={() => router.push("/wallet/withdraw-history")} className="w-full bg-pink-600 py-3 mt-6 rounded-xl text-white font-bold">
          Withdraw History
        </button>

        <button onClick={submitWithdraw} className="w-full bg-yellow-400 py-3 mt-3 rounded-xl text-black font-bold">
          Withdraw Money
        </button>
      </div>
    </div>
  );
}
