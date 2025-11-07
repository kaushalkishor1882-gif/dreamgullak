
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
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
  FaHistory,
} from "react-icons/fa";
import BottomNav from "../components/BottomNav";

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "Dream User",
    email: "",
    photo: "/default-avatar.png",
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user profile + transactions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        // ✅ Load profile
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            name: data.name || "Dream User",
            email: data.email || user.email || "",
            photo: data.photo || user.photoURL || "/default-avatar.png",
          });
        } else {
          setProfile({
            name: user.displayName || "Dream User",
            email: user.email || "",
            photo: user.photoURL || "/default-avatar.png",
          });
        }

        // ✅ Fetch transactions (check field name carefully)
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const tx = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setTransactions(tx);
        } else {
          console.warn("No transactions found for user:", user.uid);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      router.replace("/login");
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
        <div className="w-16 h-16 relative rounded-full overflow-hidden border">
          <Image
            src={profile.photo}
            alt="Profile"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="ml-4">
          <h3 className="font-semibold text-gray-800">{profile.name}</h3>
          <p className="text-sm text-gray-600">{profile.email}</p>
          <Link href="/profile" className="text-purple-600 text-sm font-medium">
            SEE PROFILE
          </Link>
        </div>
      </div>

      {/* Language */}
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

      {/* Menu */}
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

      {/* ✅ Transaction History */}
      <div className="bg-white mt-4 p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-3">
          <FaHistory className="text-purple-600 mr-2" />
          <h3 className="font-semibold text-gray-800 text-lg">Transaction History</h3>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y">
            {transactions.map((t) => (
              <li key={t.id} className="py-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      ₹{t.amount} - {t.method?.toUpperCase() || "QR"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t.timestamp?.toDate
                        ? t.timestamp.toDate().toLocaleString()
                        : t.createdAt?.toDate
                        ? t.createdAt.toDate().toLocaleString()
                        : new Date().toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      t.status === "success" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {t.status === "success" ? "Successful" : "Failed"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNav />
    </motion.div>
  );
}

