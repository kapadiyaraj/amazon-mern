const router = require('express').Router();
const {
  getDashboardStats, getAllOrders, updateOrderStatus, getAllUsers, deleteUser,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const guard = [protect, adminOnly];

router.get('/stats',               ...guard, getDashboardStats);
router.get('/orders',              ...guard, getAllOrders);
router.put('/orders/:id/status',   ...guard, updateOrderStatus);
router.get('/users',               ...guard, getAllUsers);
router.delete('/users/:id',        ...guard, deleteUser);

module.exports = router;
