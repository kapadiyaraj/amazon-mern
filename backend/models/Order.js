const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      street:   { type: String, required: true },
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      pincode:  { type: String, required: true },
      phone:    { type: String, required: true },
    },
    paymentMethod:  { type: String, enum: ['COD', 'Razorpay','UPI'], required: true },
    paymentResult: {
      razorpay_order_id:   String,
      razorpay_payment_id: String,
      razorpay_signature:  String,
      status:              String,
    },
    itemsPrice:    { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice:      { type: Number, default: 0 },
    totalPrice:    { type: Number, required: true },
    isPaid:        { type: Boolean, default: false },
    paidAt:        Date,
    orderStatus: {
      type:    String,
      enum:    ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
