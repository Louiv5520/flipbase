import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '../api';
import ProjectHeader from '../components/dashboard/ProjectHeader';
import InfoCards from '../components/dashboard/InfoCards';
import MarketplaceTracker from '../components/dashboard/MarketplaceTracker';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [bids, setBids] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState({ user: true, bids: true, prices: false });
  const [priceError, setPriceError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  const fetchBids = async () => {
    try {
      const res = await api.get('/bids'); // Removed /api prefix
      setBids(res.data);
    } catch (err) {
      console.error('Failed to fetch bids', err);
    } finally {
      setLoading(prev => ({ ...prev, bids: false }));
    }
  };

  const fetchPrices = async () => {
    setLoading(prev => ({ ...prev, prices: true }));
    setPriceError(null);
    try {
      const res = await api.get('/phone-parts'); // Removed /api prefix
      setPrices(res.data);
    } catch (err) {
      setPriceError('Kunne ikke hente priser.');
      console.error('Failed to fetch prices', err);
    }
    setLoading(prev => ({ ...prev, prices: false }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userRes = await api.get('/users/me'); // Removed /api prefix
          setUser(userRes.data);
        } catch (err) {
          console.error('Failed to fetch user, redirecting to login.', err);
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/login'); // Redirect to login
        }
      } else {
        navigate('/login'); // Redirect if no token
      }
      setLoading(prev => ({ ...prev, user: false }));
    };

    fetchUser();
    fetchBids();
    fetchPrices(); // Fetch prices on initial load
  }, [navigate]); // Added navigate to dependency array

  const totalWonValue = bids
    .filter(bid => bid.status === 'Won' || bid.status === 'Vundet')
    .reduce((sum, bid) => sum + bid.bidAmount, 0);

  if (loading.user || loading.bids) {
    return <div>Indlæser dashboard...</div>;
  }

  // This check might now be redundant, but good as a fallback.
  if (!user) {
    return <div>Omdirigerer til login...</div>;
  }

  return (
    <div>
      <ProjectHeader user={user} totalValue={totalWonValue} />
      <MarketplaceTracker user={user} bids={bids} refetchBids={fetchBids} prices={prices} />
      <InfoCards user={user} bids={bids} totalValue={totalWonValue} />
    </div>
  );
};

export default ProfilePage; 