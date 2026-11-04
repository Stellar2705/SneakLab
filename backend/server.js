require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

/* ---------- Middleware ---------- */
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',');
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(null, true)) }));
app.use(express.json({ limit: '2mb' }));

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method}  ${req.originalUrl}`);
  next();
});

/* ---------- Routes ---------- */
app.get('/', (_req, res) => res.json({ brand: 'SNEAKLAB', status: 'live' }));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/coupons', require('./src/routes/coupons'));
app.use('/api/admin', require('./src/routes/admin'));

/* ---------- 404 + errors ---------- */
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('ERROR:', err.message);
  res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
});

/* ---------- Connect, auto-seed if empty, listen ---------- */
const PORT = process.env.PORT || 5000;
const { connectDB } = require('./src/config/db');
const { seedIfEmpty } = require('./src/seed/seed');

connectDB()
  .then(() => seedIfEmpty())
  .then(() => {
    app.listen(PORT, () => console.log(`✅ SNEAKLAB Server on ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
