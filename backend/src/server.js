require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Centralized error handler - keeps route handlers free of repetitive
// try/catch -> res.status(500) boilerplate (they just call next(err)).
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

async function main() {
  const { MONGODB_URI, PORT } = process.env;
  if (!MONGODB_URI) {
    console.error('Set MONGODB_URI (see .env.example) before starting the server.');
    process.exit(1);
  }
  await connectDB(MONGODB_URI);
  const port = PORT || 5000;
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

// Only auto-start when run directly (`node src/server.js`), not when
// required by the demo/test harness, which builds its own `app` wiring
// against a fake in-memory model instead of a real MongoDB connection.
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { app };
