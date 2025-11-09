"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";

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
      {/* Removed the different-color box */}
      <div className="text-center flex flex-col items-center">
        
        {/* White Ganesha Image */}
        <div className="relative mb-6">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[100px] bg-black/30 blur-[80px] rounded-full opacity-40"></div>
          <Image
            src="/WhiteGanesha.png"
            alt="White Ganesha"
            width={300}
            height={300}
            className="object-contain drop-shadow-2xl relative z-10"
            priority
          />
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-3">
          Welcome to <span className="text-pink-400">DreamGullak 🐷</span>
        </h1>

        <p className="text-gray-200 mb-8">
          Your simple digital piggy bank to save for dreams ✨
        </p>

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
      </div>
    </div>
  );
}

