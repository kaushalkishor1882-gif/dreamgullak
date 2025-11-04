"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Send verification email
      await sendEmailVerification(userCredential.user);

      alert("📩 Verification email sent! Please check your inbox and verify before logging in.");

      // Redirect to login after registration
      router.push("/login");
    } catch (error: any) {
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
      <h1 className="text-3xl font-bold mb-6">🧑💻 Register for DreamGullak</h1>

      <form onSubmit={handleRegister} className="flex flex-col space-y-4 w-80">
        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input with Eye Toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="p-2 border rounded w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-600 hover:text-gray-800"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`p-2 rounded text-white font-semibold ${
            loading ? "bg-gray-400" : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <p className="mt-4">
        Already have an account?{" "}
        <button className="text-blue-500 underline" onClick={() => router.push("/login")}>
          Login
        </button>
      </p>
    </div>
  );
}
