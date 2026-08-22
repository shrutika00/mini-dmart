require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, sequelize } = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// CORS dynamic configuration based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(helmet());
app.use(express.json());

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Production Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: "Mini D-Mart API is running"
  });
});

// Basic check route (root)
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Mini D-Mart Postgres API is running' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to database and sync tables, then start listening
connectDB().then(async () => {
  try {
    // Explicitly lock sync to force=false, alter=false to protect production database
    await sequelize.sync({ force: false, alter: false }); 
    console.log('PostgreSQL Tables Synchronized Successfully');
    
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
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
