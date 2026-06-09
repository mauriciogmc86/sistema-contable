import { cn } from "@/presentation/utils/cn";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export interface AvatarProps {
  name: string;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full",
        "bg-primary/10 text-sm font-semibold text-primary",
        className,
      )}
    >
      {initials(name) || "?"}
    </span>
  );
}
