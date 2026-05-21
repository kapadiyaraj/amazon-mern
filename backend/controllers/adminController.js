const asyncHandler = require('express-async-handler');
const User    = require('../models/User');
const Order   = require('../models/Order');
const Product = require('../models/Product');
const { AppError } = require('../utils/helpers');

const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalOrders, totalProducts, totalUsers, revenueResult] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenueResult[0]?.total || 0,
    },
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt');
  res.json({ success: true, orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  order.orderStatus = status;
  if (status === 'Delivered') order.deliveredAt = new Date();
  await order.save();

  res.json({ success: true, order });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json({ success: true, users });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { getDashboardStats, getAllOrders, updateOrderStatus, getAllUsers, deleteUser };
