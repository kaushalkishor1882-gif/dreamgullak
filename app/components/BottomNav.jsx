"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-3 shadow-sm">
      <Link
        href="/home"
        className={`flex flex-col items-center text-sm ${
          pathname === "/home" ? "text-purple-600" : "text-gray-500"
        }`}
      >
        <Home size={22} />
        <span>Home</span>
      </Link>

      <Link
        href="/account"
        className={`flex flex-col items-center text-sm ${
          pathname === "/account" ? "text-purple-600" : "text-gray-500"
        }`}
      >
        <User size={22} />
        <span>Account</span>
      </Link>
    </nav>
  );
}
