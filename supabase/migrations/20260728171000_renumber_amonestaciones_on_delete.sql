-- Reinicia el contador por trabajador según cantidad real (no MAX) y compacta al eliminar

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

  SELECT (COUNT(*) + 1)::SMALLINT
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

CREATE OR REPLACE FUNCTION public.eliminar_amonestacion(p_amonestacion_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trabajador_id UUID;
BEGIN
  SELECT trabajador_id INTO v_trabajador_id
  FROM public.amonestaciones
  WHERE id = p_amonestacion_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Amonestación no encontrada';
  END IF;

  DELETE FROM public.amonestaciones WHERE id = p_amonestacion_id;

  -- Compactar contador del trabajador: 1, 2, 3… (reinicia en 0 registros → próxima es -01)
  WITH ordered AS (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY numero_trabajador, created_at)::SMALLINT AS new_num
    FROM public.amonestaciones
    WHERE trabajador_id = v_trabajador_id
  )
  UPDATE public.amonestaciones a
  SET numero_trabajador = o.new_num
  FROM ordered o
  WHERE a.id = o.id
    AND a.numero_trabajador IS DISTINCT FROM o.new_num;
END;
$$;

CREATE OR REPLACE FUNCTION public.eliminar_amonestaciones_por_trabajador(p_trabajador_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  PERFORM 1 FROM public.trabajadores WHERE id = p_trabajador_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trabajador no encontrado';
  END IF;

  DELETE FROM public.amonestaciones WHERE trabajador_id = p_trabajador_id;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.crear_amonestacion(UUID, TEXT, TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.eliminar_amonestacion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.eliminar_amonestaciones_por_trabajador(UUID) TO authenticated;
