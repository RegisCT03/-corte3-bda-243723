CREATE OR REPLACE PROCEDURE sp_agendar_cita(
    p_mascota_id INT,
    p_veterinario_id INT,
    p_fecha_hora TIMESTAMP,
    p_motivo TEXT,
    OUT p_cita_id INT
)
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_vet_activo BOOLEAN;
    v_dias_desc VARCHAR(50);
    v_dia_semana TEXT;
    v_traslape INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM mascotas WHERE id = p_mascota_id) THEN RAISE EXCEPTION 'Mascota id % no existe', p_mascota_id;
    END IF;

    SELECT activo, dias_descanso INTO v_vet_activo, v_dias_desc FROM veterinarios WHERE id = p_veterinario_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'Veterinario id % no existe', p_veterinario_id;
    END IF;

    IF NOT v_vet_activo THEN RAISE EXCEPTION 'Veterinario id % está inactivo', p_veterinario_id;
    END IF;

    v_dia_semana := CASE EXTRACT(DOW FROM p_fecha_hora)
        WHEN 0 THEN 'domingo'
        WHEN 1 THEN 'lunes'
        WHEN 2 THEN 'martes'
        WHEN 3 THEN 'miércoles'
        WHEN 4 THEN 'jueves'
        WHEN 5 THEN 'viernes'
        WHEN 6 THEN 'sábado'
    END;

    IF v_dias_desc <> '' AND v_dias_desc LIKE '%' || v_dia_semana || '%' THEN RAISE EXCEPTION 'Veterinario descansa % — no se puede agendar para %', v_dias_desc, p_fecha_hora;
    END IF;

    SELECT COUNT(*) INTO v_traslape FROM citas WHERE veterinario_id = p_veterinario_id AND estado <> 'CANCELADA' AND ABS(EXTRACT(EPOCH FROM (fecha_hora - p_fecha_hora))) < 1800;

    IF v_traslape > 0 THEN RAISE EXCEPTION 'Traslape de cita: ya existe cita dentro de 30 min de %', p_fecha_hora;
    END IF;

    INSERT INTO citas (mascota_id, veterinario_id, fecha_hora, motivo, estado) VALUES (p_mascota_id, p_veterinario_id, p_fecha_hora, p_motivo, 'AGENDADA')
    RETURNING id INTO p_cita_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_total_facturado(
    p_mascota_id INT,
    p_anio INT
)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(costo), 0) INTO v_total FROM citas WHERE mascota_id = p_mascota_id AND estado = 'COMPLETADA' AND EXTRACT(YEAR FROM fecha_hora) = p_anio;
    RETURN v_total;
END;
$$;