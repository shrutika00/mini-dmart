const { Return, Order, User, OrderItem, Product } = require('../models');

// Helper to map return request to MongoDB structure for frontend compatibility
const mapReturn = (r) => ({
  _id: r.id,
  type: r.type,
  reason: r.reason,
  status: r.status,
  createdAt: r.createdAt,
  user: r.user ? { _id: r.user.id, name: r.user.name, email: r.user.email } : null,
  order: r.order ? {
    _id: r.order.id,
    items: (r.order.items || []).map(item => ({
      _id: item.id,
      quantity: item.quantity,
      price: item.price,
      product: item.product ? {
        _id: item.product.id,
        name: item.product.name,
        price: item.product.price
      } : null
    }))
  } : null
});

// @desc    Request a return or exchange
// @route   POST /api/returns
// @access  Customer
const createReturnRequest = async (req, res, next) => {
  try {
    const { orderId, type, reason } = req.body;

    if (!orderId || !type || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide orderId, type (return/exchange), and reason' });
    }

    if (!['return', 'exchange'].includes(type)) {
      return res.status(400).json({ success: false, message: "Type must be either 'return' or 'exchange'" });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Business rule: Can only return/exchange their own orders
    if (order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to request return for this order' });
    }

    // Business rule: Only allowed for delivered orders
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'Return/exchange is only allowed for delivered orders' });
    }

    // Business rule: Must be within 7 days
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - orderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      return res.status(400).json({ success: false, message: 'Return/exchange requests are only allowed within 7 days of order delivery/placement' });
    }

    // Check if a return request already exists for this order
    const returnExists = await Return.findOne({ where: { orderId } });
    if (returnExists) {
      return res.status(400).json({ success: false, message: 'A return or exchange request already exists for this order' });
    }

    const returnRequest = await Return.create({
      orderId,
      userId: req.user.id,
      type,
      reason,
      status: 'pending'
    });

    res.status(201).json({ success: true, returnRequest: { _id: returnRequest.id } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get return/exchange requests (Customer gets their own; Staff/Admin gets all)
// @route   GET /api/returns
// @access  Protected
const getReturnRequests = async (req, res, next) => {
  try {
    const where = {};

    if (req.user.role === 'customer') {
      where.userId = req.user.id;
    }

    const returnRequests = await Return.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: OrderItem,
              as: 'items',
              include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const mappedReturns = returnRequests.map(mapReturn);
    res.json({ success: true, count: mappedReturns.length, returnRequests: mappedReturns });
  } catch (error) {
    next(error);
  }
};

// @desc    Update return request status (Approve/Reject/Complete)
// @route   PUT /api/returns/:id/status
// @access  Staff/Admin
const updateReturnRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'approved', 'rejected', 'completed'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status' });
    }

    const returnRequest = await Return.findByPk(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    returnRequest.status = status;
    await returnRequest.save();

    res.json({ success: true, returnRequest: { _id: returnRequest.id, status: returnRequest.status } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReturnRequest,
  getReturnRequests,
  updateReturnRequestStatus
};
