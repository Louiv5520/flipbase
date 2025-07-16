const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  bidAmount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'DKK'
  },
  status: {
    type: String,
    enum: ['Byder', 'Købt (Mangler afhentning)', 'Købt (Mangler sendes)', 'På vej', 'På lager', 'Tabt', 'Solgt'],
    default: 'Byder',
  },
  facebookDescription: {
    type: String,
    default: '',
  },
  flawsAndDefects: {
    type: String,
    default: '',
  },
  storageGB: {
    type: Number,
  },
  batteryHealth: {
    type: Number,
  },
  repairCost: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    default: 0,
  },
  soldPrice: {
    type: Number,
    default: null,
  },
  forSale: {
    type: Boolean,
    default: false,
  },
  soldDate: {
    type: Date,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  link: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  company: {
    type: String,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Bid', BidSchema); 