const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { isMockRazorpay, razorpayInstance } = require('../utils/pricing');

const router = express.Router();
router.use(protect);

/**
 * POST /api/payments/razorpay/create  { orderId }
 * Returns razorpayOrderId + keyId, or { mock: true } when keys are not configured.
 */
router.post('/razorpay/create', async (req, res, next) => {
  try {
    const order = await Order.findById(req.body.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.user) !== req.user.id)
      return res.status(403).json({ message: 'Not your order' });

    if (isMockRazorpay())
      return res.json({ mock: true, message: 'No Razorpay keys configured — MOCK mode' });

    const instance = razorpayInstance();
    const rzp = await instance.orders.create({
      amount: order.total * 100,
      currency: 'INR',
      receipt: order.orderNumber,
    });

    order.razorpay.orderId = rzp.id;
    await order.save();

    res.json({ keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: rzp.id, amount: order.total });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/razorpay/verify
 * { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
router.post('/razorpay/verify', async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.user) !== req.user.id)
      return res.status(403).json({ message: 'Not your order' });

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      order.payment.status = 'Failed';
      await order.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    order.payment.status = 'Paid';
    order.razorpay.paymentId = razorpay_payment_id;
    await order.save();

    res.json({ order });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/mock/success/:orderId
 * Only allowed in MOCK mode (no Razorpay keys) — completes the E2E flow locally.
 */
router.post('/mock/success/:orderId', async (req, res, next) => {
  try {
    if (!isMockRazorpay())
      return res.status(400).json({ message: 'Mock payments are disabled when Razorpay keys exist' });

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.user) !== req.user.id)
      return res.status(403).json({ message: 'Not your order' });

    order.payment.status = 'Paid';
    order.razorpay.paymentId = 'mock_' + Date.now();
    await order.save();

    res.json({ order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
