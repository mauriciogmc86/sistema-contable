# Arquitectura — Contable Pro

Clean Architecture en 4 capas con dependencias **solo hacia adentro**.

```
presentation  ─▶  application  ─▶  domain
        ▲                              ▲
        └────── infrastructure ────────┘  (implementa interfaces de domain)
```

## Capas
- **domain** (`src/domain`): entidades (`Account`, `Company`, `JournalEntry`) e interfaces de repositorio. Sin dependencias de frameworks ni de otras capas.
- **application** (`src/application`): `services` (lógica de negocio), `use-cases` (orquestan services), `dtos`, `validation` (esquemas Zod reutilizados por UI y “servidor”).
- **infrastructure** (`src/infrastructure`): repositorios concretos (`Supabase*`, `Mock*`) y `di.ts` (composition root) que instancia services y expone use-cases.
- **presentation** (`src/presentation` + `src/app`): componentes (Atomic Design), hooks que llaman use-cases, stores Zustand, utilidades. Las páginas **nunca** importan Supabase ni repositorios directamente.

## Reglas de dependencia
- `domain` no importa de nadie.
- `application` importa de `domain`.
- `infrastructure` importa de `domain`/`application`.
- `presentation` importa de `application` (use-cases vía `@/infrastructure/di`) y de `domain` (tipos). Para datos usa **hooks**.

## Alcance de datos actual
- **Empresas / trabajadores / legal**: Supabase (real), tras repositorios de infraestructura.
- **Contabilidad (cuentas, asientos, dashboard, reportes)**: repositorios Mock (`ACCOUNTING_COMPANY_ID`). Migrable a Supabase implementando las interfaces existentes (ver `feature_list.json` F-001).

## Atomic Design
`atoms → molecules → organisms → templates → pages`. Un componente solo importa de su nivel o inferior.
