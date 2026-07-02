const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file if it exists (for local development)
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const seedData = require('./seed/seedData');

// Connect to MongoDB
connectDB().then(async () => {
  // Check if DB is empty, if so auto-seed it
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database collections are empty. Auto-seeding dummy data...');
      await seedData();
    }
  } catch (err) {
    console.error(`Auto-seeding check failed: ${err.message}`);
  }
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', env: process.env.NODE_ENV || 'development' });
});

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/communities', require('./routes/communityRoutes'));
app.use('/posts', require('./routes/postRoutes'));
app.use('/profile', require('./routes/profileRoutes'));

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error.', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
