const { Cart, CartItem, Product } = require('../models');

// Helper to load Cart with items populated
const getPopulatedCart = async (userId) => {
  const [cart] = await Cart.findOrCreate({
    where: { userId }
  });

  const fullCart = await Cart.findByPk(cart.id, {
    include: [
      {
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image', 'stock', 'isActive'] }]
      }
    ]
  });

  // Map to Mongoose format for frontend compatibility
  const mappedItems = (fullCart.items || []).map(item => ({
    _id: item.id,
    quantity: item.quantity,
    product: item.product ? {
      _id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      stock: item.product.stock,
      isActive: item.product.isActive
    } : null
  }));

  return {
    _id: fullCart.id,
    user: fullCart.userId,
    items: mappedItems
  };
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Customer
const getCart = async (req, res, next) => {
  try {
    const cart = await getPopulatedCart(req.user.id);
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Customer
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const addQuantity = quantity ? parseInt(quantity) : 1;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    if (addQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    // Verify product exists and is active
    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or inactive' });
    }

    const [cart] = await Cart.findOrCreate({ where: { userId: req.user.id } });

    // Check if CartItem already exists
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId }
    });

    let currentQtyInCart = 0;
    if (cartItem) {
      currentQtyInCart = cartItem.quantity;
    }

    const targetQty = currentQtyInCart + addQuantity;

    // Business Logic: Check stock
    if (targetQty > product.stock) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot add more items. Only ${product.stock} units available in stock.` 
      });
    }

    if (cartItem) {
      cartItem.quantity = targetQty;
      await cartItem.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity: addQuantity
      });
    }

    const updatedCart = await getPopulatedCart(req.user.id);
    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of product in cart (set exact value)
// @route   PUT /api/cart/:productId
// @access  Customer
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const targetQty = parseInt(quantity);

    if (isNaN(targetQty) || targetQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    // Verify product exists
    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check stock limit
    if (targetQty > product.stock) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot set quantity to ${targetQty}. Only ${product.stock} units available in stock.` 
      });
    }

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId }
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }

    cartItem.quantity = targetQty;
    await cartItem.save();

    const updatedCart = await getPopulatedCart(req.user.id);
    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Customer
const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    await CartItem.destroy({
      where: { cartId: cart.id, productId }
    });

    const updatedCart = await getPopulatedCart(req.user.id);
    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem
};
