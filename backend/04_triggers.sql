CREATE OR REPLACE FUNCTION fn_registrar_historial_cita()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
    INSERT INTO historial_movimientos (tipo, referencia_id, descripcion, fecha)
    VALUES (
        'NUEVA_CITA',
        NEW.id,
        FORMAT('Cita agendada: mascota_id=%s, veterinario_id=%s, fecha=%s, motivo=%s', NEW.mascota_id, NEW.veterinario_id, NEW.fecha_hora, COALESCE(NEW.motivo, 'sin motivo')),
        NOW()
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_historial_cita ON citas;
CREATE TRIGGER trg_historial_cita
    AFTER INSERT ON citas FOR EACH ROW
    EXECUTE FUNCTION fn_registrar_historial_cita();


CREATE OR REPLACE FUNCTION fn_alerta_stock_bajo()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
    IF NEW.stock_actual < NEW.stock_minimo THEN
        INSERT INTO alertas (tipo, descripcion, fecha)
        VALUES (
            'STOCK_BAJO',
            FORMAT('Stock bajo para "%s": actual=%s, mínimo=%s', NEW.nombre, NEW.stock_actual, NEW.stock_minimo),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_alerta_stock_bajo ON inventario_vacunas;
CREATE TRIGGER trg_alerta_stock_bajo
    AFTER UPDATE OF stock_actual ON inventario_vacunas FOR EACH ROW
    EXECUTE FUNCTION fn_alerta_stock_bajo();


CREATE OR REPLACE FUNCTION fn_reducir_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
    UPDATE inventario_vacunas
       SET stock_actual = stock_actual - 1
     WHERE id = NEW.vacuna_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reducir_stock_al_vacunar ON vacunas_aplicadas;
CREATE TRIGGER trg_reducir_stock_al_vacunar
    AFTER INSERT ON vacunas_aplicadas FOR EACH ROW
    EXECUTE FUNCTION fn_reducir_stock();