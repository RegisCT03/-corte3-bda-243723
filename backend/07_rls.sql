ALTER TABLE mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacunas_aplicadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pol_mascotas_vet ON mascotas;
CREATE POLICY pol_mascotas_vet ON mascotas
    FOR SELECT TO veterinario
    USING (id IN (SELECT mascota_id FROM vet_atiende_mascota WHERE vet_id = current_setting('app.current_vet_id', true)::INT AND activa = TRUE));

DROP POLICY IF EXISTS pol_mascotas_recepcion ON mascotas;
CREATE POLICY pol_mascotas_recepcion ON mascotas
    FOR SELECT TO recepcion
    USING (TRUE);

DROP POLICY IF EXISTS pol_mascotas_admin ON mascotas;
CREATE POLICY pol_mascotas_admin ON mascotas
    FOR ALL TO admin
    USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS pol_vacunas_vet ON vacunas_aplicadas;
CREATE POLICY pol_vacunas_vet ON vacunas_aplicadas
    FOR ALL TO veterinario
    USING (mascota_id IN (SELECT mascota_id FROM vet_atiende_mascota WHERE vet_id = current_setting('app.current_vet_id', true)::INT AND activa = TRUE)) WITH CHECK (mascota_id IN ( SELECT mascota_id FROM vet_atiende_mascota WHERE vet_id = current_setting('app.current_vet_id', true)::INT AND activa = TRUE));

DROP POLICY IF EXISTS pol_vacunas_admin ON vacunas_aplicadas;
CREATE POLICY pol_vacunas_admin ON vacunas_aplicadas
    FOR ALL TO admin
    USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS pol_citas_vet ON citas;
CREATE POLICY pol_citas_vet ON citas
    FOR ALL TO veterinario
    USING ( veterinario_id = current_setting('app.current_vet_id', true)::INT) WITH CHECK ( veterinario_id = current_setting('app.current_vet_id', true)::INT);

DROP POLICY IF EXISTS pol_citas_recepcion ON citas;
CREATE POLICY pol_citas_recepcion ON citas
    FOR SELECT TO recepcion USING (TRUE);

DROP POLICY IF EXISTS pol_citas_recepcion_insert ON citas;
CREATE POLICY pol_citas_recepcion_insert ON citas
    FOR INSERT TO recepcion WITH CHECK (TRUE);

DROP POLICY IF EXISTS pol_citas_admin ON citas;
CREATE POLICY pol_citas_admin ON citas
    FOR ALL TO admin USING (TRUE) WITH CHECK (TRUE);