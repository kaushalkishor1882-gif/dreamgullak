"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    photo: "/default-avatar.png",
  });

  // ✅ Protect route: redirect to /login if user not authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      await loadProfile(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  // ✅ Load user data from Firestore
  const loadProfile = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          mobile: data.phone || "",
          photo: data.photo || "/default-avatar.png",
        });
      } else {
        // Create a new empty document for new users
        await setDoc(doc(db, "users", uid), {
          name: "",
          email: user?.email || "",
          phone: "",
          photo: "/default-avatar.png",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      alert("❌ Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle photo upload (Base64)
  const handlePhotoChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfile((prev) => ({ ...prev, photo: base64String }));
    };
    reader.readAsDataURL(file);
  };

// ✅ Save profile changes to Firestore
const handleSave = async () => {
  try {
    const user = auth.currentUser;

    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      {
        name: profile.name,
        email: profile.email,
        phone: profile.mobile,
        photo: profile.photo || user.photoURL || "",
      },
      { merge: true }
    );

    alert("✅ Profile saved successfully!");
    router.push("/account");
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("❌ Failed to save profile. Please try again.");
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
        Loading profile...
      </div>
    );
  }

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
        readOnly // 🧠 prevent users from changing their email directly
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

