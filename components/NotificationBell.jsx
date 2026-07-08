"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useNotifications } from "@/lib/useNotifications";

export default function NotificationBell() {
  const user = useAuth();
  const { unreadCount } = useNotifications(user?.uid);

  return (
    <Link href="/notifications" className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
      🔔
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gold text-cola-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
