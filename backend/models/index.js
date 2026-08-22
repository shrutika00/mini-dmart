const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Return = require('./Return');

// --- Setup Associations ---

// User <-> Cart
User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// Cart <-> CartItem
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

// Product <-> CartItem
Product.hasMany(CartItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'RESTRICT' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'RESTRICT' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order <-> Return
Order.hasOne(Return, { foreignKey: 'orderId', onDelete: 'CASCADE' });
Return.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User <-> Return
User.hasMany(Return, { foreignKey: 'userId', onDelete: 'CASCADE' });
Return.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Return
};
