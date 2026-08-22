const { Category } = require('../models');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    
    // Map id to _id for frontend compatibility
    const mappedCategories = categories.map(cat => ({
      _id: cat.id,
      name: cat.name,
      description: cat.description,
      createdAt: cat.createdAt
    }));

    res.json({ success: true, count: mappedCategories.length, categories: mappedCategories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const categoryExists = await Category.findOne({ where: { name } });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ name, description });
    
    res.status(201).json({
      success: true,
      category: {
        _id: category.id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    let category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // If changing name, check if new name already exists
    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({ where: { name } });
      if (categoryExists) {
        return res.status(400).json({ success: false, message: 'Category with this name already exists' });
      }
      category.name = name;
    }

    if (description !== undefined) {
      category.description = description;
    }

    await category.save();
    
    res.json({
      success: true,
      category: {
        _id: category.id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await category.destroy();
    res.json({ success: true, message: 'Category removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
