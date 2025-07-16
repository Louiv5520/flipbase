const mongoose = require('mongoose');

const PhonePartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  variant: {
    type: String,
    trim: true,
    default: 'Standard'
  },
  notes: {
    type: String,
    trim: true
  },
  inStock: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('PhonePart', PhonePartSchema); 