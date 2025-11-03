"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const provider = new GoogleAuthProvider();

  // ✨ Handle email/password login
  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // check if verified
      if (!userCredential.user.emailVerified) {
        alert("⚠️ Please verify your email before logging in!");
        return;
      }

      router.push("/home");
    } catch (error: any) {
      alert("Login failed: " + error.message);
    }
  };

  // ✨ Handle Google login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/home");
    } catch (error: any) {
      alert("Google Login failed: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100">
      <h1 className="text-3xl font-bold mb-6">🔐 DreamGullak Login</h1>

      <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-80">
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
        >
          Login
        </button>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Sign in with Google
        </button>
      </form>

      {/* 🆕 Forgot Password Section */}
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
