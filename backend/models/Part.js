const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  supplier: {
    type: String,
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  invoiceNumber: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Bestilt', 'På lager', 'Brugt'],
    default: 'Bestilt',
  },
  // The phone/bid this part was ordered for
  orderedFor: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    required: true,
  },
  // Who ordered this part?
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Part', PartSchema); 