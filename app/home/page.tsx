"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase"; // ✅ make sure this path is correct

export default function HomePage() {
  const router = useRouter();

  // ✅ Logout handler (Firebase + redirect)
  const handleLogout = async () => {
    try {
      await signOut(auth); // logs user out of Firebase
      router.push("/login"); // redirect to login
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Try again!");
    }
  };

  return (
    <motion.main
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 text-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Piggy Bank Image */}
      <Image
        src="/piggybank.png"
        alt="DreamGullak Piggy Bank"
        width={220}
        height={220}
        className="mb-6 drop-shadow-lg"
      />

      {/* Welcome Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-amber-700 mb-4">
        🪙 Welcome to DreamGullak!
      </h1>
      <p className="text-gray-700 text-lg mb-10">
        Manage your savings, track your goals, and grow your dreams!
      </p>

      {/* Buttons Section */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link href="/create-goal">
          <button className="bg-purple-600 text-white font-semibold p-3 rounded-xl hover:bg-purple-700 transition">
            🟣 Create a Goal
          </button>
        </Link>

        <Link href="/dashboard">
          <button className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition">
            🟣 View Dashboard
          </button>
        </Link>

        <Link href="/add-money">
          <button className="bg-yellow-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-yellow-600 transition">
            💰 Add Money
          </button>
        </Link>

        {/* 🚪 Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-sky-400 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-sky-500 transition"
        >
          🚪 Logout
        </button>
      </div>
    </motion.main>
  );
}
