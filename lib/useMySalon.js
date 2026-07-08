"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Finds the salon owned by this user, then keeps it live-synced.
export function useMySalon(uid) {
  const [salonId, setSalonId] = useState(null);
  const [salon, setSalon] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "salons"), where("ownerId", "==", uid));
    getDocs(q).then((snap) => {
      if (!snap.empty) setSalonId(snap.docs[0].id);
      setChecked(true);
    });
  }, [uid]);

  useEffect(() => {
    if (!salonId) return;
    const unsub = onSnapshot(doc(db, "salons", salonId), (snap) => {
      if (snap.exists()) setSalon({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [salonId]);

  return { salonId, salon, checked };
}
