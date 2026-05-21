const router = require('express').Router();
const { createOrder, getMyOrders, getOrderById,updateOrderToPaid} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',          protect, createOrder);
router.get('/myorders',   protect, getMyOrders);
router.get('/:id',        protect, getOrderById);



router.put('/:id/pay', protect, updateOrderToPaid);

module.exports = router;
