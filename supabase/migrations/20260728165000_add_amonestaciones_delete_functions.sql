-- Funciones controladas para eliminar amonestaciones (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.eliminar_amonestacion(p_amonestacion_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.amonestaciones WHERE id = p_amonestacion_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Amonestación no encontrada';
  END IF;
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

GRANT EXECUTE ON FUNCTION public.eliminar_amonestacion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.eliminar_amonestaciones_por_trabajador(UUID) TO authenticated;
