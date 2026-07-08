"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import BottomNav from "@/components/BottomNav";

const OFFERS = [
  { title: "First visit priority", desc: "Skip 3 places in line on your first booking" },
  { title: "Refer a friend", desc: "Both of you get priority queue next time" },
];

export default function OffersPage() {
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  return (
    <div className="min-h-screen bg-vanilla-50 pb-24 px-6 pt-10">
      <p className="text-xs uppercase tracking-widest text-gold-dark mb-1">Offers</p>
      <h1 className="font-display text-2xl text-cola-800 mb-6">For you</h1>

      <div className="flex flex-col gap-3">
        {OFFERS.map((o) => (
          <div key={o.title} className="bg-vanilla-100 rounded-2xl p-4">
            <p className="font-semibold text-cola-800">{o.title}</p>
            <p className="text-xs text-cola-800/55 mt-1">{o.desc}</p>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
