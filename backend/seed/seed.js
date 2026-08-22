require('dotenv').config({ path: __dirname + '/../.env' });
const { sequelize } = require('../config/db');
const { User, Category, Product, Cart, CartItem, Order, OrderItem, Return } = require('../models');

// Realistic Grocery Categories
const categoriesData = [
  { name: 'Fruits', description: 'Fresh seasonal fruits' },
  { name: 'Vegetables', description: 'Fresh green and root vegetables' },
  { name: 'Dairy', description: 'Milk, cheese, butter, and yogurt' },
  { name: 'Beverages', description: 'Soft drinks, juices, tea, and coffee' },
  { name: 'Snacks', description: 'Chips, biscuits, chocolates, and cookies' },
  { name: 'Household', description: 'Cleaning supplies and home care items' }
];

// Sample Grocery Products
const productsData = [
  // Fruits
  {
    name: 'Fresh Red Apples',
    description: 'Crisp and sweet fresh red apples, imported. Rich in fiber.',
    price: 120,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
    stock: 50,
    isActive: true
  },
  {
    name: 'Organic Bananas',
    description: 'Fresh organic yellow bananas, rich in potassium.',
    price: 60,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
    stock: 100,
    isActive: true
  },
  // Vegetables
  {
    name: 'Roma Tomatoes',
    description: 'Fresh red roma tomatoes, perfect for cooking or salads.',
    price: 40,
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&q=80',
    stock: 80,
    isActive: true
  },
  {
    name: 'Organic Potatoes',
    description: 'Fresh brown potatoes, ideal for baking or boiling.',
    price: 30,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
    stock: 120,
    isActive: true
  },
  // Dairy
  {
    name: 'Full Cream Milk 1L',
    description: 'Pasteurized full cream cow milk. Fresh and nutritious.',
    price: 70,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
    stock: 40,
    isActive: true
  },
  {
    name: 'Salted Butter 500g',
    description: 'Premium quality salted butter, perfect for baking and cooking.',
    price: 250,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
    stock: 30,
    isActive: true
  },
  {
    name: 'Cheddar Cheese 200g',
    description: 'Sharp cheddar cheese block, aged to perfection.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1486887396153-fa416525c108?w=400&q=80',
    stock: 25,
    isActive: true
  },
  // Beverages
  {
    name: 'Orange Juice 1L',
    description: '100% pure squeezed orange juice, no added sugar.',
    price: 110,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80',
    stock: 35,
    isActive: true
  },
  {
    name: 'Sparkling Cola 500ml',
    description: 'Refreshing carbonated sparkling cola drink.',
    price: 45,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
    stock: 150,
    isActive: true
  },
  // Snacks
  {
    name: 'Classic Potato Chips',
    description: 'Salted potato chips, crispy and delicious.',
    price: 50,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
    stock: 90,
    isActive: true
  },
  {
    name: 'Dark Chocolate Bar',
    description: '70% cocoa rich dark chocolate, premium quality.',
    price: 90,
    image: 'https://images.unsplash.com/photo-1549007994-cb92ca8a3bd6?w=400&q=80',
    stock: 60,
    isActive: true
  },
  // Household
  {
    name: 'Liquid Dish Soap 500ml',
    description: 'Tough on grease, gentle on hands. Fresh lemon scent.',
    price: 85,
    image: 'https://images.unsplash.com/photo-1607006342411-92fc0a414b62?w=400&q=80',
    stock: 45,
    isActive: true
  },
  {
    name: 'Laundry Detergent 1.5kg',
    description: 'Deep cleaning powder detergent for front and top load machines.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&q=80',
    stock: 20,
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database.');

    // Force sync drops existing tables and recreates them
    console.log('Synchronizing database schema (forcing drop and recreate)...');
    await sequelize.sync({ force: true });
    console.log('Tables drop & recreate synced successfully.');

    // 1. Seed Users (trigger hooks to hash passwords)
    console.log('Seeding Users (Development Credentials Only)...');
    const createdUsers = await User.bulkCreate([
      {
        name: 'DMart Admin',
        email: 'admin@minidmart.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'DMart Staff Member',
        email: 'staff@minidmart.com',
        password: 'staff123',
        role: 'staff'
      },
      {
        name: 'John Doe',
        email: 'customer1@gmail.com',
        password: 'customer123',
        role: 'customer'
      },
      {
        name: 'Jane Smith',
        email: 'customer2@gmail.com',
        password: 'customer123',
        role: 'customer'
      }
    ], { individualHooks: true });
    console.log('Users seeded.');

    // Create carts for the seeded customers
    for (const u of createdUsers) {
      if (u.role === 'customer') {
        await Cart.create({ userId: u.id });
      }
    }
    console.log('Carts initialized for customers.');

    // 2. Seed Categories
    console.log('Seeding Categories...');
    const createdCategories = await Category.bulkCreate(categoriesData);
    console.log(`${createdCategories.length} categories seeded.`);

    // Map category name to its ID
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // 3. Seed Products
    console.log('Seeding Products...');
    const productsToSeed = productsData.map(product => {
      let catName = 'Household'; // Default fallback
      if (product.name.includes('Apple') || product.name.includes('Banana')) {
        catName = 'Fruits';
      } else if (product.name.includes('Tomato') || product.name.includes('Potato') && !product.name.includes('Chips')) {
        catName = 'Vegetables';
      } else if (product.name.includes('Milk') || product.name.includes('Butter') || product.name.includes('Cheese')) {
        catName = 'Dairy';
      } else if (product.name.includes('Juice') || product.name.includes('Cola')) {
        catName = 'Beverages';
      } else if (product.name.includes('Chips') || product.name.includes('Chocolate')) {
        catName = 'Snacks';
      }

      return {
        ...product,
        categoryId: categoryMap[catName]
      };
    });

    const createdProducts = await Product.bulkCreate(productsToSeed);
    console.log(`${createdProducts.length} products seeded successfully.`);

    console.log('Database Seeding Complete!');
    console.log('Admin Email: admin@minidmart.com (Pass: admin123)');
    console.log('Staff Email: staff@minidmart.com (Pass: staff123)');
    console.log('Customer 1: customer1@gmail.com (Pass: customer123)');
    console.log('Customer 2: customer2@gmail.com (Pass: customer123)');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
