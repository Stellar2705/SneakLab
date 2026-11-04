const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');
const { computeTotals, isMockRazorpay, nextOrderNumber } = require('../utils/pricing');

const router = express.Router();
router.use(protect);

/** Helper: price items authoritatively from DB */
async function priceItems(rawItems) {
  const cleaned = (rawItems || [])
    .map((i) => ({ productId: String(i.productId || i.product || ''), qty: Math.max(1, Number(i.qty) || 1) }))
    .filter((i) => i.productId);

  if (!cleaned.length) throw Object.assign(new Error('Cart is empty'), { statusCode: 400 });

  const ids = cleaned.map((i) => i.productId);
  const docs = await Product.find({ _id: { $in: ids } });
  const map = new Map(docs.map((d) => [String(d._id), d]));

  const items = [];
  let itemsTotal = 0;
  for (const { productId, qty } of cleaned) {
    const p = map.get(productId);
    if (!p) throw Object.assign(new Error(`Product no longer available`), { statusCode: 400 });
    if (p.stock < qty)
      throw Object.assign(new Error(`${p.name} has only ${p.stock} left in stock`), { statusCode: 400 });
    items.push({ product: p._id, name: p.name, price: p.price, qty });
    itemsTotal += p.price * qty;
  }
  return { items, itemsTotal };
}

/**
 * POST /api/orders
 * { items: [{productId, qty}], address:{name,phone,city,pincode}, method:'COD'|'UPI', couponCode? }
 */
router.post('/', async (req, res, next) => {
  try {
    const { items, address, method = 'COD', couponCode } = req.body;

    if (!address?.name || !address?.phone || !address?.city || !address?.pincode)
      return res.status(400).json({ message: 'Full delivery address is required' });
    if (method !== 'COD' && method !== 'UPI')
      return res.status(400).json({ message: 'Invalid payment method' });

    const priced = await priceItems(items);

    let couponDoc = null;
    if (couponCode) {
      couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!couponDoc) return res.status(400).json({ message: 'Invalid or expired coupon' });
    }

    const totals = computeTotals({ itemsTotal: priced.itemsTotal, couponDoc });

    // Decrement stock
    for (const it of priced.items) {
      await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.qty } });
    }

    const order = await Order.create({
      orderNumber: nextOrderNumber(),
      user: req.user.id,
      items: priced.items,
      ...totals,
      coupon: couponDoc ? { code: couponDoc.code, discountType: couponDoc.type } : undefined,
      status: 'Placed',
      payment: { method, status: method === 'COD' ? 'Pending' : 'Failed' },
      address,
    });

    res.status(201).json({
      order,
      paymentMode: method === 'COD' ? 'cod' : isMockRazorpay() ? 'mock' : 'razorpay',
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/orders/mine */
router.get('/mine', async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

/** GET /api/orders/:id (owner or admin) */
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.user) !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not your order' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
