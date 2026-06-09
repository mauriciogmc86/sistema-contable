import { BarChart3, BookOpenCheck, ShieldCheck, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: BookOpenCheck, title: "Contabilidad multiempresa", desc: "Libro diario, fiscales y plan de cuentas en un solo lugar." },
  { icon: BarChart3, title: "Reportes en tiempo real", desc: "Balances y estados financieros calculados al instante." },
  { icon: ShieldCheck, title: "Seguro por diseño", desc: "Sesiones protegidas y validación en cada formulario." },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="bg-aurora relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-grid absolute inset-0 text-white/70" aria-hidden />
        <div
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-float-slow"
          aria-hidden
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-base font-bold backdrop-blur">
            CP
          </span>
          <span className="text-lg font-bold tracking-tight">
            Contable<span className="text-amber-300">Pro</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            Plataforma contable premium
          </span>
          <h2 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight">
            La contabilidad de tu despacho, <span className="text-amber-300">impecable</span>.
          </h2>
          <p className="mt-4 text-base text-white/70">
            Gestiona múltiples empresas, nómina y reportes fiscales con una experiencia diseñada para profesionales.
          </p>

          <ul className="mt-9 space-y-5">
            {FEATURES.map(({ icon: Icon, title: t, desc }) => (
              <li key={t} className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-5 w-5 text-amber-300" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="text-sm text-white/60">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-6 text-sm text-white/60">
          <div>
            <p className="text-xl font-bold text-white">+500</p>
            <p>empresas gestionadas</p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <p className="text-xl font-bold text-white">99.9%</p>
            <p>disponibilidad</p>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-background px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              CP
            </span>
          </div>
          <div className="mb-7">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
