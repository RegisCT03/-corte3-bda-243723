const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

redis.on('connect', () => console.log('[REDIS] Conectado'));
redis.on('error', (e) => console.error('[REDIS] Error:', e.message));

const VACUNACION_KEY = 'clinica:vacunacion_pendiente';
const VACUNACION_TTL = 300;

async function getVacunacionCache() {
  const ts = new Date().toISOString();
  const cached = await redis.get(VACUNACION_KEY);

  if (cached) {
    console.log(`[${ts}] [CACHE HIT]  ${VACUNACION_KEY}`);
    return JSON.parse(cached);
  } console.log(`[${ts}] [CACHE MISS] ${VACUNACION_KEY} — consultando BD`); return null;
}

async function setVacunacionCache(data) {
  await redis.setex(VACUNACION_KEY, VACUNACION_TTL, JSON.stringify(data));
  const ts = new Date().toISOString();
  console.log(`[${ts}] [CACHE SET]  ${VACUNACION_KEY} TTL=${VACUNACION_TTL}s`);
}

async function invalidateVacunacionCache() {
  await redis.del(VACUNACION_KEY);
  const ts = new Date().toISOString();
  console.log(`[${ts}] [CACHE INVALIDATED] ${VACUNACION_KEY}`);
}

module.exports = {
  redis,
  getVacunacionCache,
  setVacunacionCache,
  invalidateVacunacionCache,
};