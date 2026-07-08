"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useNotifications(uid) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  return { notifications, unreadCount };
}
