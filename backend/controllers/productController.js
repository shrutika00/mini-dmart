const { Product, Category } = require('../models');
const { Op } = require('sequelize');

// Helper to map database product properties to MongoDB structure for frontend compatibility
const mapProduct = (p) => ({
  _id: p.id,
  name: p.name,
  description: p.description,
  price: p.price,
  image: p.image,
  stock: p.stock,
  isActive: p.isActive,
  createdAt: p.createdAt,
  category: p.category ? { _id: p.category.id, name: p.category.name } : null
});

// @desc    Get all active products with search & category filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { search, category, adminMode } = req.query;
    const where = {};

    // For customers, only show active products. Admins can see all.
    if (!adminMode || adminMode === 'false') {
      where.isActive = true;
    }

    // Search by product name (case-insensitive in Postgres using iLike)
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    // Filter by Category ID
    if (category) {
      where.categoryId = category;
    }

    const products = await Product.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    const mappedProducts = products.map(mapProduct);
    res.json({ success: true, count: mappedProducts.length, products: mappedProducts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: mapProduct(product) });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validation
    if (!name || !description || price === undefined || !category || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (price < 0 || stock < 0) {
      return res.status(400).json({ success: false, message: 'Price and Stock cannot be negative' });
    }

    // Verify category exists
    const categoryExists = await Category.findByPk(category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      categoryId: category,
      image: image || '',
      stock: parseInt(stock)
    });

    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });

    res.status(201).json({ success: true, product: mapProduct(fullProduct) });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock, isActive } = req.body;
    let product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate inputs if provided
    if (price !== undefined && price < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative' });
    }
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
    }

    if (category) {
      const categoryExists = await Category.findByPk(category);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      product.categoryId = category;
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (image !== undefined) product.image = image;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();
    
    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });

    res.json({ success: true, product: mapProduct(updatedProduct) });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate/Delete a product (Soft Delete)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isActive = false;
    await product.save();

    res.json({ success: true, message: 'Product deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
