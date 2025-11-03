"use client";

import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaUser } from "react-icons/fa";

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();

  // Hide navbar on login/register pages
  if (["/login", "/register"].includes(path)) return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow-sm flex justify-around py-2">
      <button
        onClick={() => router.push("/home")}
        className={`flex flex-col items-center ${
          path === "/home" ? "text-purple-600" : "text-gray-600"
        }`}
      >
        <FaHome size={20} />
        <span className="text-xs mt-1">Home</span>
      </button>

      <button
        onClick={() => router.push("/account")}
        className={`flex flex-col items-center ${
          path === "/account" ? "text-purple-600" : "text-gray-600"
        }`}
      >
        <FaUser size={20} />
        <span className="text-xs mt-1">Account</span>
      </button>
    </nav>
  );
}
