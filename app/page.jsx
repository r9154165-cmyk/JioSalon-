"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import ScissorLoader from "@/components/ScissorLoader";

export default function RootPage() {
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return; // still checking
    router.replace(user ? "/home" : "/login");
  }, [user, router]);

  return (
    <div className="min-h-screen bg-vanilla-50 flex items-center justify-center">
      <ScissorLoader message="Loading Jio Salon" />
    </div>
  );
}
