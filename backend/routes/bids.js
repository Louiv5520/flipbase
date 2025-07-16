const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bid = require('../models/Bid');
const Customer = require('../models/Customer');
const Part = require('../models/Part'); // Import Part model
const PhonePart = require('../models/PhonePart');
const { check, validationResult } = require('express-validator');
const User = require('../models/User'); // Added missing import for User

// @route   GET api/bids
// @desc    Get all user's active bids (not in inventory)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const bids = await Bid.find({ company: req.user.company, status: { $ne: 'På lager' } })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bids/inventory
// @desc    Get all bids that are in inventory
// @access  Public (was Private)
router.get('/inventory', async (req, res) => {
  try {
    // This is a public route, so it doesn't have company scoping.
    // If it needs to be company-specific, it must be a private route.
    const inventoryItems = await Bid.find({ status: 'På lager', forSale: true })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.json(inventoryItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bids/inventory/all
// @desc    Get all bids that are in inventory (for admin view)
// @access  Private
router.get('/inventory/all', auth, async (req, res) => {
  try {
    const inventoryItems = await Bid.find({ company: req.user.company, status: 'På lager' })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.json(inventoryItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bids/sold
// @desc    Get all sold bids
// @access  Private
router.get('/sold', auth, async (req, res) => {
  try {
    const { search } = req.query;
    // Base query now filters by company
    const query = { company: req.user.company, status: 'Solgt' };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Find customers that match the search query
      const matchingCustomers = await Customer.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { address: searchRegex },
        ]
      }).select('_id');

      const customerIds = matchingCustomers.map(c => c._id);

      // Construct the query for Bids
      query.$or = [
        { name: searchRegex }, // Search by product name
        { customer: { $in: customerIds } } // Search by customer reference
      ];
    }

    const soldItems = await Bid.find(query)
      .populate('user', 'name profilePicture')
      .populate('customer')
      .sort({ soldDate: -1 });
    res.json(soldItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bids/:id
// @desc    Get a single bid by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('user', 'name profilePicture')
      .populate('customer');
    if (!bid) {
      return res.status(404).json({ msg: 'Bid not found' });
    }
    // Authorization check: User's company must match the bid's company
    if (bid.company !== req.user.company) {
        return res.status(401).json({ msg: 'Not authorized to view this bid' });
    }
    res.json(bid);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/bids
// @desc    Add new bid
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('bidAmount', 'Bid amount must be a number').isNumeric(),
      check('link', 'Marketplace link is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, image, bidAmount, status, link, currency, facebookDescription, flawsAndDefects, repairCost } = req.body;

    try {
      const newBid = new Bid({
        name,
        image,
        bidAmount,
        currency,
        status,
        link,
        facebookDescription,
        flawsAndDefects,
        repairCost,
        user: req.user.id,
        company: req.user.company, // Add company to the new bid
      });

      const bid = await newBid.save();
      res.json(bid);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/bids/average-price/:modelName
// @desc    Get the average sold price for a specific model
// @access  Private
router.get('/average-price/:modelName', auth, async (req, res) => {
  try {
    const modelNameRegex = new RegExp(req.params.modelName, 'i');

    const result = await Bid.aggregate([
      {
        $match: {
          company: req.user.company, // Filter by company
          name: { $regex: modelNameRegex },
          status: 'Solgt',
          soldPrice: { $exists: true, $ne: null, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          averagePrice: { $avg: '$soldPrice' }
        }
      }
    ]);

    if (result.length > 0) {
      res.json({ averagePrice: result[0].averagePrice });
    } else {
      res.json({ averagePrice: null }); // Return null if no sales data
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   PUT api/bids/:id/buyer
// @desc    Update buyer information for a bid and link/create a customer
// @access  Private
router.put('/:id/buyer', auth, async (req, res) => {
  const { buyerName, buyerPhone, buyerEmail, buyerAddress, soldDate } = req.body;

  if (!buyerName) {
    return res.status(400).json({ msg: 'Buyer name is required' });
  }

  try {
    let bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ msg: 'Bid not found' });

    // Authorization check
    if (bid.company !== req.user.company) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    let customer;
    // Try to find an existing customer by email or phone if provided
    if (buyerEmail || buyerPhone) {
      const query = [];
      if (buyerEmail) query.push({ email: buyerEmail });
      if (buyerPhone) query.push({ phone: buyerPhone });
      customer = await Customer.findOne({ $or: query });
    }

    if (customer) {
      // Update existing customer's info
      customer.name = buyerName;
      customer.address = buyerAddress;
      if (buyerEmail) customer.email = buyerEmail;
      if (buyerPhone) customer.phone = buyerPhone;
      if (!customer.bids.includes(bid._id)) {
          customer.bids.push(bid._id);
      }
      await customer.save();
    } else {
      // Create a new customer
      customer = new Customer({
        name: buyerName,
        email: buyerEmail,
        phone: buyerPhone,
        address: buyerAddress,
        bids: [bid._id]
      });
      await customer.save();
    }

    // Update the bid with the customer reference and sold date
    bid.customer = customer._id;
    if (soldDate) {
      bid.soldDate = soldDate;
    }
    await bid.save();

    const populatedBid = await Bid.findById(bid._id).populate('customer');

    res.json(populatedBid);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) { // Handle duplicate key error for email/phone
        return res.status(400).json({ msg: 'En kunde med denne email eller telefonnummer findes allerede.' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/bids/:id
// @desc    Update a bid and create parts if moved to inventory
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, image, bidAmount, status, link, currency, facebookDescription, flawsAndDefects, repairCost, soldPrice, forSale, price } = req.body;

  // Build bid object
  const bidFields = {};
  if (name !== undefined) bidFields.name = name;
  if (image !== undefined) bidFields.image = image;
  if (bidAmount !== undefined) bidFields.bidAmount = bidAmount;
  if (status !== undefined) bidFields.status = status;
  if (link !== undefined) bidFields.link = link;
  if (currency !== undefined) bidFields.currency = currency;
  if (facebookDescription !== undefined) bidFields.facebookDescription = facebookDescription;
  if (flawsAndDefects !== undefined) bidFields.flawsAndDefects = flawsAndDefects;
  if (repairCost !== undefined) bidFields.repairCost = repairCost;
  if (soldPrice !== undefined) bidFields.soldPrice = soldPrice;
  if (forSale !== undefined) bidFields.forSale = forSale;
  if (price !== undefined) bidFields.price = price;


  try {
    let bid = await Bid.findById(req.params.id);

    if (!bid) return res.status(404).json({ msg: 'Bid not found' });

    // Authorization check: User's company must match the bid's company
    if (bid.company !== req.user.company) {
      return res.status(401).json({ msg: 'Not authorized to update this bid' });
    }

    const oldStatus = bid.status;

    const updatedBid = await Bid.findByIdAndUpdate(
      req.params.id,
      { $set: bidFields },
      { new: true }
    );

    // If status changes to 'På lager', create spare parts from flaws
    if (updatedBid.status === 'På lager' && oldStatus !== 'På lager') {
      const flaws = updatedBid.flawsAndDefects?.split(/\\n|\//).map(f => f.trim()).filter(line => line.trim() !== '') || [];
      
      if (flaws.length > 0) {
        // Avoid creating duplicates if they already exist for this bid
        const existingParts = await Part.find({ orderedFor: updatedBid._id });
        const existingPartNames = existingParts.map(p => p.name.toLowerCase());

        const cleanedFlawNames = flaws
          .map(flawName => flawName.replace(/🔧/g, '').trim()) // remove all wrenches
          .filter(cleanFlawName => cleanFlawName && !existingPartNames.includes(cleanFlawName.toLowerCase()));

        if (cleanedFlawNames.length > 0) {
          const searchRegex = cleanedFlawNames.map(name => new RegExp('^' + name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i'));
          const catalogParts = await PhonePart.find({ name: { $in: searchRegex } });

          const catalogPartPriceMap = catalogParts.reduce((acc, part) => {
              acc[part.name.toLowerCase()] = part.price;
              return acc;
          }, {});

          const partsToCreate = cleanedFlawNames.map(flawName => ({
            name: flawName,
            orderedFor: updatedBid._id,
            user: updatedBid.user,
            purchasePrice: catalogPartPriceMap[flawName.toLowerCase()] || 0,
            status: 'Bestilt',
          }));

          if (partsToCreate.length > 0) {
            await Part.insertMany(partsToCreate);
          }
        }
      }
    }

    res.json(updatedBid);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/bids/:id/sell
// @desc    Mark a bid as sold
// @access  Private
router.put(
  '/:id/sell',
  [
    auth,
    [
      check('soldPrice', 'Sold price is required and must be a number').isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      let bid = await Bid.findById(req.params.id);

      if (!bid) return res.status(404).json({ msg: 'Bid not found' });

      // Authorization check: User's company must match the bid's company
      if (bid.company !== req.user.company) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      const { soldPrice } = req.body;

      bid.status = 'Solgt';
      bid.soldPrice = soldPrice;
      bid.soldDate = new Date();

      await bid.save();

      res.json(bid);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/bids/:id
// @desc    Delete a bid
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        // First, check if the user is an admin
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ msg: 'User is not authorized to delete bids' });
        }

        // Find the bid by id
        let bid = await Bid.findById(req.params.id);
        if (!bid) {
            return res.status(404).json({ msg: 'Bid not found' });
        }
        
        // Delete the bid
        await Bid.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Bid removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router; 