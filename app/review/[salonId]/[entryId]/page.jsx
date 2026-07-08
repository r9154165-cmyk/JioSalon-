"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addDoc, collection, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import StarRating from "@/components/StarRating";

export default function ReviewPage() {
  const { salonId, entryId } = useParams();
  const router = useRouter();
  const user = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!rating || !user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "salons", salonId, "reviews"), {
        customerId: user.uid,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      // Mark this visit as reviewed so we don't ask again
      await updateDoc(doc(db, "salons", salonId, "queue", entryId), { rating });

      // Recompute the salon's average rating (denormalized for fast display on lists)
      const reviewsSnap = await getDocs(collection(db, "salons", salonId, "reviews"));
      const ratings = reviewsSnap.docs.map((d) => d.data().rating);
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      await updateDoc(doc(db, "salons", salonId), {
        avgRating: Math.round(avg * 10) / 10,
        reviewCount: ratings.length,
      });

      router.push("/queue");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-vanilla-50 px-6 py-10 flex flex-col items-center">
      <h1 className="font-display text-2xl text-cola-800 mb-2">Rate your visit</h1>
      <p className="text-sm text-cola-800/60 mb-8">How was your experience?</p>

      <StarRating value={rating} onChange={setRating} size={40} />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment (optional)"
        className="w-full mt-8 bg-vanilla-100 rounded-2xl px-4 py-3.5 text-cola-800 outline-none h-28 resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={!rating || saving}
        className="w-full mt-6 bg-gradient-to-b from-gold to-gold-dark text-cola-950 font-bold rounded-2xl py-3.5 text-sm disabled:opacity-50"
      >
        {saving ? "Submitting..." : "Submit Review"}
      </button>

      <button onClick={() => router.push("/queue")} className="text-xs text-cola-800/40 mt-4 underline">
        Skip for now
      </button>
    </div>
  );
}
