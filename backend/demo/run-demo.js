// demo/run-demo.js
//
// Verification entry point for this sandbox environment, which has no
// route to a real MongoDB server (outbound access to MongoDB's binary
// download host is blocked here - confirmed by attempting to boot
// mongodb-memory-server, which fails with a 403 on fastdl.mongodb.org).
//
// Rather than skip verification, this script exercises the REAL
// production code directly wherever that's possible without a live DB
// connection:
//   1. Import-chain smoke test: require every route/model/middleware file
//      to catch syntax and wiring errors.
//   2. Auth core: bcryptjs hash/compare (the exact library User.js uses)
//      and jsonwebtoken sign/verify (the exact library auth.js/middleware
//      use) - password hashing and token handling need no database.
//   3. requireAuth middleware: called directly with fake req/res/next to
//      confirm it rejects missing/invalid tokens and accepts valid ones -
//      this is the actual production middleware, not a reimplementation.
//   4. Pricing: calculateItemsTotal(), the checkout math extracted into
//      src/utils/pricing.js specifically so it's unit-testable in isolation.
//   5. HTTP smoke test: boot the real Express `app` exported by
//      src/server.js (without connecting to MongoDB) and hit GET
//      /api/health over an actual HTTP request, proving the middleware
//      chain (CORS, JSON body parsing, routing, error handler) wires up.
//
// What this deliberately does NOT cover: any route that touches the
// database (register/login persistence, product queries, cart storage,
// order creation) - those need `MONGODB_URI` pointing at a real MongoDB
// instance (Atlas or self-hosted). See README.md "Running it for real".

const assert = require('assert');
const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-for-verification-only';

function section(title) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  section('1. Import-chain smoke test');
  require('../src/models/User');
  require('../src/models/Product');
  require('../src/models/Order');
  require('../src/middleware/auth');
  require('../src/routes/auth');
  require('../src/routes/products');
  require('../src/routes/cart');
  require('../src/routes/orders');
  console.log('All models, middleware and routes imported without error.');

  section('2. Auth core: bcryptjs + jsonwebtoken (same libs User.js/auth.js use)');
  const plainPassword = 'Sup3rSecret!';
  const hash = await bcrypt.hash(plainPassword, 10);
  assert.notStrictEqual(hash, plainPassword);
  assert.strictEqual(await bcrypt.compare(plainPassword, hash), true);
  assert.strictEqual(await bcrypt.compare('wrong-password', hash), false);
  console.log('Password hashing round-trips correctly and rejects wrong passwords.');

  const token = jwt.sign({ id: 'user123', isAdmin: false }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.strictEqual(decoded.id, 'user123');
  assert.throws(() => jwt.verify('not-a-real-token', process.env.JWT_SECRET));
  console.log('JWT sign/verify round-trips correctly and rejects tampered tokens.');

  section('3. requireAuth middleware (real production middleware, not a stub)');
  const { requireAuth } = require('../src/middleware/auth');

  function callMiddleware(headers) {
    return new Promise((resolve) => {
      const req = { headers };
      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(body) {
          resolve({ statusCode: this.statusCode, body, nextCalled: false });
        },
      };
      const next = () => resolve({ statusCode: 200, req, nextCalled: true });
      requireAuth(req, res, next);
    });
  }

  const missingTokenResult = await callMiddleware({});
  assert.strictEqual(missingTokenResult.statusCode, 401);
  assert.strictEqual(missingTokenResult.nextCalled, false);

  const invalidTokenResult = await callMiddleware({ authorization: 'Bearer garbage' });
  assert.strictEqual(invalidTokenResult.statusCode, 401);

  const validTokenResult = await callMiddleware({ authorization: `Bearer ${token}` });
  assert.strictEqual(validTokenResult.nextCalled, true);
  assert.strictEqual(validTokenResult.req.user.id, 'user123');
  console.log('requireAuth correctly rejects missing/invalid tokens and passes valid ones through.');

  section('4. Pricing: calculateItemsTotal (src/utils/pricing.js)');
  const { calculateItemsTotal } = require('../src/utils/pricing');
  const total = calculateItemsTotal([
    { price: 19.99, quantity: 2 },
    { price: 5, quantity: 3 },
  ]);
  assert.strictEqual(total, 19.99 * 2 + 5 * 3);
  console.log(`calculateItemsTotal(...) -> ${total.toFixed(2)} (matches hand-computed expectation).`);

  section('5. HTTP smoke test: real Express app, GET /api/health');
  const { app } = require('../src/server');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const healthBody = await new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${port}/api/health`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      })
      .on('error', reject);
  });
  assert.strictEqual(healthBody.status, 200);
  assert.deepStrictEqual(healthBody.body, { status: 'ok' });
  console.log('GET /api/health -> 200 { status: "ok" } over a real HTTP request to the real Express app.');
  await new Promise((resolve) => server.close(resolve));

  section('Done');
  console.log(
    'All checks passed. Routes that touch MongoDB (auth persistence, products, cart, orders)\n' +
      'use the exact same Mongoose models shown above and are exercised end-to-end by\n' +
      'connecting src/server.js to a real MONGODB_URI - see README.md "Running it for real".'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
