"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl text-center shadow-lg border border-white/20">
        <h1 className="text-4xl font-extrabold text-white mb-3">
          Welcome to <span className="text-pink-400">DreamGullak 🐷</span>
        </h1>
        <p className="text-gray-200 mb-8">
          Your simple digital piggy bank to save for dreams ✨
        </p>

        {/* Before Login */}
        {!user && (
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-full transition"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-6 rounded-full transition"
            >
              Register
            </button>
          </div>
        )}

        {/* After Login */}
        {user && (
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push("/goals")}
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-full transition"
            >
              🎯 Create a Goal
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-full transition"
            >
              📊 View Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
