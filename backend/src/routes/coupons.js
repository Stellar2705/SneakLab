const express = require('express');
const Coupon = require('../models/Coupon');
const { computeTotals } = require('../utils/pricing');

const router = express.Router();

/** POST /api/coupons/validate { code, itemsTotal } → preview totals (public) */
router.post('/validate', async (req, res, next) => {
  try {
    const { code, itemsTotal = 0 } = req.body;
    const couponDoc = await Coupon.findOne({ code: (code || '').toUpperCase(), isActive: true });
    if (!couponDoc) return res.status(404).json({ message: 'Invalid or expired coupon' });

    res.json({
      coupon: { code: couponDoc.code, type: couponDoc.type, value: couponDoc.value },
      ...computeTotals({ itemsTotal: Number(itemsTotal) || 0, couponDoc }),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
