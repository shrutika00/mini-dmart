const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Return = sequelize.define('Return', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('return', 'exchange'),
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide a reason for return/exchange' }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    defaultValue: 'pending'
  }
});

module.exports = Return;
