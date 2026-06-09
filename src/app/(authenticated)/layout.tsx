"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/presentation/components/templates";
import { Spinner } from "@/presentation/components/atoms/Spinner";
import { useCompanies } from "@/presentation/hooks";
import { useAuthStore } from "@/presentation/store/useAuthStore";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const syncSession = useAuthStore((s) => s.syncSession);
  const [checking, setChecking] = useState(true);

  // Verify the real Supabase session (same source the middleware trusts)
  // instead of relying on a non-hydrated persisted flag.
  useEffect(() => {
    let active = true;
    syncSession().then((ok) => {
      if (!active) return;
      if (!ok) {
        router.replace("/login");
        return;
      }
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [syncSession, router]);

  // Bootstrap the company list for the whole shell.
  useCompanies();

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
