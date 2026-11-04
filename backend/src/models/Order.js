const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        qty: { type: Number, default: 1 },
      },
    ],
    itemsTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    coupon: { code: String, discountType: String },
    status: {
      type: String,
      enum: ['Placed', 'Shipped', 'Delivered', 'Refunded'],
      default: 'Placed',
    },
    payment: {
      method: { type: String, enum: ['COD', 'UPI'], required: true },
      status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    },
    address: {
      name: String,
      phone: String,
      city: String,
      pincode: String,
    },
    razorpay: {
      orderId: String,
      paymentId: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
