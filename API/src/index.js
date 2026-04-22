const express = require('express');
const cors = require('cors');

const mascotasRouter = require('./routes/mascotas');
const citasRouter = require('./routes/citas');
const vacunasRouter = require('./routes/vacunas');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} role=${req.headers['x-role-key'] || 'none'}`);
  next();
});

app.use('/api/mascotas', mascotasRouter);
app.use('/api/citas', citasRouter);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[API] Corriendo en http://localhost:${PORT}`);
});