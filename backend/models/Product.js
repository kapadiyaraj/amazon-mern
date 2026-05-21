const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    description:   { type: String, required: true },
    price:         { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },          // for discount display
    category:      { type: String, required: true },
    brand:         { type: String, default: '' },
    images:        [{ url: String, public_id: String }],
    stock:         { type: Number, required: true, default: 0 },
    sold:          { type: Number, default: 0 },
    reviews:       [reviewSchema],
    rating:        { type: Number, default: 0 },
    numReviews:    { type: Number, default: 0 },
    isFeatured:    { type: Boolean, default: false },
    tags:          [String],
  },
  { timestamps: true }
);

// Full-text search index
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
