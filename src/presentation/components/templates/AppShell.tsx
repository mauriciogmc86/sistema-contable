"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/presentation/components/organisms/Sidebar";
import { Topbar } from "@/presentation/components/organisms/Topbar";
import { useCompanyStore } from "@/presentation/store/useCompanyStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const loadCompanies = useCompanyStore((s) => s.loadCompanies);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-col md:pl-72 print:pl-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 print:p-0">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
