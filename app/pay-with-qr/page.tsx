"use client";
import { useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";

export default function PayWithQR() {
  const [amount, setAmount] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [goalName, setGoalName] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please login first!");

    try {
      await addDoc(collection(db, "payments"), {
        uid: auth.currentUser.uid,
        goalName,
        amount: Number(amount),
        upiRef,
        verified: false, // admin will mark true after checking
        createdAt: serverTimestamp(),
      });

      setStatus("✅ Payment submitted for verification!");
      setAmount("");
      setUpiRef("");
      setGoalName("");
    } catch (error: any) {
      setStatus("❌ Error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-700 to-blue-800 text-white">
      <h1 className="text-3xl font-bold mb-4">📸 Pay with UPI QR</h1>

      {/* 🧾 Show your static UPI QR image */}
      <div className="bg-white p-4 rounded-2xl mb-4">
        <Image src="/your-upi-qr.png" alt="UPI QR" width={220} height={220} />
      </div>

      <p className="text-sm text-gray-200 mb-4">
        Scan this QR and complete your payment. Then fill the details below.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-3 w-80">
        <input
          type="text"
          placeholder="Goal Name (e.g., New Phone)"
          className="p-2 rounded text-black"
          value={goalName}
          onChange={(e) => setGoalName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount Paid (₹)"
          className="p-2 rounded text-black"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="UPI Reference ID / Transaction ID"
          className="p-2 rounded text-black"
          value={upiRef}
          onChange={(e) => setUpiRef(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-pink-500 p-2 rounded font-semibold hover:bg-pink-600"
        >
          Submit Payment
        </button>
      </form>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
