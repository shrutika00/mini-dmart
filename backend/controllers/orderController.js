const { Order, OrderItem, Product, Cart, CartItem, User } = require('../models');
const { sequelize } = require('../config/db');

// Helper to map order object to Mongoose structure for frontend compatibility
const mapOrder = (o) => ({
  _id: o.id,
  totalAmount: o.totalAmount,
  fulfillmentType: o.fulfillmentType,
  deliveryAddress: o.deliveryAddress,
  pickupDate: o.pickupDate,
  pickupTime: o.pickupTime,
  status: o.status,
  createdAt: o.createdAt,
  user: o.user ? { _id: o.user.id, name: o.user.name, email: o.user.email } : null,
  items: (o.items || []).map(item => ({
    _id: item.id,
    quantity: item.quantity,
    price: item.price,
    product: item.product ? {
      _id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image
    } : null
  }))
});

// @desc    Create a new order (Checkout)
// @route   POST /api/orders
// @access  Customer
const createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { fulfillmentType, deliveryAddress, pickupDate, pickupTime } = req.body;

    if (!fulfillmentType) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Fulfillment type is required' });
    }

    // Retrieve user's cart
    const cart = await Cart.findOne({
      where: { userId: req.user.id }
    });

    if (!cart) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, as: 'product' }]
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Validate fulfillment inputs
    if (fulfillmentType === 'Home Delivery' && !deliveryAddress) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Delivery address is required for Home Delivery' });
    }
    if (fulfillmentType === 'Store Pickup' && (!pickupDate || !pickupTime)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Pickup date and time slot are required for Store Pickup' });
    }

    let totalAmount = 0;
    const itemsToCreate = [];

    // Validate stock and compute total amount
    for (const item of cartItems) {
      const product = item.product;
      if (!product || !product.isActive) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: `Product not found or unavailable` });
      }

      // Check stock
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, requested: ${item.quantity}.` 
        });
      }

      itemsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });

      totalAmount += product.price * item.quantity;
    }

    // Decrement stock in database
    for (const item of cartItems) {
      const product = item.product;
      product.stock -= item.quantity;
      await product.save({ transaction });
    }

    // Create the order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      fulfillmentType,
      deliveryAddress: fulfillmentType === 'Home Delivery' ? deliveryAddress : null,
      pickupDate: fulfillmentType === 'Store Pickup' ? pickupDate : null,
      pickupTime: fulfillmentType === 'Store Pickup' ? pickupTime : null,
      status: 'PLACED'
    }, { transaction });

    // Create order items
    for (const item of itemsToCreate) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }, { transaction });
    }

    // Clear the cart
    await CartItem.destroy({
      where: { cartId: cart.id },
      transaction
    });

    await transaction.commit();
    res.status(201).json({ success: true, order: { _id: order.id } });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// @desc    Get all orders (Customers get their own; Staff/Admin get all)
// @route   GET /api/orders
// @access  Protected
const getOrders = async (req, res, next) => {
  try {
    const where = {};

    // Customer can only view their own orders
    if (req.user.role === 'customer') {
      where.userId = req.user.id;
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const mappedOrders = orders.map(mapOrder);
    res.json({ success: true, count: mappedOrders.length, orders: mappedOrders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Protected
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image', 'description'] }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Access control: owner, staff, or admin only
    if (req.user.role === 'customer' && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order: mapOrder(order) });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Staff/Admin
const updateOrderStatus = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { status } = req.body;
    const allowedStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

    if (!status || !allowedStatuses.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Please provide a valid status' });
    }

    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Validate status logic based on fulfillmentType
    if (status === 'READY_FOR_PICKUP' && order.fulfillmentType !== 'Store Pickup') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'READY_FOR_PICKUP is only applicable for Store Pickup orders' });
    }
    if (status === 'OUT_FOR_DELIVERY' && order.fulfillmentType !== 'Home Delivery') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'OUT_FOR_DELIVERY is only applicable for Home Delivery orders' });
    }

    // If order is transitioned to CANCELLED from a non-cancelled status, revert stock
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save({ transaction });
        }
      }
    }

    order.status = status;
    await order.save({ transaction });

    await transaction.commit();
    res.json({ success: true, order: { _id: order.id, status: order.status } });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// @desc    Cancel order (Customer/Staff/Admin)
// @route   DELETE /api/orders/:id/cancel
// @access  Protected
const cancelOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Access control: Owner, Staff, Admin
    if (req.user.role === 'customer' && order.userId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Business rule: Customer cannot cancel after PLACED or CONFIRMED stage
    if (req.user.role === 'customer' && !['PLACED', 'CONFIRMED'].includes(order.status)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    // If already cancelled
    if (order.status === 'CANCELLED') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    // Revert stock
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save({ transaction });
      }
    }

    order.status = 'CANCELLED';
    await order.save({ transaction });

    await transaction.commit();
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
