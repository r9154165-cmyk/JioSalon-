"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

const CATEGORIES = ["Haircut", "Beard", "Spa", "Styling"];

export default function PartnerSetupPage() {
  const user = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Haircut");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim() || !address.trim()) {
      setError("Please fill in both fields");
      return;
    }
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "salons"), {
        name: name.trim(),
        address: address.trim(),
        category,
        ownerId: user.uid,
        isOpen: true,
        createdAt: serverTimestamp(),
      });
      router.push(`/partner/dashboard?salonId=${docRef.id}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-cola-800 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-2 text-center">Partner Setup</p>
        <h1 className="font-display text-3xl text-vanilla-50 text-center mb-8">Set up your salon</h1>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-vanilla-50/70 text-xs mb-2">Salon name</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul's Hair Studio"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 mb-4 text-vanilla-50 outline-none placeholder:text-vanilla-50/30"
          />
          <p className="text-vanilla-50/70 text-xs mb-2">Address</p>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Shop no, street, city"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 mb-4 text-vanilla-50 outline-none placeholder:text-vanilla-50/30"
          />
          <p className="text-vanilla-50/70 text-xs mb-2">Category</p>
          <div className="flex gap-2 mb-4 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                type="button"
                className="text-sm px-4 py-2 rounded-full font-semibold"
                style={
                  category === c
                    ? { background: "#FBF6EC", color: "#5C1620" }
                    : { background: "rgba(251,246,236,0.08)", color: "rgba(251,246,236,0.6)" }
                }
              >
                {c}
              </button>
            ))}
          </div>
          {error && <p className="text-red-300 text-xs mb-3">{error}</p>}
          <button
            onClick={handleCreate}
            disabled={saving}
            className="w-full bg-gradient-to-b from-gold to-gold-dark text-cola-950 font-bold rounded-2xl py-3.5 text-sm disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Salon →"}
          </button>
        </div>
      </div>
    </div>
  );
}
