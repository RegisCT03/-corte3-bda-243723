const express = require('express');
const router = express.Router();
const { getClientForRole, ROLE_CREDENTIALS } = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

async function beginTx(client, roleKey) {
  await client.query('BEGIN');
  const creds = ROLE_CREDENTIALS[roleKey];
  if (creds.vet_id !== null) {
    await client.query("SELECT set_config('app.current_vet_id', $1, true)", [String(creds.vet_id)]);
  }
}

router.get('/', async (req, res) => {
  let client;
  try {
    client = await getClientForRole(req.roleKey);
    await beginTx(client, req.roleKey);

    const result = await client.query(
      `SELECT c.id, c.fecha_hora, c.motivo, c.costo, c.estado, m.nombre AS mascota_nombre, v.nombre AS vet_nombre FROM citas c
         JOIN mascotas m ON m.id = c.mascota_id
         JOIN veterinarios v ON v.id = c.veterinario_id
        ORDER BY c.fecha_hora DESC`
    );
    await client.query('COMMIT');
    res.json({ data: result.rows });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

router.post('/', async (req, res) => {
  let client;
  try {
    const mascota_id = parseInt(req.body.mascota_id, 10);
    const veterinario_id = parseInt(req.body.veterinario_id, 10);
    const fecha_hora = req.body.fecha_hora;
    const motivo = String(req.body.motivo || '').slice(0, 500);

    if (isNaN(mascota_id) || isNaN(veterinario_id)) {
      return res.status(400).json({ error: 'IDs deben ser enteros' });
    }
    if (!fecha_hora || isNaN(Date.parse(fecha_hora))) {
      return res.status(400).json({ error: 'fecha_hora inválida' });
    }

    client = await getClientForRole(req.roleKey);
    await beginTx(client, req.roleKey);

    const result = await client.query(
      'CALL sp_agendar_cita($1, $2, $3::TIMESTAMP, $4, NULL)',
      [mascota_id, veterinario_id, fecha_hora, motivo]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Cita agendada', data: result.rows[0] });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('[citas POST]', err.message);
    res.status(400).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});
module.exports = router;