const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios'); // <-- tilføj axios

// Helper function to detect device type
const detectDevice = (userAgent) => {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return /iPad/.test(userAgent) ? 'tablet' : 'mobile';
  }
  return 'desktop';
};

// Helper function to detect browser
const detectBrowser = (userAgent) => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
};

// Helper function to detect OS
const detectOS = (userAgent) => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Other';
};

// @route   POST api/analytics/track
// @desc    Track a new analytics event
// @access  Public
router.post('/track', async (req, res) => {
  try {
    console.log('🔍 Analytics: Received tracking request');
    console.log('🔍 Analytics: Headers:', req.headers);
    console.log('🔍 Analytics: Body:', req.body);
    console.log('🔍 Analytics: IP:', req.ip || req.connection.remoteAddress);
    
    const {
      sessionId,
      visitorId,
      eventType,
      eventData,
      pagePath,
      pageTitle,
      referrer
    } = req.body;

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.ip || 
                     req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const device = detectDevice(userAgent);
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);

    // For now, use a default company - in production this would come from domain/subdomain
    const company = 'flipbase';

    // Geolocation opslag
    let geo = {};
    try {
      // Ignorer localhost og private IP-adresser
      if (ipAddress && !ipAddress.includes('127.0.0.1') && !ipAddress.includes('::1') && !ipAddress.startsWith('172.') && !ipAddress.startsWith('192.168.')) {
        console.log('🔍 Analytics: Looking up geolocation for IP:', ipAddress);
        const geoRes = await axios.get(`http://ip-api.com/json/${ipAddress}`);
        console.log('🔍 Analytics: Geolocation response:', geoRes.data);
        
        if (geoRes.data.status === 'success') {
          geo = {
            country: geoRes.data.country || '',
            city: geoRes.data.city || '',
            region: geoRes.data.regionName || ''
          };
        } else {
          geo = { country: '', city: '', region: '' };
        }
      } else {
        console.log('🔍 Analytics: Skipping geolocation for local/private IP:', ipAddress);
        geo = { country: 'Local', city: 'Local', region: 'Local' };
      }
    } catch (e) {
      console.error('❌ Analytics: Geolocation error:', e.message);
      geo = { country: '', city: '', region: '' };
    }

    console.log('🔍 Analytics: Creating/finding analytics record with geo:', geo);

    let analytics = await Analytics.findOne({ 
      sessionId, 
      company,
      isActive: true 
    });

    if (!analytics) {
      // Create new session
      console.log('🔍 Analytics: Creating new analytics session');
      analytics = new Analytics({
        sessionId: sessionId || uuidv4(),
        visitorId: visitorId || uuidv4(),
        ipAddress,
        userAgent,
        referrer,
        device,
        browser,
        os,
        company,
        geo,
        country: geo.country,
        city: geo.city,
        region: geo.region
      });
    } else {
      // Opdater geo hvis ikke sat
      if (!analytics.geo || !analytics.geo.country) {
        console.log('🔍 Analytics: Updating geo for existing session');
        analytics.geo = geo;
        analytics.country = geo.country;
        analytics.city = geo.city;
        analytics.region = geo.region;
      }
    }

    // Add page view if provided
    if (pagePath) {
      analytics.pageViews.push({
        path: pagePath,
        title: pageTitle,
        timestamp: new Date()
      });
    }

    // Add event if provided
    if (eventType) {
      analytics.events.push({
        type: eventType,
        data: eventData,
        timestamp: new Date()
      });
    }

    console.log('🔍 Analytics: Saving analytics record');
    await analytics.save();
    console.log('✅ Analytics: Analytics record saved successfully');
    res.json({ success: true, sessionId: analytics.sessionId, visitorId: analytics.visitorId });
  } catch (err) {
    console.error('❌ Analytics: Tracking error:', err);
    console.error('❌ Analytics: Error stack:', err.stack);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/analytics/cart
// @desc    Track cart activity
// @access  Public
router.post('/cart', async (req, res) => {
  try {
    const { sessionId, action, productId, productName, quantity, price } = req.body;
    const company = 'flipbase';

    let analytics = await Analytics.findOne({ 
      sessionId, 
      company,
      isActive: true 
    });

    if (!analytics) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    analytics.cartActivity.push({
      action,
      productId,
      productName,
      quantity,
      price,
      timestamp: new Date()
    });

    await analytics.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Cart tracking error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/analytics/dashboard
// @desc    Get analytics data for dashboard
// @access  Public
router.get('/dashboard', async (req, res) => {
  try {
    const company = 'flipbase'; // Use default company for now
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total visitors
    const totalVisitors = await Analytics.distinct('visitorId', { company });
    
    // Get active sessions (last 30 minutes)
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const activeSessions = await Analytics.countDocuments({
      company,
      isActive: true,
      updatedAt: { $gte: thirtyMinutesAgo }
    });

    // Get visitors today
    const visitorsToday = await Analytics.distinct('visitorId', {
      company,
      sessionStart: { $gte: oneDayAgo }
    });

    // Get visitors this week
    const visitorsThisWeek = await Analytics.distinct('visitorId', {
      company,
      sessionStart: { $gte: sevenDaysAgo }
    });

    // Get visitors this month
    const visitorsThisMonth = await Analytics.distinct('visitorId', {
      company,
      sessionStart: { $gte: thirtyDaysAgo }
    });

    // Get page views today
    const pageViewsToday = await Analytics.aggregate([
      { $match: { company, sessionStart: { $gte: oneDayAgo } } },
      { $unwind: '$pageViews' },
      { $match: { 'pageViews.timestamp': { $gte: oneDayAgo } } },
      { $count: 'total' }
    ]);

    // Get most visited pages
    const mostVisitedPages = await Analytics.aggregate([
      { $match: { company } },
      { $unwind: '$pageViews' },
      { $group: { _id: '$pageViews.path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get cart activity
    const cartActivity = await Analytics.aggregate([
      { $match: { company } },
      { $unwind: '$cartActivity' },
      { $match: { 'cartActivity.timestamp': { $gte: oneDayAgo } } },
      { $group: { _id: '$cartActivity.action', count: { $sum: 1 } } }
    ]);

    // Get device distribution
    const deviceDistribution = await Analytics.aggregate([
      { $match: { company } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get browser distribution
    const browserDistribution = await Analytics.aggregate([
      { $match: { company } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent activity
    const recentActivity = await Analytics.find({
      company,
      sessionStart: { $gte: oneDayAgo }
    })
    .sort({ sessionStart: -1 })
    .limit(20)
    .select('sessionStart pageViews cartActivity device browser');

    // Get top countries
    const topCountries = await Analytics.aggregate([
      { $match: { company } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top cities
    const topCities = await Analytics.aggregate([
      { $match: { company } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalVisitors: totalVisitors.length,
      activeSessions,
      visitorsToday: visitorsToday.length,
      visitorsThisWeek: visitorsThisWeek.length,
      visitorsThisMonth: visitorsThisMonth.length,
      pageViewsToday: pageViewsToday[0]?.total || 0,
      mostVisitedPages,
      cartActivity,
      deviceDistribution,
      browserDistribution,
      recentActivity,
      topCountries,
      topCities
    });
  } catch (err) {
    console.error('Analytics dashboard error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/analytics/live
// @desc    Get live visitor data
// @access  Public
router.get('/live', async (req, res) => {
  try {
    const company = 'flipbase'; // Use default company for now
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Get currently active sessions
    const liveSessions = await Analytics.find({
      company,
      isActive: true,
      updatedAt: { $gte: fiveMinutesAgo }
    })
    .sort({ updatedAt: -1 })
    .select('sessionId visitorId device browser pageViews cartActivity updatedAt');

    // Get real-time page views
    const livePageViews = await Analytics.aggregate([
      { $match: { company, updatedAt: { $gte: fiveMinutesAgo } } },
      { $unwind: '$pageViews' },
      { $match: { 'pageViews.timestamp': { $gte: fiveMinutesAgo } } },
      { $sort: { 'pageViews.timestamp': -1 } },
      { $limit: 50 }
    ]);

    res.json({
      liveSessions,
      livePageViews,
      activeCount: liveSessions.length
    });
  } catch (err) {
    console.error('Live analytics error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/analytics/test
// @desc    Test analytics endpoint
// @access  Public
router.get('/test', (req, res) => {
  console.log('🔍 Analytics: Test endpoint called');
  const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.headers['x-real-ip'] || 
                   req.ip || 
                   req.connection.remoteAddress;
  console.log('🔍 Analytics: IP:', ipAddress);
  console.log('🔍 Analytics: Headers:', req.headers);
  res.json({ 
    success: true, 
    message: 'Analytics test endpoint working',
    ip: ipAddress,
    userAgent: req.headers['user-agent'],
    xForwardedFor: req.headers['x-forwarded-for'],
    xRealIp: req.headers['x-real-ip']
  });
});

module.exports = router; 