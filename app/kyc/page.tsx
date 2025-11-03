"use client";
import { useState } from "react";

export default function KYC() {
  const [bank, setBank] = useState({
    bankName: "",
    holderName: "",
    accountNumber: "",
    ifsc: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBank({ ...bank, [name]: value });
  };

  const handleSubmit = () => {
    alert("KYC Submitted Successfully!");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Complete Your KYC</h1>

      <label className="block mb-2">Bank Name</label>
      <input
        type="text"
        name="bankName"
        value={bank.bankName}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2">Account Holder Name</label>
      <input
        type="text"
        name="holderName"
        value={bank.holderName}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2">Account Number</label>
      <input
        type="text"
        name="accountNumber"
        value={bank.accountNumber}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2">IFSC Code</label>
      <input
        type="text"
        name="ifsc"
        value={bank.ifsc}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={handleSubmit}
        className="bg-purple-600 text-white w-full p-2 rounded"
      >
        Submit KYC
      </button>
    </div>
  );
}
