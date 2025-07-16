const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents to have a null email
  },
  phone: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents to have a null phone
  },
  address: {
    type: String,
  },
  // We can link back to all bids/purchases from this customer
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  }],
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema); 