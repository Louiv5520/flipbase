const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Part = require('../models/Part');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');

// @route   GET api/parts
// @desc    Get all spare parts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { partName } = req.query;
    let query = {};
    if (partName) {
      query.name = { $regex: partName, $options: 'i' };
    }

    const parts = await Part.find(query)
      .populate('orderedFor', 'name image') // Populate with Bid's name and image
      .populate('user', 'name') // Populate with User's name
      .sort({ createdAt: -1 });
    res.json(parts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/parts
// @desc    Add one or more new spare parts
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      // Validator for an array of parts
      check('parts').isArray({ min: 1 }).withMessage('Der skal være mindst én reservedel.'),
      check('parts.*.name', 'Navn på reservedel er påkrævet for alle rækker').not().isEmpty(),
      check('parts.*.purchasePrice', 'Købspris er påkrævet for alle rækker').isNumeric(),
      check('parts.*.orderedFor', 'En reference til en vare er påkrævet for alle rækker').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { parts } = req.body;

    try {
      // Add user id to each part object before insertion
      const partsWithUser = parts.map(part => ({
        ...part,
        status: 'Bestilt', // Ensure default status
        user: req.user.id,
      }));

      const createdParts = await Part.insertMany(partsWithUser);
      
      // The response from insertMany doesn't populate, so we need to find and populate them
      const populatedParts = await Part.find({ _id: { $in: createdParts.map(p => p._id) } })
        .populate('orderedFor', 'name image')
        .populate('user', 'name');
        
      res.status(201).json(populatedParts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/parts/:id
// @desc    Update a spare part
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  const { name, purchasePrice, supplier, invoiceNumber, status } = req.body;

  try {
    // Check if user is an admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'User is not authorized to update parts' });
    }

    let part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ msg: 'Reservedel ikke fundet' });
    }

    // Build part object
    const partFields = {};
    if (name !== undefined) partFields.name = name;
    if (purchasePrice !== undefined) partFields.purchasePrice = purchasePrice;
    if (supplier !== undefined) partFields.supplier = supplier;
    if (invoiceNumber !== undefined) partFields.invoiceNumber = invoiceNumber;
    if (status !== undefined) partFields.status = status;

    part = await Part.findByIdAndUpdate(
        req.params.id,
        { $set: partFields },
        { new: true }
    );
    
    const populatedPart = await Part.findById(part._id)
        .populate('orderedFor', 'name image')
        .populate('user', 'name');

    res.json(populatedPart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/parts/:id
// @desc    Delete a spare part
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is an admin
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'User is not authorized to delete parts' });
        }

        let part = await Part.findById(req.params.id);
        if (!part) {
            return res.status(404).json({ msg: 'Reservedel ikke fundet' });
        }
        
        await Part.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Reservedel slettet' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router; 