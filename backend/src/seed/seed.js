/**
 * Seed helpers — imported by server.js (auto-seed when DB is empty)
 * and runnable standalone: npm run seed
 */
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const IMG = (n) => [`/products/p${n}a.jpg`, `/products/p${n}b.jpg`];
const catalog = [
  {
    name: 'Velocity Air "Midnight"',
    price: 7499, mrp: 9999, category: 'Sneakers', stock: 24, rating: 4.8, isBestseller: true,
    description: 'The Velocity Air is our flagship runner — featherweight knit upper, dual-density foam midsole and a carbon-trimmed heel counter. Built for pace, styled for the pavement.',
    colors: ['Midnight', 'Bone', 'Ember'], sizes: [7, 8, 9, 10, 11, 12],
    images: IMG(1),
  },
  {
    name: 'Court Legacy Low',
    price: 4999, mrp: 6999, category: 'Sneakers', stock: 31, rating: 4.6, isBestseller: true,
    description: 'A timeless court silhouette in premium tumbled leather. Clean lines, gum outsole, all-season attitude.',
    colors: ['Cloud White', 'Sail'], sizes: [6, 7, 8, 9, 10, 11],
    images: IMG(2),
  },
  {
    name: 'Street Runner V2',
    price: 5999, mrp: 8499, category: 'Sneakers', stock: 18, rating: 4.7,
    description: 'City-tuned traction, reflective detailing and a chunky street-ready stance. The V2 refines everything you loved about the original.',
    colors: ['Cement', 'Rust'], sizes: [7, 8, 9, 10, 12],
    images: IMG(3),
  },
  {
    name: 'Retro Wave 84',
    price: 6499, mrp: 9499, category: 'Sneakers', stock: 12, rating: 4.9, isBestseller: true,
    description: 'An ode to 1984. Suede overlays, vintage-dyed canvas and a hand-stitched collar. Limited seasonal drop.',
    colors: ['Vintage Coral', 'Sail'], sizes: [8, 9, 10, 11],
    images: IMG(4),
  },
  {
    name: 'Monolith GTX',
    price: 8999, mrp: 11999, category: 'Sneakers', stock: 9, rating: 4.5,
    description: 'Weatherproof build with a waterproof membrane, ripstop panels and rugged lugs. Built for monsoon streets and winter sidewalks.',
    colors: ['Graphite'], sizes: [7, 9, 10, 11, 12],
    images: IMG(5),
  },
  {
    name: 'SNEAKLAB Oversized Hoodie',
    price: 3499, mrp: 4999, category: 'Streetwear', stock: 40, rating: 4.8, isBestseller: true,
    description: '480 GSM heavyweight fleece with dropped shoulders and tonal lab-print embroidery. The uniform of the off-duty.',
    colors: ['Bone', 'Ink', 'Ash'], sizes: ['S', 'M', 'L', 'XL'],
    images: IMG(6),
  },
  {
    name: 'Lab Coat Crew Tee',
    price: 1999, mrp: 2799, category: 'Streetwear', stock: 55, rating: 4.7,
    description: 'Boxy heavyweight tee in combed cotton with a puff-print signature motif. Pre-washed for zero shrink.',
    colors: ['Bone', 'Ink'], sizes: ['S', 'M', 'L', 'XL'],
    images: IMG(7),
  },
  {
    name: 'Cargo Utility Jogger',
    price: 2999, mrp: 4299, category: 'Streetwear', stock: 27, rating: 4.6,
    description: 'Ripstop nylon joggers with articulated knees and six utility pockets. Tapered, technical, everywhere-ready.',
    colors: ['Olive', 'Ink'], sizes: ['S', 'M', 'L', 'XL'],
    images: IMG(8),
  },
];

const ensureAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@sneaklab.com').toLowerCase();
  const exists = await User.findOne({ email });
  if (exists) {
    if (exists.role !== 'admin') {
      exists.role = 'admin';
      await exists.save();
    }
    return { email, existed: true };
  }
  await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email,
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10),
    role: 'admin',
  });
  return { email, existed: false };
};

/** Seeds admin + catalog + coupons only when the DB is empty. Idempotent. */
exports.seedIfEmpty = async () => {
  const counts = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Coupon.countDocuments(),
  ]);
  const empty = counts.every((c) => c === 0);
  if (!empty) return false;

  const admin = await ensureAdmin();
  await Product.insertMany(catalog);
  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percent', value: 10 },
    { code: 'FLAT500', type: 'flat', value: 500 },
  ]);
  console.log(`🌱 Auto-seeded: admin ${admin.email}, ${catalog.length} products, 2 coupons`);
  return true;
};

/** Standalone runner: force-seed regardless of existing data. */
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  const { connectDB, disconnectDB } = require('../config/db');

  (async () => {
    await connectDB();
    const admin = await ensureAdmin();
    for (const p of catalog) {
      await Product.updateOne({ name: p.name }, { $set: p }, { upsert: true });
    }
    const products = await Product.find();
    await Coupon.insertMany(
      [
        { code: 'WELCOME10', type: 'percent', value: 10 },
        { code: 'FLAT500', type: 'flat', value: 500 },
      ],
      { ordered: false }
    ).catch(() => {});
    console.log(`👤 Admin ${admin.existed ? 'already present' : 'created'}: ${admin.email}`);
    console.log(`👟 Products: ${products.length} · 🎟️ Coupons: WELCOME10, FLAT500`);
    await disconnectDB();
    process.exit(0);
  })().catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  });
}
