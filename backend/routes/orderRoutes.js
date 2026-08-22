const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(authorize('customer'), createOrder)
  .get(getOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(authorize('staff', 'admin'), updateOrderStatus);

router.route('/:id/cancel')
  .delete(cancelOrder);

module.exports = router;
