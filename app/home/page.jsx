"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import ScissorLoader from "@/components/ScissorLoader";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import NotificationBell from "@/components/NotificationBell";

const CATEGORIES = [
  { icon: "✂️", label: "Haircut" },
  { icon: "🪒", label: "Beard" },
  { icon: "💆", label: "Spa" },
  { icon: "💈", label: "Styling" },
];

export default function HomePage() {
  const user = useAuth();
  const router = useRouter();
  const [salons, setSalons] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (user === undefined) return;
    if (user === null) {
      router.replace("/login");
      return;
    }
    const q = query(collection(db, "salons"), where("isOpen", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      setSalons(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, router]);

  if (user === undefined || salons === null) {
    return (
      <div className="min-h-screen bg-vanilla-50 flex items-center justify-center">
        <ScissorLoader message="Finding salons near you" />
      </div>
    );
  }

  const filtered = salons.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-vanilla-50 pb-24">
      <div className="bg-cola-800 px-6 pt-8 pb-7 rounded-b-[32px]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-display text-lg text-vanilla-50">Hi there 👋</p>
            <p className="text-xs text-vanilla-50/60">Look sharp, feel better.</p>
          </div>
          <NotificationBell />
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-3">
          <span>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for salons..."
            className="bg-transparent outline-none w-full text-sm text-vanilla-50 placeholder:text-vanilla-50/40"
          />
        </div>
      </div>

      <div className="px-6 -mt-3">
        <AdBanner />
      </div>

      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-cola-800">Categories</p>
          {activeCategory && (
            <button onClick={() => setActiveCategory(null)} className="text-xs text-gold-dark font-semibold">
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((c) => {
            const active = activeCategory === c.label;
            return (
              <button
                key={c.label}
                onClick={() => setActiveCategory(active ? null : c.label)}
                className="rounded-2xl py-4 flex flex-col items-center gap-1.5"
                style={{ background: active ? "#5C1620" : "#F5EBD6" }}
              >
                <span className="text-xl">{c.icon}</span>
                <span className="text-[11px]" style={{ color: active ? "#FBF6EC" : "rgba(92,22,32,0.7)" }}>
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 mt-7">
        <p className="text-sm font-semibold text-cola-800 mb-3">
          {activeCategory ? `${activeCategory} Salons` : "Nearby Salons"}
        </p>
        <div className="flex flex-col gap-3">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/salon/${s.id}`}
              className="rounded-3xl overflow-hidden shadow-sm flex bg-vanilla-100"
            >
              <div
                className="w-20 flex-shrink-0 bg-cola-600 bg-cover bg-center"
                style={s.photoURL ? { backgroundImage: `url(${s.photoURL})` } : {}}
              />
              <div className="p-4 flex-1 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base text-cola-800">{s.name}</h2>
                  <p className="text-xs text-cola-800/55">{s.address}</p>
                  {s.avgRating && (
                    <p className="text-xs text-gold-dark font-semibold mt-1">
                      ★ {s.avgRating} ({s.reviewCount})
                    </p>
                  )}
                </div>
                <span className="text-xs font-semibold text-gold-dark whitespace-nowrap">
                  Join →
                </span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-center py-6 text-cola-800/40">
              No salons match your search.
            </p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
