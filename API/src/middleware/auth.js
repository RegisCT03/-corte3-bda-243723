const { ROLE_CREDENTIALS } = require('../db');
function authMiddleware(req, res, next) {
  const roleKey = req.headers['x-role-key'];

  if (!roleKey) {
    return res.status(401).json({ error: 'Falta header X-Role-Key' });
  }

  if (!ROLE_CREDENTIALS[roleKey]) {
    return res.status(403).json({ error: `Rol desconocido: ${roleKey}` });
  }
  req.roleKey = roleKey;
  req.isVet = roleKey.startsWith('vet_');
  req.isAdmin = roleKey === 'admin_user';
  next();
} module.exports = authMiddleware;