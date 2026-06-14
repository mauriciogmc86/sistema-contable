"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Avatar } from "@/presentation/components/atoms/Avatar";
import { Button } from "@/presentation/components/atoms/Button";
import { CurrencyToggle } from "@/presentation/components/atoms/CurrencyToggle";
import { CompanyPicker } from "@/presentation/components/molecules/CompanyPicker";
import { ThemeToggle } from "@/presentation/components/molecules/ThemeToggle";
import { useAuthStore } from "@/presentation/store/useAuthStore";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <CompanyPicker />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <CurrencyToggle />
        <ThemeToggle />
        <div className="hidden items-center gap-2 sm:flex">
          <Avatar name={user?.name ?? "Usuario"} />
          <span className="text-sm font-medium text-foreground">{user?.name ?? "Usuario"}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" aria-hidden />
        </Button>
      </div>
    </header>
  );
}
