-- Numeración por trabajador (reinicia al eliminar todas): 00001-01, 00002-02, …

ALTER TABLE public.amonestaciones DROP CONSTRAINT IF EXISTS amonestaciones_codigo_key;

ALTER TABLE public.amonestaciones
  ADD CONSTRAINT amonestaciones_trabajador_codigo_key UNIQUE (trabajador_id, codigo);

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
  v_numero_trabajador SMALLINT;
  v_codigo TEXT;
  v_row public.amonestaciones;
BEGIN
  PERFORM 1 FROM public.trabajadores WHERE id = p_trabajador_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trabajador no encontrado';
  END IF;

  SELECT (COUNT(*) + 1)::SMALLINT
  INTO v_numero_trabajador
  FROM public.amonestaciones
  WHERE trabajador_id = p_trabajador_id;

  IF v_numero_trabajador > 99 THEN
    RAISE EXCEPTION 'El trabajador ya alcanzó el máximo de 99 amonestaciones';
  END IF;

  v_codigo := lpad(v_numero_trabajador::text, 5, '0') || '-' || lpad(v_numero_trabajador::text, 2, '0');

  INSERT INTO public.amonestaciones (
    trabajador_id, secuencia_global, numero_trabajador, codigo, clausula, ciudad, fecha_documento
  ) VALUES (
    p_trabajador_id, v_numero_trabajador, v_numero_trabajador, v_codigo, p_clausula, p_ciudad, p_fecha_documento
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.crear_amonestacion(UUID, TEXT, TEXT, DATE) TO authenticated;
