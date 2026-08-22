require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, sequelize } = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Basic health check route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Mini D-Mart Postgres API is running' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to database and sync tables, then start listening
connectDB().then(async () => {
  try {
    await sequelize.sync(); // Auto-create tables in local PostgreSQL
    console.log('PostgreSQL Tables Synchronized Successfully');
    
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.error(`Error: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (syncError) {
    console.error(`Error syncing database: ${syncError.message}`);
    process.exit(1);
  }
});
