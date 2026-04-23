CREATE OR REPLACE VIEW v_mascotas_vacunacion_pendiente AS
SELECT
    m.id AS mascota_id,
    m.nombre AS mascota_nombre,
    m.especie,
    d.nombre AS dueno_nombre,
    d.telefono AS dueno_telefono,
    MAX(va.fecha_aplicacion) AS ultima_vacuna,
    CASE
        WHEN MAX(va.fecha_aplicacion) IS NULL THEN 'Nunca vacunada'
        ELSE 'Vacuna vencida (' || (CURRENT_DATE - MAX(va.fecha_aplicacion))::TEXT ||' días sin vacunar)'
    END AS estado_vacunacion
FROM mascotas m
JOIN duenos d ON d.id = m.dueno_id
LEFT JOIN vacunas_aplicadas va ON va.mascota_id = m.id
GROUP BY m.id, m.nombre, m.especie, d.nombre, d.telefono
HAVING MAX(va.fecha_aplicacion) IS NULL OR MAX(va.fecha_aplicacion) < CURRENT_DATE - INTERVAL '1 year'
ORDER BY ultima_vacuna ASC NULLS FIRST;