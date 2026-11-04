const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

/* ---------- Stats ---------- */
/** GET /api/admin/stats */
router.get('/stats', async (_req, res, next) => {
  try {
    const [orders, products] = await Promise.all([
      Order.find().lean(),
      Product.find().lean(),
    ]);
    const paid = orders.filter((o) => o.status !== 'Refunded');
    res.json({
      stats: {
        revenue: paid.reduce((s, o) => s + o.total, 0),
        orders: orders.length,
        pending: orders.filter((o) => o.status === 'Placed').length,
        lowStock: products.filter((p) => p.stock <= 12).length,
        products: products.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

/* ---------- Orders ---------- */
/** GET /api/admin/orders */
router.get('/orders', async (_req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .lean();
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

/** PUT /api/admin/orders/:id/status  { status } */
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Placed', 'Shipped', 'Delivered', 'Refunded'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

/** PUT /api/admin/orders/:id/refund → marks order Refunded + payment Refunded */
router.put('/orders/:id/refund', async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'Refunded', 'payment.status': 'Refunded' },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Restock
    for (const it of order.items) {
      await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.qty } });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

/* ---------- Products CRUD ---------- */
/** GET /api/admin/products */
router.get('/products', async (_req, res, next) => {
  try {
    res.json({ products: await Product.find().sort({ createdAt: -1 }).lean() });
  } catch (err) {
    next(err);
  }
});

const parseProductBody = (b) => ({
  name: b.name,
  price: Number(b.price),
  mrp: Number(b.mrp ?? b.price),
  images: String(b.images || '').split(',').map((s) => s.trim()).filter(Boolean),
  category: b.category,
  stock: Number(b.stock ?? 0),
  description: b.description || '',
  colors: String(b.colors || '').split(',').map((s) => s.trim()).filter(Boolean),
  sizes: String(b.sizes || '').split(',').map((s) => s.trim()).map((s) => (isNaN(s) ? s : Number(s))).filter(Boolean),
  isBestseller: !!b.isBestseller,
});

/** POST /api/admin/products */
router.post('/products', async (req, res, next) => {
  try {
    const body = parseProductBody(req.body);
    if (!body.name || !body.price || !body.category || !body.images.length)
      return res.status(400).json({ message: 'name, price, category and images are required' });
    const product = await Product.create(body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
});

/** PUT /api/admin/products/:id */
router.put('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, parseProductBody(req.body), {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/admin/products/:id */
router.delete('/products/:id', async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ---------- Coupons ---------- */
/** GET /api/admin/coupons */
router.get('/coupons', async (_req, res, next) => {
  try {
    res.json({ coupons: await Coupon.find().sort({ createdAt: -1 }).lean() });
  } catch (err) {
    next(err);
  }
});

/** POST /api/admin/coupons { code, type, value } */
router.post('/coupons', async (req, res, next) => {
  try {
    const { code, type, value } = req.body;
    if (!code || !value)
      return res.status(400).json({ message: 'code and value are required' });
    const coupon = await Coupon.create({ code, type, value: Number(value) });
    res.status(201).json({ coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Coupon code already exists' });
    next(err);
  }
});

module.exports = router;
