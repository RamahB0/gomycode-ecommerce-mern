# Full E-Commerce Website Project (MERN Stack)

A full-stack e-commerce web app built for the GoMyCode "Full E-Commerce Website
Project" checkpoint. It implements the required back-end (Node.js/Express +
MongoDB/Mongoose) and front-end (React.js) requirements: user
authentication, a searchable/filterable product catalog, a shopping cart,
and a checkout flow that creates orders.

## Features

- **Authentication** - register/login with hashed passwords (bcrypt) and
  JWT-based sessions.
- **Product catalog & search** - browse products, filter by category and
  price range, and full-text search by keyword.
- **Shopping cart** - add/update/remove items, persisted per user in
  MongoDB.
- **Checkout** - collect a shipping address and payment method, place an
  order, and view order history.
- **Clean, modular code** - routes are thin; password hashing, JWT
  handling, and checkout pricing math are each isolated and covered by the
  verification script described below (see "Verifying it works").

## Tech stack

| Layer    | Technology                                   |
| -------- | --------------------------------------------- |
| Frontend | React 18, React Router, Axios, Vite            |
| Backend  | Node.js, Express, JWT, bcryptjs                |
| Database | MongoDB via Mongoose                           |

## Project structure

```
backend/
  src/
    config/db.js          MongoDB connection helper
    models/                User, Product, Order (Mongoose schemas)
    middleware/auth.js     JWT auth + admin guard middleware
    routes/                auth, products, cart, orders REST endpoints
    utils/pricing.js       Pure checkout-total calculation (unit-tested)
    server.js              Express app wiring + entry point
  scripts/seed.js          Populates sample products in a real database
  demo/run-demo.js         Verification script (see below)
frontend/
  src/
    api.js                 Axios instance (attaches JWT automatically)
    context/                AuthContext, CartContext
    components/             Navbar, ProductCard, ProtectedRoute
    pages/                  ProductList, ProductDetail, Cart, Checkout,
                             Orders, Login, Register
```

## Running it for real

1. **Backend**
   ```bash
   cd backend
   cp .env.example .env      # fill in MONGODB_URI (e.g. a MongoDB Atlas
                              # connection string) and a random JWT_SECRET
   npm install
   node scripts/seed.js      # optional: populate sample products
   npm start                 # API on http://localhost:5000
   ```
2. **Frontend**
   ```bash
   cd frontend
   cp .env.example .env      # VITE_API_URL, defaults to http://localhost:5000/api
   npm install
   npm run dev                # app on http://localhost:3000
   ```

For a production deployment (e.g. Azure, Render, Railway), build the
frontend with `npm run build` and serve the `dist/` output as a static site
or through the backend's Express app, and point `VITE_API_URL` /
`CLIENT_ORIGIN` at your deployed URLs.

## Verifying it works

This project was built and verified inside a sandboxed environment with
**no outbound network route to a MongoDB server**: attempting to boot
`mongodb-memory-server` (which downloads a real `mongod` binary to run
in-process) fails with a 403 from MongoDB's own download host
(`fastdl.mongodb.org`) - the same class of restriction documented in this
author's earlier Redis/MongoDB benchmarking checkpoint.

Rather than skip verification, `backend/demo/run-demo.js` exercises the
**real production code** wherever that's possible without a live database
connection:

1. Imports every model, middleware, and route file to catch syntax/wiring
   errors.
2. Runs the exact `bcryptjs` and `jsonwebtoken` calls `User.js`/`auth.js`
   use, confirming password hashing and JWT sign/verify round-trip
   correctly and reject bad input.
3. Calls the real `requireAuth` Express middleware directly with
   missing/invalid/valid tokens and asserts it responds correctly.
4. Unit-tests `calculateItemsTotal()`, the checkout math extracted into
   `src/utils/pricing.js` specifically so it's testable in isolation.
5. Boots the real Express `app` exported by `src/server.js` (without
   connecting to MongoDB, since the health check doesn't need it) and
   makes an actual HTTP request to `GET /api/health`, proving the full
   middleware chain (CORS, JSON parsing, routing, error handler) wires up.

Run it with:

```bash
cd backend
npm install
npm run demo
```

Output is written to `output.txt` at the repo root. Routes that touch
MongoDB (registration/login persistence, product queries, cart storage,
order creation) use the exact same Mongoose models exercised above, and
are meant to be run end-to-end against a real `MONGODB_URI` per "Running
it for real" - that step just isn't possible from this sandbox.

The frontend was verified with `npm run build` (a full Vite production
build), which compiles every component, page, and route with no errors.

## Checkpoint requirements covered

- Back-end: Node.js + Express API, MongoDB/Mongoose models, JWT auth,
  password hashing, product catalog with search/filtering, cart and order
  endpoints.
- Front-end: React.js app with routing, component-based architecture,
  context-based state management for auth/cart, product catalog + search
  UI, shopping cart, and a full checkout flow (shipping info, payment
  method, order confirmation).
