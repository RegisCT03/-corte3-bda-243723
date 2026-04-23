const express = require('express');
const router = express.Router();
const { getClientForRole, ROLE_CREDENTIALS } = require('../db');
const { getVacunacionCache, setVacunacionCache, invalidateVacunacionCache } = require('../cache');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

async function beginTx(client, roleKey) {
  await client.query('BEGIN');
  const creds = ROLE_CREDENTIALS[roleKey];
  if (creds.vet_id !== null) {
    await client.query('SET LOCAL app.current_vet_id = $1', [String(creds.vet_id)]);
  }
}

router.get('/pendientes', async (req, res) => {
  let client;
  try {
    const cached = await getVacunacionCache();
    if (cached) {
      return res.json({ data: cached, source: 'cache' });
    }

    const start = Date.now();
    client = await getClientForRole(req.roleKey);
    await beginTx(client, req.roleKey);

    const result = await client.query('SELECT * FROM v_mascotas_vacunacion_pendiente');
    await client.query('COMMIT');

    const elapsed = Date.now() - start;
    console.log(`[BD] v_mascotas_vacunacion_pendiente: ${result.rowCount} filas en ${elapsed}ms`);

    await setVacunacionCache(result.rows);

    res.json({ data: result.rows, source: 'db', elapsed_ms: elapsed });
        } catch (err) {
            if (client) await client.query('ROLLBACK').catch(() => {});
            res.status(500).json({ error: err.message });
        } finally {
    if (client) client.release();}
});

router.get('/inventario', async (req, res) => {
  let client;
  try {
    client = await getClientForRole(req.roleKey);
    await beginTx(client, req.roleKey);
    const result = await client.query('SELECT * FROM inventario_vacunas ORDER BY nombre');
    await client.query('COMMIT');
    res.json({ data: result.rows });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

router.post('/aplicar', async (req, res) => {
  let client;
  try {
    const mascota_id = parseInt(req.body.mascota_id, 10);
    const vacuna_id = parseInt(req.body.vacuna_id, 10);
    const veterinario_id = parseInt(req.body.veterinario_id, 10);
    const costo_cobrado = parseFloat(req.body.costo_cobrado || 0);

    if (isNaN(mascota_id) || isNaN(vacuna_id) || isNaN(veterinario_id)) {
      return res.status(400).json({ error: 'IDs inválidos' });
    }

    client = await getClientForRole(req.roleKey);
    await beginTx(client, req.roleKey);

    await client.query(
      `INSERT INTO vacunas_aplicadas (mascota_id, vacuna_id, veterinario_id, fecha_aplicacion, costo_cobrado)
       VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
      [mascota_id, vacuna_id, veterinario_id, costo_cobrado]
    );

    await client.query('COMMIT');
    await invalidateVacunacionCache();
    
    res.status(201).json({ message: 'Vacuna aplicada. Caché Redis invalidado.' });
        } catch (err) {
            if (client) await client.query('ROLLBACK').catch(() => {});
            console.error('[vacunas POST]', err.message);
            res.status(400).json({ error: err.message });
        } finally {
    if (client) client.release();
  }
});
module.exports = router;