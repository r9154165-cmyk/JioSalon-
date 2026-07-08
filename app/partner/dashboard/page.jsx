"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/lib/useAuth";
import { useMySalon } from "@/lib/useMySalon";
import ScissorLoader from "@/components/ScissorLoader";
import PartnerBottomNav from "@/components/PartnerBottomNav";

function DashboardInner() {
  const user = useAuth();
  const router = useRouter();
  const { salonId, salon, checked } = useMySalon(user?.uid);
  const [queue, setQueue] = useState(null);

  useEffect(() => {
    if (user === undefined) return;
    if (user === null) {
      router.replace("/login");
      return;
    }
    if (checked && !salonId) router.replace("/partner/setup");
  }, [user, checked, salonId, router]);

  useEffect(() => {
    if (!salonId) return;
    const unsub = onSnapshot(
      query(collection(db, "salons", salonId, "queue"), orderBy("joinedAt", "asc")),
      (snap) => setQueue(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [salonId]);

  async function notifyCustomer(entry, message) {
    if (!entry.customerId) return;
    try {
      await addDoc(collection(db, "notifications"), {
        recipientId: entry.customerId,
        message,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function markInService(entry) {
    await updateDoc(doc(db, "salons", salonId, "queue", entry.id), { status: "in-service" });
    notifyCustomer(entry, `You're up next at ${salon?.name || "the salon"}! Head to the chair.`);
  }

  async function markDone(entry) {
    await updateDoc(doc(db, "salons", salonId, "queue", entry.id), {
      status: "completed",
      completedAt: new Date(),
    });
    notifyCustomer(entry, `Thanks for visiting ${salon?.name || "us"}! Rate your experience in the Queue tab.`);
  }

  if (!salonId || queue === null) {
    return (
      <div className="min-h-screen bg-vanilla-50 flex items-center justify-center">
        <ScissorLoader message="Loading your queue" />
      </div>
    );
  }

  const activeQueue = queue.filter((q) => q.status !== "completed");

  return (
    <div className="min-h-screen bg-vanilla-50 pb-24 px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-cola-600">Partner</p>
          <h1 className="font-display text-2xl text-cola-800">Your Queue</h1>
        </div>
        <button onClick={() => signOut(auth)} className="text-cola-800/50 text-xs underline">
          Sign out
        </button>
      </div>

      {activeQueue.length === 0 ? (
        <p className="text-cola-800/50 text-sm text-center mt-16">
          No one in queue yet. Share your salon link with customers.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {activeQueue.map((entry, i) => (
            <div key={entry.id} className="bg-vanilla-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-display text-lg text-cola-800">
                  #{i + 1} · {entry.customerName}
                </p>
                <p className="text-cola-800/50 text-xs capitalize">{entry.status}</p>
              </div>
              <div className="flex gap-2">
                {entry.status !== "in-service" && (
                  <button
                    onClick={() => markInService(entry)}
                    className="text-xs font-semibold bg-gold text-cola-950 rounded-full px-3 py-2"
                  >
                    Start
                  </button>
                )}
                <button
                  onClick={() => markDone(entry)}
                  className="text-xs font-semibold bg-cola-800 text-vanilla-50 rounded-full px-3 py-2"
                >
                  Done
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PartnerBottomNav />
    </div>
  );
}

export default function PartnerDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-vanilla-50 flex items-center justify-center">
          <ScissorLoader message="Loading your queue" />
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
