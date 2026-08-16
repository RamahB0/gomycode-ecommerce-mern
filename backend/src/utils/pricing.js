// Pure, DB-independent pricing logic - kept out of the route handler so it
// can be unit tested directly (see demo/run-demo.js) without needing a
// MongoDB connection.

function calculateItemsTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

module.exports = { calculateItemsTotal };
