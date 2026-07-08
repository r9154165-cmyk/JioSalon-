"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdBanner() {
  const [ads, setAds] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "ads"), where("active", "==", true), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setAds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (ads.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % ads.length), 4000);
    return () => clearInterval(t);
  }, [ads]);

  // Fallback default banner when no ads are configured yet
  if (ads.length === 0) {
    return (
      <div className="rounded-3xl p-5 flex items-center justify-between shadow-md bg-gradient-to-br from-gold to-gold-dark">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cola-950">First visit?</p>
          <p className="font-display text-lg font-bold text-cola-950">Skip the line, join free</p>
        </div>
        <span className="text-2xl">✂️</span>
      </div>
    );
  }

  const ad = ads[index];

  return (
    <div>
      <a
        href={ad.link || "#"}
        target="_blank"
        rel="noreferrer"
        className="block rounded-3xl overflow-hidden shadow-md h-28 bg-cover bg-center relative"
        style={{
          backgroundImage: ad.imageURL ? `url(${ad.imageURL})` : undefined,
          background: !ad.imageURL ? ad.bgColor || "#5C1620" : undefined,
        }}
      >
        <div className="absolute inset-0 bg-black/25 flex flex-col justify-end p-4">
          <p className="text-white font-display text-lg">{ad.title}</p>
          {ad.subtitle && <p className="text-white/80 text-xs">{ad.subtitle}</p>}
        </div>
      </a>
      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {ads.map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: i === index ? "#5C1620" : "#E5D9C3" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
