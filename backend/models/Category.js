const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: 'Category name must be unique' },
    validate: {
      notEmpty: { msg: 'Please add a category name' }
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Category;
