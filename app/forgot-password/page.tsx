"use client";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email.trim()) {
      alert("⚠️ Please enter your registered email.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      alert("✅ Password reset link sent! Check your inbox.");
      router.push("/login"); // Redirect to login after sending
    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-700 to-purple-700 text-white">
      <h1 className="text-3xl font-bold mb-6">🔒 Reset Password</h1>

      <input
        type="email"
        placeholder="Enter your registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 rounded text-black mb-4 w-80"
        disabled={loading}
      />

      <button
        onClick={handleReset}
        className={`p-2 rounded text-lg font-semibold transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-pink-500 hover:bg-pink-600"
        }`}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      <button
        onClick={() => router.push("/login")}
        className="mt-4 underline text-sm hover:text-gray-200"
      >
        ← Back to Login
      </button>
    </div>
  );
}
