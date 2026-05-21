const asyncHandler = require('express-async-handler');
// const Razorpay   = require('razorpay');
const crypto     = require('crypto');
const Order      = require('../models/Order');
const { AppError } = require('../utils/helpers');

// const razorpay = new Razorpay({
//   key_id:     process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// @desc  Create Razorpay order
// @route POST /api/payment/create-order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.user.toString() !== req.user._id.toString())
    throw new AppError('Not authorized', 403);

  const razorpayOrder = await razorpay.orders.create({
    amount:   Math.round(order.totalPrice * 100),  // paise
    currency: 'INR',
    receipt:  `receipt_${order._id}`,
  });

  res.json({
    success: true,
    razorpayOrderId: razorpayOrder.id,
    amount:          razorpayOrder.amount,
    currency:        razorpayOrder.currency,
    keyId:           process.env.RAZORPAY_KEY_ID,
  });
});

// @desc  Verify payment & mark order paid
// @route POST /api/payment/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Verify signature
  const body      = razorpay_order_id + '|' + razorpay_payment_id;
  const expected  = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature)
    throw new AppError('Payment verification failed — invalid signature', 400);

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  order.isPaid         = true;
  order.paidAt         = new Date();
  order.orderStatus    = 'Processing';
  order.paymentResult  = { razorpay_order_id, razorpay_payment_id, razorpay_signature, status: 'paid' };
  await order.save();

  res.json({ success: true, message: 'Payment verified', order });
});

module.exports = { createRazorpayOrder, verifyPayment };
