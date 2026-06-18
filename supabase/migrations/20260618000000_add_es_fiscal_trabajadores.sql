-- Diferencia trabajadores fiscales vs no fiscales para reportes de personal.
ALTER TABLE public.trabajadores
  ADD COLUMN IF NOT EXISTS es_fiscal BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.trabajadores.es_fiscal IS
  'true = fiscal, false = no fiscal';
