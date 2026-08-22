const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  fulfillmentType: {
    type: DataTypes.ENUM('Store Pickup', 'Home Delivery'),
    allowNull: false
  },
  deliveryAddress: {
    type: DataTypes.STRING,
    allowNull: true // Required only for Home Delivery (validate in controllers)
  },
  pickupDate: {
    type: DataTypes.DATEONLY,
    allowNull: true // Required only for Store Pickup
  },
  pickupTime: {
    type: DataTypes.STRING,
    allowNull: true // Required only for Store Pickup
  },
  status: {
    type: DataTypes.ENUM('PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'),
    defaultValue: 'PLACED'
  }
});

module.exports = Order;
