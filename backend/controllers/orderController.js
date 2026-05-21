const asyncHandler = require('express-async-handler');
const Order   = require('../models/Order');
const Cart    = require('../models/Cart');
const Product = require('../models/Product');
const { AppError } = require('../utils/helpers');

const TAX_RATE      = 0.18;  // 18% GST
const SHIPPING_FREE = 500;   // free shipping above ₹500

// @desc  Create order (COD or Razorpay initiation)
// @route POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new AppError('Your cart is empty', 400);

  // Validate stock & build order items
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;
    if (product.stock < item.quantity)
      throw new AppError(`${product.name} is out of stock`, 400);

    orderItems.push({
      product:  product._id,
      name:     product.name,
      image:    product.images[0]?.url || '',
      price:    product.price,
      quantity: item.quantity,
    });

    product.stock -= item.quantity;
    product.sold  += item.quantity;
    await product.save();
  }

  const itemsPrice    = cart.totalPrice;
  const shippingPrice = itemsPrice >= SHIPPING_FREE ? 0 : 50;
  const taxPrice      = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const totalPrice    = itemsPrice + shippingPrice + taxPrice;

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: paymentMethod === 'COD' ? false : false,
  });

  // Clear cart after order placed
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalPrice: 0 });

  res.status(201).json({ success: true, order });
});

// @desc  Get my orders
// @route GET /api/orders/myorders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, orders });
});

// @desc  Get single order
// @route GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new AppError('Order not found', 404);
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    throw new AppError('Not authorized', 403);
  res.json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getOrderById };






const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid   // 👈 ADD HERE
};