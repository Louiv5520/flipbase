const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  // We can't use process.exit(1) here as it would stop the whole server.
  // Instead, we should make sure any route that needs it reports an error.
}

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, password, name, company } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      company,
      username,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.send('User registered');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Find user by email first, then fall back to username
    let user = await User.findOne({ email: username });
    if (!user) {
      user = await User.findOne({ username: username });
    }

    if (!user) {
      return res.status(400).json({ msg: 'Ugyldige loginoplysninger' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Ugyldige loginoplysninger' });
    }
    
    // Check for JWT_SECRET before signing
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined, cannot sign token.');
        return res.status(500).send('Server configuration error.');
    }

    // Hotfix for bad data: Ensure user document has an email before saving.
    // The login 'username' can be an email. If the found user lacks an email, set it.
    if (!user.email && username.includes('@')) {
      user.email = username;
    }

    // Update login info
    user.lastLoginDate = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 