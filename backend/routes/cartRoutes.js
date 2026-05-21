// ── cartRoutes.js ──────────────────────────────────────
const cartRouter = require('express').Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

cartRouter.get('/',                  protect, getCart);
cartRouter.post('/',                 protect, addToCart);
cartRouter.put('/items/:itemId',     protect, updateCartItem);
cartRouter.delete('/items/:itemId',  protect, removeFromCart);
cartRouter.delete('/',               protect, clearCart);

module.exports = cartRouter;
