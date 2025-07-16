const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');

// @route   GET api/customers/search
// @desc    Search for customers
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const searchRegex = new RegExp(q, 'i');
    
    const customers = await Customer.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ],
    }).limit(10); // Limit to 10 results

    res.json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 