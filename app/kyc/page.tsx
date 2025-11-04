"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged } from "firebase/auth";

export default function KYC() {
  const router = useRouter();

  // Redirect protection — only logged-in users can access this page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login"); // Redirect if not logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  const [bank, setBank] = useState({
    bankName: "",
    holderName: "",
    accountNumber: "",
    ifsc: "",
    mobile: "",
  });

  const [enteredOTP, setEnteredOTP] = useState("");
  const [isOTPStage, setIsOTPStage] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationId, setVerificationId] = useState("");

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setBank({ ...bank, [name]: value });
  };

  // Step 1: Send OTP via Firebase
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (
      !bank.bankName ||
      !bank.holderName ||
      !bank.accountNumber ||
      !bank.ifsc ||
      !bank.mobile
    ) {
      alert("⚠️ Please fill all fields before submitting!");
      return;
    }

    try {
      // Initialize Recaptcha
      const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible", // or "normal" if you want visible box
      });

      const formattedPhone = `+91${bank.mobile}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);

      setVerificationId(confirmation.verificationId);
      setIsOTPStage(true);
      alert(`📩 OTP sent to ${bank.mobile}`);
    } catch (error: any) {
      console.error(error);
      alert("❌ Error sending OTP: " + error.message);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!enteredOTP) {
      alert("Please enter the OTP");
      return;
    }

    try {
      const credential = await import("firebase/auth").then(({ PhoneAuthProvider }) =>
        PhoneAuthProvider.credential(verificationId, enteredOTP)
      );

      await import("firebase/auth").then(({ signInWithCredential }) =>
        signInWithCredential(auth, credential)
      );

      setIsVerified(true);
      alert("✅ KYC Verified Successfully!");
    } catch (error: any) {
      console.error(error);
      alert("❌ Invalid OTP. Please try again.");
    }
  };

  // Step 3: Go to account page
  const handleDone = () => {
    router.push("/account");
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center text-purple-700">
        {isVerified ? "🎉 KYC Completed" : "Complete Your KYC"}
      </h1>

      {/* Step 1: KYC Form */}
      {!isOTPStage && !isVerified && (
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-semibold">Bank Name</label>
          <input
            type="text"
            name="bankName"
            value={bank.bankName}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter Bank Name"
          />

          <label className="block mb-2 font-semibold">Account Holder Name</label>
          <input
            type="text"
            name="holderName"
            value={bank.holderName}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter Account Holder Name"
          />

          <label className="block mb-2 font-semibold">Account Number</label>
          <input
            type="text"
            name="accountNumber"
            value={bank.accountNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter Account Number"
          />

          <label className="block mb-2 font-semibold">IFSC Code</label>
          <input
            type="text"
            name="ifsc"
            value={bank.ifsc}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter IFSC Code"
          />

          <label className="block mb-2 font-semibold">Registered Mobile Number</label>
          <input
            type="text"
            name="mobile"
            value={bank.mobile}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-6"
            placeholder="Enter Registered Mobile Number"
          />

          {/* Firebase Recaptcha */}
          <div id="recaptcha-container"></div>

          <button
            type="submit"
            className="bg-purple-600 text-white w-full p-2 rounded hover:bg-purple-700 transition-all"
          >
            Submit KYC
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {isOTPStage && !isVerified && (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-lg text-purple-800">
            Enter the 6-digit OTP sent to your number
          </p>
          <input
            type="text"
            value={enteredOTP}
            onChange={(e) => setEnteredOTP(e.target.value)}
            className="p-2 border rounded text-center tracking-widest w-40 mb-4"
            maxLength={6}
            placeholder="••••••"
          />
          <button
            onClick={handleVerifyOTP}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Verify OTP
          </button>
        </div>
      )}

      {/* Step 3: Verified Page */}
      {isVerified && (
        <div className="bg-white shadow-md p-4 rounded-lg mt-4">
          <h2 className="text-xl font-bold text-green-700 mb-3 text-center">
            ✅ Verified KYC Details
          </h2>
          <p><strong>Bank Name:</strong> {bank.bankName}</p>
          <p><strong>Account Holder:</strong> {bank.holderName}</p>
          <p><strong>Account Number:</strong> {bank.accountNumber}</p>
          <p><strong>IFSC Code:</strong> {bank.ifsc}</p>
          <p><strong>Mobile:</strong> {bank.mobile}</p>

          <button
            onClick={handleDone}
            className="mt-6 bg-purple-600 text-white w-full p-2 rounded hover:bg-purple-700 transition-all"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

