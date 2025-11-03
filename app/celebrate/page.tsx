"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";

export default function CelebratePage() {
  const [blast, setBlast] = useState(false);
  const router = useRouter();

  // 🎇 Auto-start confetti after 500ms
  useEffect(() => {
    const timer = setTimeout(() => setBlast(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // 🎆 Stop confetti after a few seconds
  useEffect(() => {
    if (blast) {
      const timer = setTimeout(() => setBlast(false), 7000);
      return () => clearTimeout(timer);
    }
  }, [blast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-400 to-pink-500 text-white text-center">
      <h1 className="text-5xl font-bold mb-4 animate-bounce">🎉 Congratulations! 🎉</h1>
      <p className="text-lg mb-8">
        You’ve achieved your savings goal! Time to celebrate your hard work and dedication. 🥳
      </p>

      {blast && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 300}
          height={typeof window !== "undefined" ? window.innerHeight : 300}
          recycle={false}
          numberOfPieces={400}
          gravity={0.3}
        />
      )}

      <button
        onClick={() => router.push("/dashboard")}
        className="mt-10 bg-purple-700 px-6 py-3 rounded-full text-lg font-semibold hover:bg-purple-800 transition"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

