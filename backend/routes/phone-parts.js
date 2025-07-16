const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PhonePart = require('../models/PhonePart');

// @route   GET api/phone-parts
// @desc    Get all phone parts from the database, with optional search
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { name: searchRegex },
          { variant: searchRegex },
          { category: searchRegex }
        ]
      };
    }

    const parts = await PhonePart.find(query).sort({ name: 1, price: 1 });
    
    // In this case, it's better to return an empty array if nothing is found
    // so the frontend doesn't error out.
    res.json(parts);
  } catch (err) {
    console.error('Error fetching phone parts from DB:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 