"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../lib/firebase";

// ✅ Firestore import (new)
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const provider = new GoogleAuthProvider();

  // 🔹 Handle Email/Password Login
  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        alert("⚠️ Please verify your email before logging in!");
        return;
      }

      // ✅ Firestore update by UID (new)
      const user = userCredential.user;
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
        },
        { merge: true }
      );

      router.push("/home");
    } catch (error: any) {
      alert("Login failed: " + error.message);
    }
  };

  // 🔹 Handle Google Login + Link Accounts
  const handleGoogleLogin = async () => {
    try {
      const googleResult = await signInWithPopup(auth, provider);
      const googleEmail = googleResult.user.email;

      if (!googleEmail) return;

      // Check if this email already exists with another method
      const existingMethods = await fetchSignInMethodsForEmail(auth, googleEmail);

      if (
        existingMethods.includes("password") &&
        !existingMethods.includes("google.com")
      ) {
        // 🔗 Link Google to existing Email/Password account
        const passwordCredential = EmailAuthProvider.credential(
          googleEmail,
          prompt("Enter your password to link Google account:")
        );

        await linkWithCredential(googleResult.user, passwordCredential);
        alert("✅ Your Google account is now linked with your existing DreamGullak account.");
      }

      // ✅ Firestore update by UID (new)
      const user = googleResult.user;
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
        },
        { merge: true }
      );

      router.push("/home");
    } catch (error: any) {
      console.error(error);
      alert("Google Login failed: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100">
      <h1 className="text-3xl font-bold mb-6">🔐 DreamGullak Login</h1>

      <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-80">
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

        {/* Login Button */}
        <button
          type="submit"
          className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
        >
          Login
        </button>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Sign in with Google
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        <a
          onClick={() => router.push("/forgot-password")}
          className="text-blue-500 hover:underline cursor-pointer"
        >
          Forgot Password?
        </a>
      </p>

      <p className="mt-4">
        Don’t have an account?{" "}
        <button
          className="text-blue-500 underline"
          onClick={() => router.push("/register")}
        >
          Register
        </button>
      </p>
    </div>
  );
}
