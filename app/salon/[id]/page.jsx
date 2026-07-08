"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import ScissorLoader from "@/components/ScissorLoader";
import StarRating from "@/components/StarRating";

export default function SalonPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuth();
  const [salon, setSalon] = useState(null);
  const [queue, setQueue] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (user === undefined) return;
    if (user === null) {
      router.replace("/login");
      return;
    }
    getDoc(doc(db, "salons", id)).then((snap) => {
      if (snap.exists()) setSalon({ id: snap.id, ...snap.data() });
    });

    const q = query(collection(db, "salons", id, "queue"), orderBy("joinedAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setQueue(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubReviews = onSnapshot(
      query(collection(db, "salons", id, "reviews"), orderBy("createdAt", "desc")),
      (snap) => setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsub();
      unsubReviews();
    };
  }, [id, user, router]);

  const activeQueue = queue?.filter((q) => q.status !== "completed") || [];
  const myEntry = activeQueue.find((q) => q.customerId === user?.uid);
  const myPosition = myEntry ? activeQueue.findIndex((q) => q.id === myEntry.id) + 1 : null;

  async function handleJoinQueue() {
    setJoining(true);
    try {
      await addDoc(collection(db, "salons", id, "queue"), {
        customerId: user.uid,
        customerName: user.phoneNumber || "Guest",
        salonName: salon.name,
        status: "waiting",
        joinedAt: serverTimestamp(),
      });

      if (salon.ownerId) {
        await addDoc(collection(db, "notifications"), {
          recipientId: salon.ownerId,
          message: `${user.phoneNumber || "A customer"} joined the queue at ${salon.name}`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoining(false);
    }
  }

  async function handleLeaveQueue() {
    if (!myEntry) return;
    setLeaving(true);
    try {
      await deleteDoc(doc(db, "salons", id, "queue", myEntry.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLeaving(false);
    }
  }

  if (!salon || queue === null) {
    return (
      <div className="min-h-screen bg-vanilla-50 flex items-center justify-center">
        <ScissorLoader message="Loading salon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vanilla-50 px-6 py-8">
      <button onClick={() => router.back()} className="text-cola-800/60 text-sm mb-4">
        ← Back
      </button>

      {salon.photoURL && (
        <div
          className="w-full h-40 rounded-3xl bg-cover bg-center mb-4"
          style={{ backgroundImage: `url(${salon.photoURL})` }}
        />
      )}

      <h1 className="font-display text-3xl text-cola-800 mb-1">{salon.name}</h1>
      <p className="text-cola-800/60 text-sm mb-1">{salon.address}</p>
      {salon.avgRating && (
        <p className="text-sm text-gold-dark font-semibold mb-6">
          ★ {salon.avgRating} · {salon.reviewCount} review{salon.reviewCount !== 1 ? "s" : ""}
        </p>
      )}
      {!salon.avgRating && <div className="mb-6" />}

      <div className="bg-cola-800 rounded-3xl p-6 text-center mb-6">
        <p className="text-vanilla-50/60 text-xs uppercase tracking-wide mb-2">People waiting</p>
        <p className="font-display text-5xl text-vanilla-50">
          {activeQueue.filter((q) => q.status === "waiting").length}
        </p>
      </div>

      {myEntry ? (
        <div className="bg-vanilla-100 rounded-3xl p-6 text-center mb-6">
          <p className="text-cola-800/60 text-sm mb-1">Your position</p>
          <p className="font-display text-4xl text-cola-800 mb-1">#{myPosition}</p>
          <p className="text-cola-800/60 text-xs mb-4">
            {myEntry.status === "in-service"
              ? "You're up! Head to the chair."
              : "Hang tight, we'll be ready soon."}
          </p>
          {myEntry.status !== "in-service" &&
            (leaving ? (
              <ScissorLoader message="Leaving queue" />
            ) : (
              <button onClick={handleLeaveQueue} className="text-xs font-semibold text-cola-800/60 underline">
                Leave queue
              </button>
            ))}
        </div>
      ) : joining ? (
        <ScissorLoader message="Taking your seat" />
      ) : (
        <button
          onClick={handleJoinQueue}
          className="w-full bg-gradient-to-b from-gold to-gold-dark text-cola-950 font-bold rounded-2xl py-4 text-sm mb-6"
        >
          Join Queue →
        </button>
      )}

      <p className="text-cola-800/40 text-xs text-center mb-8">
        Pay at salon after your service — no advance payment needed.
      </p>

      {salon.services && salon.services.length > 0 && (
        <div className="mb-8">
          <p className="text-sm font-semibold text-cola-800 mb-3">Services</p>
          <div className="flex flex-col gap-2">
            {salon.services.map((svc, i) => (
              <div key={i} className="bg-vanilla-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-cola-800">{svc.name}</p>
                <p className="text-sm font-semibold text-cola-800">₹{svc.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-cola-800 mb-3">Reviews</p>
        {reviews.length === 0 ? (
          <p className="text-xs text-cola-800/40">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-vanilla-100 rounded-2xl p-4">
                <StarRating value={r.rating} readOnly size={14} />
                {r.comment && <p className="text-sm text-cola-800 mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
