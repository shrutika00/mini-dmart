const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem
} = require('../controllers/cartController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('customer'));

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/:productId')
  .put(updateCartItemQuantity)
  .delete(removeCartItem);

module.exports = router;
