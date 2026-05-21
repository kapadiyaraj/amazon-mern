const router = require('express').Router();
const {
  getProducts, getProductById, getCategories,
  createProduct, updateProduct, deleteProduct, addReview,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',             getProducts);
router.get('/categories',   getCategories);
router.get('/:id',          getProductById);
router.post('/',            protect, adminOnly, createProduct);
router.put('/:id',          protect, adminOnly, updateProduct);
router.delete('/:id',       protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
