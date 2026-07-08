"use client";

import { useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useNotifications } from "@/lib/useNotifications";
import BottomNav from "@/components/BottomNav";

export default function NotificationsPage() {
  const user = useAuth();
  const router = useRouter();
  const { notifications } = useNotifications(user?.uid);

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    notifications
      .filter((n) => !n.read)
      .forEach((n) => {
        updateDoc(doc(db, "notifications", n.id), { read: true }).catch(() => {});
      });
  }, [notifications]);

  return (
    <div className="min-h-screen bg-vanilla-50 pb-24 px-6 pt-10">
      <p className="text-xs uppercase tracking-widest text-gold-dark mb-1">Notifications</p>
      <h1 className="font-display text-2xl text-cola-800 mb-6">Updates</h1>

      {notifications.length === 0 ? (
        <p className="text-sm text-cola-800/50">No notifications yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div key={n.id} className="bg-vanilla-100 rounded-2xl p-4">
              <p className="text-sm text-cola-800">{n.message}</p>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
