const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken, AppError } = require('../utils/helpers');

// @desc  Register new user
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    throw new AppError('Please provide all fields', 400);

  const exists = await User.findOne({ email });
  if (exists) throw new AppError('Email already registered', 400);

  const user = await User.create({ name, email, password });
  res.status(201).json({
    success: true,
    token: generateToken(user._id, user.role),
    user:  { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc  Login user
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password required', 400);

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    throw new AppError('Invalid credentials', 401);

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user:  { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc  Get current user profile
// @route GET /api/auth/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
});

// @desc  Update profile
// @route PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name  = req.body.name  || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();
  res.json({
    success: true,
    token: generateToken(updated._id, updated.role),
    user:  { _id: updated._id, name: updated.name, email: updated.email, role: updated.role },
  });
});

module.exports = { register, login, getProfile, updateProfile };
