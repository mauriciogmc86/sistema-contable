-- Secuencia global para numeración de amonestaciones (5 dígitos)
CREATE SEQUENCE IF NOT EXISTS public.amonestacion_global_seq START 1;

CREATE TABLE IF NOT EXISTS public.amonestaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trabajador_id UUID NOT NULL REFERENCES public.trabajadores(id) ON DELETE CASCADE,
  secuencia_global INTEGER NOT NULL,
  numero_trabajador SMALLINT NOT NULL CHECK (numero_trabajador >= 1 AND numero_trabajador <= 99),
  codigo VARCHAR(8) NOT NULL UNIQUE,
  clausula TEXT NOT NULL,
  ciudad TEXT NOT NULL DEFAULT 'Maracaibo',
  fecha_documento DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trabajador_id, numero_trabajador)
);

CREATE INDEX IF NOT EXISTS idx_amonestaciones_trabajador ON public.amonestaciones(trabajador_id);

ALTER TABLE public.amonestaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read amonestaciones"
  ON public.amonestaciones FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert amonestaciones"
  ON public.amonestaciones FOR INSERT TO authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.crear_amonestacion(
  p_trabajador_id UUID,
  p_clausula TEXT,
  p_ciudad TEXT DEFAULT 'Maracaibo',
  p_fecha_documento DATE DEFAULT CURRENT_DATE
)
RETURNS public.amonestaciones
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_global_seq INTEGER;
  v_numero_trabajador SMALLINT;
  v_codigo TEXT;
  v_row public.amonestaciones;
BEGIN
  PERFORM 1 FROM public.trabajadores WHERE id = p_trabajador_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trabajador no encontrado';
  END IF;

  v_global_seq := nextval('public.amonestacion_global_seq');

  SELECT COALESCE(MAX(numero_trabajador), 0) + 1
  INTO v_numero_trabajador
  FROM public.amonestaciones
  WHERE trabajador_id = p_trabajador_id;

  IF v_numero_trabajador > 99 THEN
    RAISE EXCEPTION 'El trabajador ya alcanzó el máximo de 99 amonestaciones';
  END IF;

  v_codigo := lpad(v_global_seq::text, 5, '0') || '-' || lpad(v_numero_trabajador::text, 2, '0');

  INSERT INTO public.amonestaciones (
    trabajador_id, secuencia_global, numero_trabajador, codigo, clausula, ciudad, fecha_documento
  ) VALUES (
    p_trabajador_id, v_global_seq, v_numero_trabajador, v_codigo, p_clausula, p_ciudad, p_fecha_documento
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.crear_amonestacion(UUID, TEXT, TEXT, DATE) TO authenticated;
GRANT USAGE ON SEQUENCE public.amonestacion_global_seq TO authenticated;
