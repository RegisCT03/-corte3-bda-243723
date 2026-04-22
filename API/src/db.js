const { Pool } = require('pg');
const ROLE_CREDENTIALS = {
  vet_lopez: { user: 'vet_lopez', password: process.env.VET_LOPEZ_PASS, vet_id: 1 },
  vet_garcia: { user:'vet_garcia', password: process.env.VET_GARCIA_PASS, vet_id: 2 },
  vet_mendez: { user:'vet_mendez', password: process.env.VET_MENDEZ_PASS, vet_id: 3 },
  recepcion_user: { user:'recepcion_user', password: process.env.RECEPCION_PASS, vet_id: null },
  admin_user: { user:'admin_user', password: process.env.ADMIN_PASS, vet_id: null },
};

const DB_BASE = {
  host: process.env.PGHOST || 'postgres',
  database: process.env.PGDATABASE || 'clinica_vet',
  port: parseInt(process.env.PGPORT || '5432'),
};

function makePool(user, password) {
  return new Pool({ ...DB_BASE, user, password });
}

const poolCache = {};

function getPool(dbUser, password) {
  if (!poolCache[dbUser]) {
    poolCache[dbUser] = makePool(dbUser, password);
  } return poolCache[dbUser];
}

async function getClientForRole(roleKey) {
  const creds = ROLE_CREDENTIALS[roleKey];
  if (!creds) throw new Error(`Rol desconocido: ${roleKey}`);

  const pool = getPool(creds.user, creds.password);
  const client = await pool.connect();

  if (creds.vet_id !== null) {
    await client.query("SELECT set_config('app.current_vet_id', $1, true)", [String(creds.vet_id)]);
  } return client;
}
module.exports = { getClientForRole, ROLE_CREDENTIALS };