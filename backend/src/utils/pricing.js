/**
 * Shared pricing — authoritative totals computed server-side.
 * (kept here so orders & coupon validation stay in sync)
 */
const FREE_SHIP_THRESHOLD = 3000;
const SHIP_FEE = 149;

exports.computeTotals = ({ itemsTotal, couponDoc }) => {
  let discount = 0;
  if (couponDoc) {
    discount =
      couponDoc.type === 'percent'
        ? Math.round((itemsTotal * couponDoc.value) / 100)
        : Math.min(couponDoc.value, itemsTotal);
  }
  const afterDiscount = itemsTotal - discount;
  const shipping = afterDiscount >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FEE;
  return { itemsTotal, discount, shipping, total: afterDiscount + shipping };
};

exports.isMockRazorpay = () => !process.env.RAZORPAY_KEY_ID;

exports.razorpayInstance = () => {
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

exports.nextOrderNumber = () =>
  'SL-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10);
