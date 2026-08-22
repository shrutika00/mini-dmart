const express = require('express');
const router = express.Router();
const { User, Product, Order, Return } = require('../models');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    // Map to frontend compatibility (id to _id)
    const mappedUsers = users.map(u => ({
      _id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));

    res.json({ success: true, count: mappedUsers.length, users: mappedUsers });
  } catch (error) {
    next(error);
  }
});

// @desc    Get Admin dashboard summary statistics
// @route   GET /api/users/stats
// @access  Admin
router.get('/stats', async (req, res, next) => {
  try {
    const totalProducts = await Product.count();
    const totalUsers = await User.count();
    const totalOrders = await Order.count();
    const pendingReturns = await Return.count({ where: { status: 'pending' } });

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        pendingReturns
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
