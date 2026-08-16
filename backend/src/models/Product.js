const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    imageUrl: { type: String, default: '' },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

// Supports the "search by keyword" requirement from the checkpoint spec
// (Product Catalog and Search) via a case-insensitive text index.
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
