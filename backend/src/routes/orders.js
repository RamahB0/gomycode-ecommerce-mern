const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');
const { calculateItemsTotal } = require('../utils/pricing');

const router = express.Router();
router.use(requireAuth);

// POST /api/orders - checkout: turn the current cart into an order,
// snapshotting product name/price at time of purchase, then empty the cart.
router.post('/', async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const user = await User.findById(req.user.id).populate('cart.product');

    if (!user.cart.length) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'shippingAddress is required.' });
    }

    const items = user.cart.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));
    const itemsTotal = calculateItemsTotal(items);

    const order = await Order.create({
      user: user._id,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      itemsTotal,
    });

    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders - order history for the logged-in user.
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
