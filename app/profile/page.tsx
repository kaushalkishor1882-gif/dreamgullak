"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Profile() {
  const router = useRouter();

  // ✅ Protect route: redirect to /login if user not authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login"); // redirect to login
      }
    });
    return () => unsubscribe();
  }, [router]);

  const [profile, setProfile] = useState({
    name: "Master9385",
    email: "master9385@gmail.com",
    mobile: "+91 9876543210",
    photo: "/default-avatar.png",
  });

  // ✅ Load saved data from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  // ✅ Save profile to localStorage
  const saveProfile = (updatedProfile: any) => {
    setProfile(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
  };

  // ✅ Handle input change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const updated = { ...profile, [name]: value };
    saveProfile(updated);
  };

  // ✅ Handle profile photo upload (convert to Base64)
  const handlePhotoChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const updated = { ...profile, photo: base64String };
      saveProfile(updated);
    };
    reader.readAsDataURL(file);
  };

  // ✅ Handle save button and navigate to /account
  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    alert("✅ Profile saved successfully!");
    router.push("/account"); // ← Redirect to Account page
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-800">
        My Profile
      </h1>

      {/* Profile Photo */}
      <div className="flex flex-col items-center">
        <img
          src={profile.photo}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover mb-3 border"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="mb-4 text-sm"
        />
      </div>

      {/* Profile Info */}
      <label className="block mb-2 font-medium">Name</label>
      <input
        type="text"
        name="name"
        value={profile.name}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-medium">Email</label>
      <input
        type="email"
        name="email"
        value={profile.email}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-medium">Mobile</label>
      <input
        type="text"
        name="mobile"
        value={profile.mobile}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="bg-purple-600 hover:bg-purple-700 text-white w-full p-2 rounded font-medium transition"
      >
        Save Changes
      </button>
    </div>
  );
}
