CREATE INDEX idx_mascotas_dueno_id ON mascotas(dueno_id);
CREATE INDEX idx_vacunas_aplicadas_mascota_id ON vacunas_aplicadas(mascota_id);
CREATE INDEX idx_vacunas_aplicadas_vet_id ON vacunas_aplicadas(veterinario_id);
CREATE INDEX idx_vam_vet_activo ON vet_atiende_mascota(vet_id) WHERE activa = TRUE;
CREATE INDEX idx_citas_vet_fecha_activas ON citas(veterinario_id, fecha_hora) WHERE estado <> 'CANCELADA';
CREATE INDEX idx_citas_mascota_completadas ON citas(mascota_id) WHERE estado = 'COMPLETADA';
CREATE INDEX idx_vacunas_aplicadas_max_fecha ON vacunas_aplicadas(mascota_id, fecha_aplicacion DESC);