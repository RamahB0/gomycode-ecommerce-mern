// scripts/seed.js
//
// Populates a real MongoDB database with sample products so the app has
// something to display right after deployment.
//
// Usage:
//   cp .env.example .env   # fill in MONGODB_URI
//   npm install
//   node scripts/seed.js

require('dotenv').config();
const { connectDB } = require('../src/config/db');
const Product = require('../src/models/Product');

const sampleProducts = [
  {
    name: 'Wireless Headphones',
    description: 'Over-ear Bluetooth headphones with active noise cancellation and 30h battery life.',
    price: 79.99,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/seed/headphones/400/300',
    stock: 25,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Compact 75% mechanical keyboard with hot-swappable switches and RGB backlight.',
    price: 89.99,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/seed/keyboard/400/300',
    stock: 15,
  },
  {
    name: 'Canvas Backpack',
    description: 'Water-resistant canvas backpack with a padded 15" laptop sleeve.',
    price: 45.0,
    category: 'Accessories',
    imageUrl: 'https://picsum.photos/seed/backpack/400/300',
    stock: 40,
  },
  {
    name: 'Ceramic Coffee Mug',
    description: '350ml matte-finish ceramic mug, microwave and dishwasher safe.',
    price: 12.5,
    category: 'Home',
    imageUrl: 'https://picsum.photos/seed/mug/400/300',
    stock: 100,
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight breathable running shoes with cushioned midsole.',
    price: 65.0,
    category: 'Footwear',
    imageUrl: 'https://picsum.photos/seed/shoes/400/300',
    stock: 30,
  },
  {
    name: 'Yoga Mat',
    description: '6mm non-slip yoga mat with carrying strap.',
    price: 24.99,
    category: 'Fitness',
    imageUrl: 'https://picsum.photos/seed/yogamat/400/300',
    stock: 50,
  },
];

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Set MONGODB_URI (see .env.example) before running the seed script.');
    process.exit(1);
  }
  await connectDB(process.env.MONGODB_URI);
  await Product.deleteMany({});
  const created = await Product.insertMany(sampleProducts);
  console.log(`Seeded ${created.length} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
