"use client";

import { useRouter } from "next/navigation";

export default function GoBackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/home")} // ✅ Navigates to home page
      className="bg-black text-white px-4 py-2 rounded-lg mt-4 hover:bg-gray-800 transition"
    >
      ← Go Back
    </button>
  );
}
