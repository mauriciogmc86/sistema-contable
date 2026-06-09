# Contable Pro — Guía para agentes

Plataforma contable multiempresa (Next.js 15 + React 19 + Tailwind v4 + Zustand + RHF/Zod + Supabase).

## Cómo está organizado el repo
```
src/
  app/                      # Rutas (App Router). (auth)/login, (authenticated)/dashboard/*
  domain/                   # Entidades + interfaces de repositorio (sin dependencias externas)
  application/              # Services, use-cases, DTOs, validation (Zod)
  infrastructure/           # Repositorios (Supabase + Mock) y di.ts (composition root)
  lib/supabase/             # Cliente browser/server + env (credenciales por env)
  presentation/
    components/{atoms,molecules,organisms,templates,providers}
    hooks/                  # useCompanies, useJournalEntries, useAccounts, useAsync...
    store/                  # Zustand (auth, company, theme)
    utils/                  # cn, format (es-VE, VES/USD)
    config/                 # navigation, accounting
  middleware.ts             # Guard de sesión Supabase para /dashboard
```

## Comandos
- `npm run dev` — desarrollo
- `npm run build` — build de producción (incluye lint + types)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `./init.sh` — verificación única (typecheck + lint + build + tests si existen)

## Reglas del proyecto (`.cursor/rules/`)
1. `dry-clean-code` — DRY y Clean Code.
2. `clean-architecture-atomic` — dependencias hacia adentro + Atomic Design.
3. `confirm-before-acting` — confirmar antes de acciones no pedidas/destructivas.

## Subagentes (`.cursor/agents/`)
- `leader` — orquesta y coordina (nunca implementa).
- `implementer` — ejecuta una feature de inicio a fin; siempre llama al `reviewer`.
- `reviewer` — aprueba/rechaza; no edita código.
- `explorer` — investiga una pregunta concreta (solo lectura).

Flujo: **leader → (explorer ×N) → implementer → reviewer → done**.
Estado vivo entre sesiones en `progress/`. Backlog en `feature_list.json`. Aceptación en `CHECKPOINTS.md`.
