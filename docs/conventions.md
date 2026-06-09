# Convenciones — Contable Pro

## Naming
- Componentes: PascalCase (`StatCard.tsx`). Hooks: `useX`. Utilidades/España de dominio en español; identificadores de código en inglés.
- Tipos/Interfaces: PascalCase. Variables/funciones: camelCase. Constantes globales: UPPER_SNAKE.

## Estilo
- Tailwind v4 con **tokens semánticos** (`bg-surface`, `text-muted-foreground`, `border-border`, `bg-primary`...). No hardcodear colores hex ni estilos inline.
- Clases condicionales con `cn`. Sin `!important`.
- Iconos: `lucide-react` (nunca emojis en la UI).
- Formato de números/fechas/moneda: `presentation/utils/format.ts` (locale `es-VE`, doble VES/USD).

## Componentes y estado
- Reutiliza la librería en `presentation/components`. Crea átomos nuevos solo si no existen.
- Estados de datos obligatorios: `loading` (skeletons), `empty` (`EmptyState`), `error` (`ErrorState`).
- Selectores Zustand atómicos (`useStore(s => s.x)`). Memoiza derivados con `useMemo` y handlers con `useCallback`. `dynamic import` para librerías pesadas (recharts ya está en `Chart`).

## Formularios y seguridad
- `react-hook-form` + `zodResolver`, esquemas en `application/validation`.
- Accesibilidad: `FormField` (label + `aria-describedby` + error con `role="alert"`), validación con feedback claro.
- Validadores de dominio: RIF, cédula, email, teléfono VE, montos `>= 0`.
- Credenciales solo por `process.env.NEXT_PUBLIC_SUPABASE_*`. Rutas `/dashboard` protegidas por `middleware.ts`. Nunca loguear contraseñas ni usar `defaultValue` de credenciales.

## Datos
- La UI consume **hooks → use-cases**. Repositorios concretos solo en `infrastructure`.
- Mutaciones que escriben deben validar (`safeParse`) y asumir RLS por tabla en Supabase.
