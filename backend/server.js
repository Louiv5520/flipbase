const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./config/logger');
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// This is needed for express to get the client's IP address
app.set('trust proxy', true);

const MONGO_URI = process.env.MONGO_URI;

// Connect Database
connectDB();

const createAdminUser = async () => {
  try {
    let user = await User.findOne({ username: 'patrick@flipbase.dk' });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash('Sommerland7080', salt);

      user = new User({
        name: 'Patrick',
        company: 'flipbase',
        username: 'patrick@flipbase.dk',
        password: password,
        role: 'admin',
      });

      await user.save();
      console.log('Admin user created: patrick@flipbase.dk');
    } else {
      console.log('Admin user patrick@flipbase.dk already exists.');
    }
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
};

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/parts', require('./routes/parts'));
app.use('/api/scrape', require('./routes/scrape'));
app.use('/api/phone-parts', require('./routes/phone-parts'));
app.use('/api/analytics', require('./routes/analytics'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Run user creation
createAdminUser();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
}); 