"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-vanilla-50 pb-24 px-6 pt-10">
      <p className="text-xs uppercase tracking-widest text-gold-dark mb-1">Profile</p>
      <h1 className="font-display text-2xl text-cola-800 mb-6">{user.email}</h1>

      <button
        onClick={() => signOut(auth)}
        className="w-full bg-cola-800 text-vanilla-50 font-bold rounded-2xl py-3.5 text-sm"
      >
        Sign out
      </button>

      <BottomNav />
    </div>
  );
}
