"use client";

import { useState, useRef } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import ScissorLoader from "@/components/ScissorLoader";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("customer"); // "customer" | "partner"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const confirmationRef = useRef(null);
  const recaptchaRef = useRef(null);

  function setupRecaptcha() {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return recaptchaRef.current;
  }

  async function handleSendOtp() {
    setError("");
    if (phone.trim().length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      const verifier = setupRecaptcha();
      const fullNumber = `+91${phone.trim()}`;
      const confirmation = await signInWithPhoneNumber(auth, fullNumber, verifier);
      confirmationRef.current = confirmation;
      setStep("otp");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    if (otp.trim().length < 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await confirmationRef.current.confirm(otp.trim());
      // Successful login — route by role
      router.push(role === "partner" ? "/partner/setup" : "/home");
    } catch (err) {
      console.error(err);
      setError("Incorrect OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cola-800 flex items-center justify-center px-6 py-12">
      <div id="recaptcha-container" />

      <div className="w-full max-w-sm">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-2 text-center">
          Welcome Back
        </p>
        <h1 className="font-display text-4xl text-vanilla-50 text-center mb-8">
          Jio Salon
        </h1>

        {/* Role toggle */}
        <div className="flex bg-white/5 rounded-full p-1 mb-6">
          <button
            onClick={() => setRole("customer")}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
              role === "customer"
                ? "bg-vanilla-50 text-cola-800"
                : "text-vanilla-50/60"
            }`}
          >
            ✨ Customer
          </button>
          <button
            onClick={() => setRole("partner")}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
              role === "partner"
                ? "bg-vanilla-50 text-cola-800"
                : "text-vanilla-50/60"
            }`}
          >
            ✂ Partner
          </button>
        </div>

        <p className="text-vanilla-50/70 text-sm text-center mb-6">
          Skip the wait. Take your seat.
        </p>

        {loading ? (
          <ScissorLoader
            message={step === "phone" ? "Sending OTP" : "Verifying"}
          />
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            {step === "phone" ? (
              <>
                <p className="text-vanilla-50/70 text-xs mb-2">Phone number</p>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 mb-4">
                  <span className="text-vanilla-50/60 text-sm">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="98765 43210"
                    className="bg-transparent outline-none text-vanilla-50 font-semibold text-base w-full placeholder:text-vanilla-50/30"
                  />
                </div>
                {error && (
                  <p className="text-red-300 text-xs mb-3">{error}</p>
                )}
                <button
                  onClick={handleSendOtp}
                  className="w-full bg-gradient-to-b from-gold to-gold-dark text-cola-950 font-bold rounded-2xl py-3.5 text-sm"
                >
                  Send OTP →
                </button>
                <p className="text-vanilla-50/40 text-xs text-center mt-4">
                  We&apos;ll text you a one-time code. No password needed.
                </p>
              </>
            ) : (
              <>
                <p className="text-vanilla-50/70 text-xs mb-2">
                  Enter the code sent to +91 {phone}
                </p>
                <input
                  type="tel"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 mb-4 text-vanilla-50 font-semibold text-lg w-full text-center tracking-[0.3em] placeholder:text-vanilla-50/30 outline-none"
                />
                {error && (
                  <p className="text-red-300 text-xs mb-3">{error}</p>
                )}
                <button
                  onClick={handleVerifyOtp}
                  className="w-full bg-gradient-to-b from-gold to-gold-dark text-cola-950 font-bold rounded-2xl py-3.5 text-sm"
                >
                  Verify & Continue →
                </button>
                <button
                  onClick={() => setStep("phone")}
                  className="w-full text-vanilla-50/50 text-xs mt-3"
                >
                  Change phone number
                </button>
              </>
            )}
          </div>
        )}

        <p className="text-vanilla-50/40 text-xs text-center mt-8">
          By continuing, you agree to Jio Salon&apos;s Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}
