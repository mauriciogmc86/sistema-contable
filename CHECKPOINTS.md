# CHECKPOINTS — Criterios objetivos de aceptación

El `reviewer` recorre esta lista antes de aprobar.

## Build / calidad
- [ ] `npm run typecheck` sin errores.
- [ ] `npm run lint` sin errores.
- [ ] `npm run build` exitoso.
- [ ] Tests existentes en verde (`./init.sh`).

## Arquitectura y patrones
- [ ] La UI no importa `@/lib/supabase`, `@supabase/*` ni repositorios para datos (usa hooks → use-cases).
- [ ] Dependencias solo hacia adentro; `domain` sin dependencias externas.
- [ ] Atomic Design respetado (un átomo no importa un organismo).
- [ ] Sin duplicación; se reutilizan componentes/utilidades existentes.
- [ ] Archivos/componentes enfocados (< ~150 líneas) o justificadamente extraídos.

## UI/UX (checklist ui-ux-pro-max)
- [ ] Contraste de texto AA (≥ 4.5:1) en light y dark.
- [ ] Focus visible en todos los interactivos; navegación por teclado.
- [ ] Iconos SVG (Lucide), sin emojis en la UI.
- [ ] Estados loading/empty/error en cada funcionalidad.
- [ ] Responsive (375 / 768 / 1024 / 1440) sin layout shift al hacer hover.
- [ ] `prefers-reduced-motion` respetado.

## Seguridad
- [ ] Sin credenciales hardcodeadas; uso de env.
- [ ] Rutas protegidas por `middleware.ts`.
- [ ] Formularios validados con Zod (cliente) y `safeParse` antes de escribir.
- [ ] Sin `console.log` de datos sensibles; sin bypass de auth.
