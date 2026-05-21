const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { AppError } = require('../utils/helpers');

// @desc  Get all products (with search, filter, pagination)
// @route GET /api/products?keyword=&category=&minPrice=&maxPrice=&page=&limit=
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, page = 1, limit = 12, sort } = req.query;
  const query = {};

  if (keyword) query.$text = { $search: keyword };
  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    'price-asc':   { price: 1 },
    'price-desc':  { price: -1 },
    'rating':      { rating: -1 },
    'newest':      { createdAt: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    products,
    page:       Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    total,
  });
});

// @desc  Get single product
// @route GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

// @desc  Get all categories
// @route GET /api/products/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({ success: true, categories });
});

// @desc  Create product (Admin)
// @route POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @desc  Update product (Admin)
// @route PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

// @desc  Delete product (Admin)
// @route DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, message: 'Product deleted' });
});

// @desc  Add review
// @route POST /api/products/:id/reviews
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) throw new AppError('Product already reviewed', 400);

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews;
  await product.save();

  res.status(201).json({ success: true, message: 'Review added' });
});

module.exports = { getProducts, getProductById, getCategories, createProduct, updateProduct, deleteProduct, addReview };
