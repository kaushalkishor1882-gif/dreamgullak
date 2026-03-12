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

// ⭐ IMPORT THEME CONTEXT
import { useTheme } from "../context/ThemeContext";

// ----------------------------
// ⭐ SAFE LOCAL TRANSLATIONS
// ----------------------------
const TEXT = {
  en: {
    account: "Account",
    see_profile: "SEE PROFILE",
    choose_language: "Choose Language",
    english: "English",
    hindi: "हिंदी",

    wallet_balance: "Wallet Balance",
    wallet_description: "Check your savings",

    complete_kyc: "Complete your KYC",
    complete_kyc_desc: "Verify your identity",

    refer_friends: "Refer Friends",
    refer_friends_desc: "Share Dream Gullak with your friends",

    help_support: "Help & Support",
    help_support_desc: "Customer support, FAQs",

    about: "About Dream Gullak",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    contact_us: "Contact Us",

    logout: "Logout",

    transaction_history: "Transaction History",
    loading: "Loading...",
    no_transactions: "No transactions yet.",
    successful: "Successful",
    failed: "Failed",
  },

  hi: {
    account: "अकाउंट",
    see_profile: "प्रोफ़ाइल देखें",
    choose_language: "भाषा चुनें",
    english: "English",
    hindi: "हिंदी",

    wallet_balance: "वॉलेट बैलेंस",
    wallet_description: "अपनी बचत देखें",

    complete_kyc: "KYC पूरा करें",
    complete_kyc_desc: "अपनी पहचान सत्यापित करें",

    refer_friends: "दोस्तों को रेफर करें",
    refer_friends_desc: "अपने दोस्तों के साथ Dream Gullak साझा करें",

    help_support: "मदद और समर्थन",
    help_support_desc: "कस्टमर सपोर्ट, FAQs",

    about: "Dream Gullak के बारे में",
    terms: "नियम और शर्तें",
    privacy: "प्राइवेसी पॉलिसी",
    contact_us: "संपर्क करें",

    logout: "लॉगआउट",

    transaction_history: "लेन-देन इतिहास",
    loading: "लोड हो रहा है...",
    no_transactions: "अभी तक कोई लेन-देन नहीं",
    successful: "सफल",
    failed: "असफल",
  },
};

export default function AccountPage() {
  const router = useRouter();

  // ⭐ THEME STATE
  const { dark, toggleTheme } = useTheme();

  // ⭐ Load language from localStorage
  const [lang, setLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "hi" || saved === "en") {
      setLang(saved);
    }
  }, []);

  const t = (key: string) => TEXT[lang][key] || key;

  const changeLang = (newLang: "en" | "hi") => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  //------------------------------

  const [profile, setProfile] = useState({
    name: "Dream User",
    email: "",
    photo: "/default-avatar.png",
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user profile + transactions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
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
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    router.replace("/login");
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-black pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-center p-4 bg-white dark:bg-[#1a1a1a] shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t("account")}
        </h2>
      </div>

      {/* Profile */}
      <div className="flex items-center p-4 bg-white dark:bg-[#1a1a1a] mt-2">
        <div className="w-16 h-16 relative rounded-full overflow-hidden border">
          <Image src={profile.photo} alt="Profile" fill className="object-cover" unoptimized />
        </div>
        <div className="ml-4">
          <h3 className="font-semibold text-gray-800 dark:text-white">{profile.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{profile.email}</p>
          <Link href="/profile" className="text-purple-600 text-sm font-medium">
            {t("see_profile")}
          </Link>
        </div>
      </div>

      {/* ⭐ THEME SECTION */}
      <div className="bg-white dark:bg-[#1a1a1a] mt-3 p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
          Theme
        </h2>

        <div className="flex items-center justify-between">
          <span className="text-md text-gray-800 dark:text-white">Dark Mode</span>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={dark}
              onChange={toggleTheme}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none 
                rounded-full peer 
                peer-checked:bg-blue-600 
                transition-all"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full 
                peer-checked:translate-x-5 
                transition-all shadow"></div>
          </label>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white dark:bg-[#1a1a1a] mt-3 p-4">
        <p className="font-medium text-gray-800 dark:text-white mb-2">
          {t("choose_language")}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => changeLang("en")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              lang === "en"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white text-gray-800"
            }`}
          >
            {t("english")}
          </button>

          <button
            onClick={() => changeLang("hi")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              lang === "hi"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white text-gray-800"
            }`}
          >
            {t("hindi")}
          </button>
        </div>
      </div>

      {/* MENU */}
      <div className="bg-white dark:bg-[#1a1a1a] mt-3 divide-y dark:divide-gray-700">
        <Link href="/wallet" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#222]">
          <div className="flex items-center">
            <FaWallet className="text-purple-600 mr-3" size={20} />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {t("wallet_balance")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {t("wallet_description")}
              </p>
            </div>
          </div>
        </Link>

        <Link href="/kyc" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#222]">
          <div className="flex items-center">
            <FaUserCheck className="text-purple-600 mr-3" size={20} />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {t("complete_kyc")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {t("complete_kyc_desc")}
              </p>
            </div>
          </div>
        </Link>

        <Link href="/refer" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#222]">
          <div className="flex items-center">
            <FaGlobe className="text-purple-600 mr-3" size={20} />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {t("refer_friends")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {t("refer_friends_desc")}
              </p>
            </div>
          </div>
        </Link>

        <Link href="/support" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#222]">
          <div className="flex items-center">
            <FaHeadset className="text-purple-600 mr-3" size={20} />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {t("help_support")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {t("help_support_desc")}
              </p>
            </div>
          </div>
        </Link>

        <Link href="/about" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#222]">
          <div className="flex items-center">
            <FaInfoCircle className="text-purple-600 mr-3" size={20} />
            <p className="font-medium text-gray-800 dark:text-white">{t("about")}</p>
          </div>
        </Link>

        <Link href="/terms" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#222]">
          <div className="flex items-center">
            <FaGlobe className="text-purple-600 mr-3" size={20} />
            <p className="font-medium text-gray-800 dark:text-white">{t("terms")}</p>
          </div>
        </Link>

        <Link href="/privacy" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#222]">
          <div className="flex items-center">
            <FaGlobe className="text-purple-600 mr-3" size={20} />
            <p className="font-medium text-gray-800 dark:text-white">{t("privacy")}</p>
          </div>
        </Link>

        <Link href="/contact" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#222]">
          <div className="flex items-center">
            <FaHeadset className="text-purple-600 mr-3" size={20} />
            <p className="font-medium text-gray-800 dark:text-white">{t("contact_us")}</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#222]"
        >
          <div className="flex items-center">
            <FaSignOutAlt className="text-purple-600 mr-3" size={20} />
            <p className="font-medium text-gray-800 dark:text-white">{t("logout")}</p>
          </div>
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-[#1a1a1a] mt-4 p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-3">
          <FaHistory className="text-purple-600 mr-2" />
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
            {t("transaction_history")}
          </h3>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-300">{t("loading")}</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-300">{t("no_transactions")}</p>
        ) : (
          <ul className="divide-y dark:divide-gray-700">
            {transactions.map((t) => (
              <li key={t.id} className="py-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      ₹{t.amount} - {t.method?.toUpperCase() || "QR"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      {t.timestamp?.toDate
                        ? t.timestamp.toDate().toLocaleString()
                        : t.createdAt?.toDate
                        ? t.createdAt.toDate().toLocaleString()
                        : new Date().toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      t.status === "success"
                        ? "text-green-600"
                        : "text-red-500"
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
