"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import ScissorLoader from "@/components/ScissorLoader";

function friendlyError(code) {
  if (code === "auth/email-already-in-use")
    return "This email is already registered. Try logging in instead.";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password")
    return "Incorrect email or password.";
  if (code === "auth/user-not-found")
    return "No account found with this email. Try signing up.";
  if (code === "auth/weak-password")
    return "Password should be at least 6 characters.";
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [role, setRole] = useState("customer"); // only used for signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup() {
    setError("");
    if (!email.trim() || password.length < 6) {
      setError("Enter a valid email and a password with at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", cred.user.uid), {
        email: email.trim(),
        role,
        createdAt: serverTimestamp(),
      });
      router.push(role === "partner" ? "/partner/setup" : "/home");
    } catch (err) {
      console.error(err);
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const savedRole = snap.exists() ? snap.data().role : "customer";
      router.push(savedRole === "partner" ? "/partner/dashboard" : "/home");
    } catch (err) {
      console.error(err);
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cola-800 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-2 text-center">
          {mode === "login" ? "Welcome Back" : "Get Started"}
        </p>
        <h1 className="font-display text-4xl text-vanilla-50 text-center mb-8">Jio Salon</h1>

        <div className="flex bg-white/5 rounded-full p-1 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
              mode === "login" ? "bg-vanilla-50 text-cola-800" : "text-vanilla-50/60"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
              mode === "signup" ? "bg-vanilla-50 text-cola-800" : "text-vanilla-50/60"
            }`}
          >
            Sign Up
          </button>
        </div>

        {mode === "signup" && (
          <div className="flex bg-white/5 rounded-full p-1 mb-6">
            <button
              onClick={() => setRole("customer")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
                role === "customer" ? "bg-vanilla-50 text-cola-800" : "text-vanilla-50/60"
              }`}
            >
              ✨ Customer
            </button>
            <button
              onClick={() => setRole("partner")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
                role === "partner" ? "bg-vanilla-50 text-cola-800" : "text-vanilla-50/60"
              }`}
            >
              ✂ Partner
            </button>
          </div>
        )}

        <p className="text-vanilla-50/70 text-sm text-center mb-6">Skip the wait. Take your seat.</p>

        {loading ? (
          <ScissorLoader message={mode === "login" ? "Logging in" : "Creating account"} />
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <p className="text-vanilla-50/70 text-xs mb-2">Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 mb-4 text-vanilla-50 outline-none placeholder:text-vanilla-50/30"
            />
            <p className="text-vanilla-50/70 text-xs mb-2">Password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 mb-4 text-vanilla-50 outline-none placeholder:text-vanilla-50/30"
            />
            {error && <p className="text-red-300 text-xs mb-3">{error}</p>}
            <button
              onClick={mode === "login" ? handleLogin : handleSignup}
              className="w-full bg-gradient-to-b from-gold to-gold-dark text-cola-950 font-bold rounded-2xl py-3.5 text-sm"
            >
              {mode === "login" ? "Log In →" : "Create Account →"}
            </button>
          </div>
        )}

        <p className="text-vanilla-50/40 text-xs text-center mt-8">
          By continuing, you agree to Jio Salon&apos;s Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}
