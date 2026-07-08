"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/partner/dashboard", icon: "⏳", label: "Queue" },
  { href: "/partner/settings", icon: "⚙️", label: "Settings" },
];

export default function PartnerBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around py-3 px-2 bg-vanilla-50 border-t border-cola-800/10 z-20">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href} className="flex flex-col items-center gap-1">
            <span style={{ opacity: active ? 1 : 0.4 }}>{t.icon}</span>
            <span className={`text-[10px] font-semibold ${active ? "text-cola-800" : "text-cola-800/40"}`}>
              {t.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
