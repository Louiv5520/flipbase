const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  // Visitor tracking
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  referrer: {
    type: String
  },
  
  // Page tracking
  pageViews: [{
    path: {
      type: String,
      required: true
    },
    title: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    timeOnPage: Number, // in seconds
    scrollDepth: Number // percentage
  }],
  
  // Cart tracking
  cartActivity: [{
    action: {
      type: String,
      enum: ['add', 'remove', 'update', 'view'],
      required: true
    },
    productId: String,
    productName: String,
    quantity: Number,
    price: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // User behavior
  events: [{
    type: {
      type: String,
      required: true
    },
    data: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Session data
  sessionStart: {
    type: Date,
    default: Date.now
  },
  sessionEnd: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Device info
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet']
  },
  browser: String,
  os: String,
  
  // Location (if available)
  country: String,
  city: String,
  region: String, // <-- tilføj region
  geo: {
    country: String,
    city: String,
    region: String
  },
  
  // Conversion tracking
  converted: {
    type: Boolean,
    default: false
  },
  conversionValue: Number,
  
  // Company association for multi-tenant
  company: {
    type: String,
    required: true,
    index: true
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
AnalyticsSchema.index({ company: 1, sessionStart: -1 });
AnalyticsSchema.index({ company: 1, isActive: 1 });
AnalyticsSchema.index({ company: 1, converted: 1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema); 