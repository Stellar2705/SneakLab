const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

/**
 * GET /api/products
 * ?category=Sneakers&search=velocity&bestseller=true&sort=price_asc
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, search, bestseller, sort } = req.query;
    const q = {};

    if (category && category !== 'All') q.category = category;
    if (bestseller === 'true') q.isBestseller = true;
    if (search) q.name = { $regex: search, $options: 'i' };

    let query = Product.find(q);
    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else query = query.sort({ isBestseller: -1, createdAt: -1 });

    res.json({ products: await query.lean() });
  } catch (err) {
    next(err);
  }
});

/** GET /api/products/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch {
    res.status(404).json({ message: 'Product not found' });
  }
});

module.exports = router;
