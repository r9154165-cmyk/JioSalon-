"use client";

import { useEffect, useState } from "react";
import {
  collection,
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import ScissorLoader from "@/components/ScissorLoader";
import BottomNav from "@/components/BottomNav";

export default function QueuePage() {
  const user = useAuth();
  const router = useRouter();
  const [myEntry, setMyEntry] = useState(null);
  const [queueIds, setQueueIds] = useState(null);
  const [history, setHistory] = useState([]);
  const [checked, setChecked] = useState(false);

  // Find my active entry across all salons
  useEffect(() => {
    if (user === undefined) return;
    if (user === null) {
      router.replace("/login");
      return;
    }
    const q = query(collectionGroup(db, "queue"), where("customerId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, salonId: d.ref.parent.parent.id, ...d.data() }));
      const active = all.find((e) => e.status === "waiting" || e.status === "in-service");
      const past = all
        .filter((e) => e.status === "completed")
        .sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
      setMyEntry(active || null);
      setHistory(past);
      setChecked(true);
    });
    return () => unsub();
  }, [user, router]);

  // Live position within that salon's queue
  useEffect(() => {
    if (!myEntry) {
      setQueueIds(null);
      return;
    }
    const unsub = onSnapshot(
      query(collection(db, "salons", myEntry.salonId, "queue"), orderBy("joinedAt", "asc")),
      (snap) => setQueueIds(snap.docs.filter((d) => d.data().status !== "completed").map((d) => d.id))
    );
    return () => unsub();
  }, [myEntry]);

  if (user === undefined || !checked) {
    return (
      <div className="min-h-screen bg-vanilla-50 flex items-center justify-center">
        <ScissorLoader message="Checking your queue" />
      </div>
    );
  }

  const position = myEntry && queueIds ? queueIds.indexOf(myEntry.id) + 1 : null;

  return (
    <div className="min-h-screen bg-vanilla-50 pb-24 px-6 pt-10">
      <p className="text-xs uppercase tracking-widest text-gold-dark mb-1">My Queue</p>
      <h1 className="font-display text-2xl text-cola-800 mb-6">Your status</h1>

      {myEntry ? (
        <button
          onClick={() => router.push(`/salon/${myEntry.salonId}`)}
          className="w-full bg-cola-800 rounded-3xl p-6 text-left mb-8"
        >
          <p className="text-sm text-vanilla-50/70">{myEntry.salonName || "Your salon"}</p>
          <p className="font-display text-4xl text-vanilla-50 my-1">
            {position ? `#${position}` : "—"}
          </p>
          <p className="text-xs text-vanilla-50/50">
            {myEntry.status === "in-service"
              ? "You're up! Head to the chair."
              : "Tap to view live status"}
          </p>
        </button>
      ) : (
        <p className="text-sm text-cola-800/50 mb-8">
          You haven&apos;t joined a queue yet. Head to Home to find a salon.
        </p>
      )}

      <p className="text-sm font-semibold text-cola-800 mb-3">Past Visits</p>
      {history.length === 0 ? (
        <p className="text-xs text-cola-800/40">No past visits yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {history.map((h) => (
            <div key={h.id} className="bg-vanilla-100 rounded-2xl px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-cola-800">{h.salonName || "Salon"}</p>
              <span className="text-xs text-cola-800/40">✓ Completed</span>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
