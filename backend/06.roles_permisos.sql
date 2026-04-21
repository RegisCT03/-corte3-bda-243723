DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'veterinario') THEN CREATE ROLE veterinario NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'recepcion') THEN CREATE ROLE recepcion NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin') THEN CREATE ROLE admin NOLOGIN;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vet_lopez') THEN CREATE USER vet_lopez WITH PASSWORD 'vet_lopez_2026';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vet_garcia') THEN CREATE USER vet_garcia WITH PASSWORD 'vet_garcia_2026';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vet_mendez') THEN CREATE USER vet_mendez WITH PASSWORD 'vet_mendez_2026';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'recepcion_user') THEN CREATE USER recepcion_user WITH PASSWORD 'recepcion_2026';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin_user') THEN CREATE USER admin_user WITH PASSWORD 'admin_2026';
    END IF;
END
$$;

GRANT veterinario TO vet_lopez, vet_garcia, vet_mendez;
GRANT recepcion TO recepcion_user;
GRANT admin TO admin_user;

REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

GRANT USAGE ON SCHEMA public TO veterinario;
GRANT SELECT ON mascotas TO veterinario;
GRANT SELECT ON duenos TO veterinario;
GRANT SELECT, INSERT ON citas TO veterinario;
GRANT USAGE, SELECT ON SEQUENCE citas_id_seq TO veterinario;
GRANT SELECT, INSERT ON vacunas_aplicadas TO veterinario;
GRANT USAGE, SELECT ON SEQUENCE vacunas_aplicadas_id_seq TO veterinario;
GRANT SELECT ON inventario_vacunas TO veterinario;
GRANT SELECT ON vet_atiende_mascota TO veterinario;
GRANT SELECT ON v_mascotas_vacunacion_pendiente TO veterinario;
GRANT EXECUTE ON PROCEDURE sp_agendar_cita(INT, INT, TIMESTAMP, TEXT) TO veterinario;

GRANT USAGE ON SCHEMA public TO recepcion;
GRANT SELECT ON mascotas TO recepcion;
GRANT SELECT ON duenos   TO recepcion;
GRANT SELECT, INSERT ON citas TO recepcion;
GRANT USAGE, SELECT ON SEQUENCE citas_id_seq TO recepcion;
GRANT SELECT ON veterinarios TO recepcion;
GRANT SELECT ON v_mascotas_vacunacion_pendiente TO recepcion;
GRANT EXECUTE ON PROCEDURE sp_agendar_cita(INT, INT, TIMESTAMP, TEXT) TO recepcion;

GRANT USAGE ON SCHEMA public TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO admin;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO admin;