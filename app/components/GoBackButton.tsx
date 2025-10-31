"use client";

import { useRouter } from "next/navigation";

export default function GoBackButton() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back(); // Go to previous page if available
    } else {
      router.push("/home"); // Otherwise, go to home
    }
  };

  return (
    <button
      onClick={handleGoBack}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
    >
      Go Back
    </button>
  );
}
