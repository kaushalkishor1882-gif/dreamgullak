"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";  // ✅ Added for Firestore
import { db } from "../lib/firebase";               // ✅ Firestore DB import

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔍 Check if this email is already registered (Google or Email/Password)
      const existingMethods = await fetchSignInMethodsForEmail(auth, email);

      if (existingMethods.length > 0) {
        if (existingMethods.includes("google.com")) {
          alert(
            "⚠️ This email is already registered using Google Sign-In. Please sign in with Google instead."
          );
        } else {
          alert("⚠️ This email is already registered. Please log in instead.");
        }
        setLoading(false);
        return;
      }

      // ✅ Create a new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Store user data in Firestore using UID
      await setDoc(
        doc(db, "users", user.uid), // 🔑 Path: users/{uid}
        {
          email: user.email,
          name: "", // Optional - can be updated later
          phone: "",
          createdAt: new Date().toISOString(),
        },
        { merge: true } // Keeps existing fields safe
      );

      // ✅ Send verification email
      await sendEmailVerification(user);

      alert("📩 Verification email sent! Please check your inbox before logging in.");

      // 🚀 Redirect to login after registration
      router.push("/login");

    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        alert(
          "⚠️ This email is already registered. Please log in instead or use Google Sign-In."
        );
      } else if (error.code === "auth/invalid-email") {
        alert("❌ Invalid email format. Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        alert("⚠️ Password should be at least 6 characters long.");
      } else {
        alert("❌ Registration failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
      <h1 className="text-3xl font-bold mb-6">🧑💻 Register for DreamGullak</h1>

      <form onSubmit={handleRegister} className="flex flex-col space-y-4 w-80">
        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input with Eye Toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="p-2 border rounded w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-600 hover:text-gray-800"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`p-2 rounded text-white font-semibold transition-all ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-center">
        Already have an account?{" "}
        <button
          className="text-blue-500 underline"
          onClick={() => router.push("/login")}
        >
          Login
        </button>
      </p>
    </div>
  );
}
