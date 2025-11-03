"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaUserCheck,
  FaHeadset,
  FaInfoCircle,
  FaSignOutAlt,
  FaGlobe,
} from "react-icons/fa";
import BottomNav from "../components/BottomNav";

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "Dream User",
    photo: "/default-avatar.png",
  });

  // ✅ Load profile from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      const data = JSON.parse(saved);
      setProfile({
        name: data.name || "Dream User",
        photo: data.photo || "/default-avatar.png",
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      alert("Logout failed, please try again!");
      console.error(err);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-center p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Account</h2>
      </div>

      {/* Profile Section */}
      <div className="flex items-center p-4 bg-white mt-2">
        {/* ✅ Use next/image for proper rendering */}
        <div className="w-16 h-16 relative rounded-full overflow-hidden border">
          <Image
            src={profile.photo || "/default-avatar.png"}
            alt="Profile"
            fill
            className="object-cover"
            unoptimized // allows base64 images to render
          />
        </div>
        <div className="ml-4">
          <h3 className="font-semibold text-gray-800">{profile.name}</h3>
          <Link href="/profile" className="text-purple-600 text-sm font-medium">
            SEE PROFILE
          </Link>
        </div>
      </div>

      {/* Language Section */}
      <div className="bg-white mt-3 p-4">
        <p className="font-medium text-gray-800 mb-2">Choose Language</p>
        <div className="flex gap-3">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            English
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
            हिंदी
          </button>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white mt-3 divide-y">
        <Link href="/wallet" className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center">
            <FaWallet className="text-purple-600 mr-3" size={20} />
            <div>
              <p className="font-medium text-gray-800">Wallet Balance</p>
              <p className="text-sm text-gray-500">Check your savings</p>
            </div>
          </div>
        </Link>

        <Link href="/kyc" className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center">
            <FaUserCheck className="text-purple-600 mr-3" size={20} />
            <div>
              <p className="font-medium text-gray-800">Complete your KYC</p>
              <p className="text-sm text-gray-500">Verify your identity</p>
            </div>
          </div>
        </Link>

        <Link href="/support" className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center">
            <FaHeadset className="text-purple-600 mr-3" size={20} />
            <div>
              <p className="font-medium text-gray-800">Help & Support</p>
              <p className="text-sm text-gray-500">Customer support, FAQs</p>
            </div>
          </div>
        </Link>

        <Link href="/about" className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center">
            <FaInfoCircle className="text-purple-600 mr-3" size={20} />
            <p className="font-medium text-gray-800">About Dream Gullak</p>
          </div>
        </Link>

        <Link href="/terms" className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center">
            <FaGlobe className="text-purple-600 mr-3" size={20} />
            <p className="font-medium text-gray-800">Terms & Conditions</p>
          </div>
        </Link>

        <Link href="/privacy" className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center">
            <FaGlobe className="text-purple-600 mr-3" size={20} />
            <p className="font-medium text-gray-800">Privacy Policy</p>
          </div>
        </Link>

        <Link href="/contact" className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center">
            <FaHeadset className="text-purple-600 mr-3" size={20} />
            <p className="font-medium text-gray-800">Contact Us</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <FaSignOutAlt className="text-purple-600 mr-3" size={20} />
            <p className="font-medium text-gray-800">Logout</p>
          </div>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
  );
}

