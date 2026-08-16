const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

async function loadCart(userId) {
  const user = await User.findById(userId).populate('cart.product');
  return user.cart;
}

// GET /api/cart - current user's cart, populated with product details.
router.get('/', async (req, res, next) => {
  try {
    const cart = await loadCart(req.user.id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// POST /api/cart - add an item, or bump its quantity if already present.
router.post('/', async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const user = await User.findById(req.user.id);
    const existing = user.cart.find((item) => item.product.toString() === productId);
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }
    await user.save();
    res.status(201).json(await loadCart(req.user.id));
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart/:productId - set an exact quantity (removes the line if quantity <= 0).
router.put('/:productId', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user.id);
    const item = user.cart.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart.' });

    if (quantity <= 0) {
      user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = Number(quantity);
    }
    await user.save();
    res.json(await loadCart(req.user.id));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/:productId - remove a line item entirely.
router.delete('/:productId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
    await user.save();
    res.json(await loadCart(req.user.id));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
