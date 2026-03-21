"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase"; // ✅ check path correctness
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  // ✅ Protect Home Page: Redirect if not logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login"); // redirect if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ✅ Logout handler (Firebase + Redirect)
  const handleLogout = async () => {
    try {
      await signOut(auth); // logs user out of Firebase
      localStorage.clear();
      sessionStorage.clear();
      router.replace("/login"); // block back navigation
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Try again!");
    }
  };

  return (
    <motion.main
      className="min-h-screen flex flex-col items-center bg-gradient-to-br from-yellow-50 to-orange-100 text-center p-6 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🏦 Piggy Bank Image */}
      <Image
        src="/piggybank.png"
        alt="DreamGullak Piggy Bank"
        width={220}
        height={220}
        className="mb-6 drop-shadow-lg"
      />

      {/* ✨ Welcome Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-amber-700 mb-4">
        🪙 Welcome to DreamGullak!
      </h1>

      <p className="text-gray-700 text-lg mb-10">
        Manage your savings, track your goals, and grow your dreams!
      </p>

      {/* 📂 Buttons Section */}
      <div className="flex flex-col gap-4 items-center">

        <Link href="/create-goal">
          <button className="w-56 bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition">
            🟣 Create a Goal
          </button>
        </Link>

        <Link href="/dashboard">
          <button className="w-56 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition">
            🟣 View Dashboard
          </button>
        </Link>

        <Link href="/add-money">
          <button className="w-56 bg-yellow-500 text-white font-semibold py-3 rounded-xl hover:bg-yellow-600 transition">
            💰 Add Money
          </button>
        </Link>

        <button
          onClick={handleLogout}
          className="w-56 bg-sky-400 text-white font-semibold py-3 rounded-xl hover:bg-sky-500 transition"
        >
          🚪 Logout
        </button>

      </div>
    </motion.main>
  );
}
