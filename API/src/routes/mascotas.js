const express = require('express');
const router  = express.Router();
const { getClientForRole } = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  let client;
  try {
    client = await getClientForRole(req.roleKey);

    await client.query('BEGIN');

    const { ROLE_CREDENTIALS } = require('../db');
    const creds = ROLE_CREDENTIALS[req.roleKey];
    if (creds.vet_id !== null) {
      await client.query('SET LOCAL app.current_vet_id = $1', [String(creds.vet_id)]);
    }

    const nombre = req.query.nombre || '';

    let sql;
    let params;

    if (nombre.trim()) {
      sql    = `SELECT m.id, m.nombre, m.especie, m.fecha_nacimiento, d.nombre AS dueno_nombre, d.telefono
                FROM mascotas m
                JOIN duenos d ON d.id = m.dueno_id
                WHERE m.nombre ILIKE $1`;
      params = [`%${nombre}%`];
    } else {
      sql    = `SELECT m.id, m.nombre, m.especie, m.fecha_nacimiento, d.nombre AS dueno_nombre, d.telefono
                FROM mascotas m
                JOIN duenos d ON d.id = m.dueno_id
                ORDER BY m.nombre`;
      params = [];
    }

    const result = await client.query(sql, params);
    await client.query('COMMIT');

    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('[mascotas GET]', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

router.get('/:id', async (req, res) => {
  let client;
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    client = await getClientForRole(req.roleKey);
    await client.query('BEGIN');

    const { ROLE_CREDENTIALS } = require('../db');
    const creds = ROLE_CREDENTIALS[req.roleKey];
    if (creds.vet_id !== null) {
      await client.query('SET LOCAL app.current_vet_id = $1', [String(creds.vet_id)]);
    }

    const result = await client.query(
      `SELECT m.*, d.nombre AS dueno_nombre, d.telefono, d.email
         FROM mascotas m
         JOIN duenos d ON d.id = m.dueno_id
        WHERE m.id = $1`,
      [id]
    );

    await client.query('COMMIT');

    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrada o sin acceso' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});
module.exports = router;