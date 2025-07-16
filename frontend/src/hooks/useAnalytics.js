import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService from '../services/analytics';

export const useAnalytics = () => {
  const location = useLocation();
  const startTime = useRef(Date.now());
  const scrollDepth = useRef(0);

  useEffect(() => {
    // Track page view when location changes
    analyticsService.trackPageView(location.pathname, document.title);

    // Reset start time for new page
    startTime.current = Date.now();
    scrollDepth.current = 0;

    // Track scroll depth
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent > scrollDepth.current) {
        scrollDepth.current = scrollPercent;
        // Track scroll depth at 25%, 50%, 75%, 100%
        if ([25, 50, 75, 100].includes(scrollPercent)) {
          analyticsService.trackScrollDepth(scrollPercent);
        }
      }
    };

    // Track time on page when leaving
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime.current) / 1000);
      if (timeOnPage > 5) { // Only track if user spent more than 5 seconds
        analyticsService.trackTimeOnPage(timeOnPage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Track time on page when component unmounts
      const timeOnPage = Math.round((Date.now() - startTime.current) / 1000);
      if (timeOnPage > 5) {
        analyticsService.trackTimeOnPage(timeOnPage);
      }
    };
  }, [location]);

  return {
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackButtonClick: analyticsService.trackButtonClick.bind(analyticsService),
    trackFormSubmission: analyticsService.trackFormSubmission.bind(analyticsService),
    trackSearch: analyticsService.trackSearch.bind(analyticsService)
  };
}; 