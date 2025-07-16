import React, { useState, useEffect } from 'react';
import api from '../api';
import './AnalyticsPage.css';
import { FaUsers, FaEye, FaShoppingCart, FaDesktop, FaMobile, FaTablet, FaChrome, FaFirefox, FaSafari, FaEdge, FaSync } from 'react-icons/fa';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      setAnalyticsData(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics data', err);
      setError('Kunne ikke indlæse analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveData = async () => {
    try {
      const res = await api.get('/analytics/live');
      setLiveData(res.data);
    } catch (err) {
      console.error('Failed to fetch live data', err);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchLiveData();

    // Set up live data refresh every 30 seconds
    const liveDataInterval = setInterval(fetchLiveData, 30000);
    
    // Set up analytics data refresh every 60 seconds
    const analyticsDataInterval = setInterval(fetchAnalyticsData, 60000);
    
    return () => {
      clearInterval(liveDataInterval);
      clearInterval(analyticsDataInterval);
    };
  }, []);

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'desktop': return <FaDesktop />;
      case 'mobile': return <FaMobile />;
      case 'tablet': return <FaTablet />;
      default: return <FaDesktop />;
    }
  };

  const getBrowserIcon = (browser) => {
    switch (browser) {
      case 'Chrome': return <FaChrome />;
      case 'Firefox': return <FaFirefox />;
      case 'Safari': return <FaSafari />;
      case 'Edge': return <FaEdge />;
      default: return <FaChrome />;
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('da-DK', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="analytics-loading">Indlæser analytics data...</div>;
  }

  if (error) {
    return <div className="analytics-error">{error}</div>;
  }

  return (
    <div className="analytics-page-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="analytics-actions">
          <button 
            onClick={() => {
              fetchAnalyticsData();
              fetchLiveData();
            }}
            className="refresh-button"
            title="Opdater data"
          >
            <FaSync />
          </button>
          <div className="analytics-tabs">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Oversigt
            </button>
            <button 
              className={`tab-button ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => setActiveTab('live')}
            >
              Live Besøgende
            </button>
            <button 
              className={`tab-button ${activeTab === 'pages' ? 'active' : ''}`}
              onClick={() => setActiveTab('pages')}
            >
              Sidevisninger
            </button>
            <button 
              className={`tab-button ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              Kurv Aktivitet
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="analytics-overview">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <FaUsers />
              </div>
              <div className="metric-content">
                <h3>Totalt Besøgende</h3>
                <p className="metric-value">{analyticsData?.totalVisitors || 0}</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <FaEye />
              </div>
              <div className="metric-content">
                <h3>Sidevisninger i Dag</h3>
                <p className="metric-value">{analyticsData?.pageViewsToday || 0}</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <FaUsers />
              </div>
              <div className="metric-content">
                <h3>Besøgende i Dag</h3>
                <p className="metric-value">{analyticsData?.visitorsToday || 0}</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <FaShoppingCart />
              </div>
              <div className="metric-content">
                <h3>Live Besøgende</h3>
                <p className="metric-value">{liveData?.activeCount || 0}</p>
              </div>
            </div>
          </div>

          {/* Country Distribution */}
          <div className="analytics-section">
            <h2>Lande</h2>
            <div className="country-distribution">
              {analyticsData?.topCountries?.map((country, index) => (
                <div key={index} className="country-item">
                  <span className="country-name">{country._id || 'Ukendt'}</span>
                  <span className="country-count">{country.count} besøgende</span>
                </div>
              ))}
            </div>
          </div>

          {/* City Distribution */}
          <div className="analytics-section">
            <h2>Byer</h2>
            <div className="city-distribution">
              {analyticsData?.topCities?.map((city, index) => (
                <div key={index} className="city-item">
                  <span className="city-name">{city._id || 'Ukendt'}</span>
                  <span className="city-count">{city.count} besøgende</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Distribution */}
          <div className="analytics-section">
            <h2>Enheder</h2>
            <div className="device-distribution">
              {analyticsData?.deviceDistribution?.map((device, index) => (
                <div key={index} className="device-item">
                  <div className="device-icon">
                    {getDeviceIcon(device._id)}
                  </div>
                  <div className="device-info">
                    <span className="device-name">{device._id}</span>
                    <span className="device-count">{device.count} besøgende</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Browser Distribution */}
          <div className="analytics-section">
            <h2>Browsere</h2>
            <div className="browser-distribution">
              {analyticsData?.browserDistribution?.map((browser, index) => (
                <div key={index} className="browser-item">
                  <div className="browser-icon">
                    {getBrowserIcon(browser._id)}
                  </div>
                  <div className="browser-info">
                    <span className="browser-name">{browser._id}</span>
                    <span className="browser-count">{browser.count} besøgende</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'live' && (
        <div className="analytics-live">
          <div className="live-header">
            <h2>Live Besøgende</h2>
            <div className="live-indicator">
              <span className="live-dot"></span>
              Live
            </div>
          </div>
          
          <div className="live-sessions">
            {liveData?.liveSessions?.length > 0 ? (
              liveData.liveSessions.map((session, index) => (
                <div key={index} className="live-session">
                  <div className="session-info">
                    <div className="session-device">
                      {getDeviceIcon(session.device)} {session.device}
                    </div>
                    <div className="session-browser">
                      {getBrowserIcon(session.browser)} {session.browser}
                    </div>
                    <div className="session-time">
                      Sidst aktiv: {formatTime(session.updatedAt)}
                    </div>
                  </div>
                  <div className="session-pages">
                    {session.pageViews?.slice(-3).map((page, pageIndex) => (
                      <div key={pageIndex} className="page-view">
                        {page.path}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p>Ingen aktive besøgende lige nu.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="analytics-pages">
          <h2>Mest Besøgte Sider</h2>
          <div className="pages-list">
            {analyticsData?.mostVisitedPages?.map((page, index) => (
              <div key={index} className="page-item">
                <div className="page-path">{page._id}</div>
                <div className="page-count">{page.count} visninger</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cart' && (
        <div className="analytics-cart">
          <h2>Kurv Aktivitet i Dag</h2>
          <div className="cart-activity">
            {analyticsData?.cartActivity?.length > 0 ? (
              analyticsData.cartActivity.map((activity, index) => (
                <div key={index} className="cart-activity-item">
                  <div className="activity-action">{activity._id}</div>
                  <div className="activity-count">{activity.count} gange</div>
                </div>
              ))
            ) : (
              <p>Ingen kurv aktivitet i dag.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage; 