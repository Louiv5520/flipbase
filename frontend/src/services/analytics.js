import api from '../api';

class AnalyticsService {
  constructor() {
    this.sessionId = this.getSessionId();
    this.visitorId = this.getVisitorId();
    this.isTracking = false;
    console.log('AnalyticsService initialized:', { sessionId: this.sessionId, visitorId: this.visitorId });
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  getVisitorId() {
    let visitorId = localStorage.getItem('analytics_visitor_id');
    if (!visitorId) {
      visitorId = this.generateId();
      localStorage.setItem('analytics_visitor_id', visitorId);
    }
    return visitorId;
  }

  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async trackPageView(path, title) {
    if (this.isTracking) return;
    
    try {
      this.isTracking = true;
      console.log('🔍 Analytics: Tracking page view:', { path, title, sessionId: this.sessionId, visitorId: this.visitorId });
      
      const payload = {
        sessionId: this.sessionId,
        visitorId: this.visitorId,
        pagePath: path,
        pageTitle: title,
        referrer: document.referrer
      };
      
      console.log('🔍 Analytics: Sending payload:', payload);
      
      const response = await api.post('/analytics/track', payload);
      
      console.log('✅ Analytics: Page view tracked successfully:', response.data);
    } catch (error) {
      console.error('❌ Analytics: Failed to track page view:', error);
      console.error('❌ Analytics: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
    } finally {
      this.isTracking = false;
    }
  }

  async trackEvent(eventType, eventData = {}) {
    try {
      console.log('Tracking event:', { eventType, eventData });
      
      const response = await api.post('/analytics/track', {
        sessionId: this.sessionId,
        visitorId: this.visitorId,
        eventType,
        eventData
      });
      
      console.log('Event tracked successfully:', response.data);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async trackCartActivity(action, productId, productName, quantity, price) {
    try {
      console.log('Tracking cart activity:', { action, productId, productName, quantity, price });
      
      const response = await api.post('/analytics/cart', {
        sessionId: this.sessionId,
        action,
        productId,
        productName,
        quantity,
        price
      });
      
      console.log('Cart activity tracked successfully:', response.data);
    } catch (error) {
      console.error('Failed to track cart activity:', error);
    }
  }

  // Track when user adds item to cart
  trackAddToCart(item) {
    this.trackCartActivity('add', item._id, item.name, 1, item.soldPrice);
  }

  // Track when user removes item from cart
  trackRemoveFromCart(item) {
    this.trackCartActivity('remove', item._id, item.name, 1, item.soldPrice);
  }

  // Track when user updates cart quantity
  trackUpdateCart(item, quantity) {
    this.trackCartActivity('update', item._id, item.name, quantity, item.soldPrice);
  }

  // Track when user views cart
  trackViewCart() {
    this.trackCartActivity('view', null, 'Cart View', 1, 0);
  }

  // Track button clicks
  trackButtonClick(buttonName, location) {
    this.trackEvent('button_click', {
      button: buttonName,
      location: location
    });
  }

  // Track form submissions
  trackFormSubmission(formName) {
    this.trackEvent('form_submission', {
      form: formName
    });
  }

  // Track search queries
  trackSearch(query) {
    this.trackEvent('search', {
      query: query
    });
  }

  // Track scroll depth
  trackScrollDepth(depth) {
    this.trackEvent('scroll_depth', {
      depth: depth
    });
  }

  // Track time on page
  trackTimeOnPage(timeInSeconds) {
    this.trackEvent('time_on_page', {
      time: timeInSeconds
    });
  }

  // Test function to debug analytics
  async testAnalytics() {
    try {
      console.log('🔍 Analytics: Testing analytics service');
      const response = await api.get('/analytics/test');
      console.log('✅ Analytics: Test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Analytics: Test failed:', error);
      return null;
    }
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService; 