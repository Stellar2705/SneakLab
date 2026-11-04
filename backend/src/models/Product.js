const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    category: { type: String, enum: ['Sneakers', 'Streetwear'], required: true },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 4.8 },
    description: { type: String, default: '' },
    colors: { type: [String], default: [] },
    sizes: { type: [mongoose.Schema.Types.Mixed], default: [] },
    isBestseller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
