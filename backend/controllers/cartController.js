const asyncHandler = require('express-async-handler');
const Cart    = require('../models/Cart');
const Product = require('../models/Product');
const { AppError } = require('../utils/helpers');

const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock');
  res.json({ success: true, cart: cart || { items: [], totalPrice: 0 } });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);
  if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, price: product.price });
  }

  await cart.save();
  await cart.populate('items.product', 'name images price stock');
  res.json({ success: true, cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError('Cart not found', 404);

  const item = cart.items.id(req.params.itemId);
  if (!item) throw new AppError('Item not found in cart', 404);

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name images price stock');
  res.json({ success: true, cart });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError('Cart not found', 404);

  cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.json({ success: true, cart });
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalPrice: 0 });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
