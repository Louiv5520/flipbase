import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import SoldItem from '../components/sold/SoldItem';
import './SoldItemsPage.css';
import { FaSearch } from 'react-icons/fa';

const SoldItemsPage = () => {
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSoldItems = useCallback(async (searchQuery) => {
    try {
      setLoading(true);
      const res = await api.get(`/bids/sold?search=${searchQuery}`); // Removed /api prefix
      setSoldItems(res.data);
    } catch (err) {
      console.error('Failed to fetch sold items', err);
      setError('Kunne ikke hente solgte varer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSoldItems(searchTerm);
    }, 300); // Debounce time

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchSoldItems]);

  const totalProfit = soldItems.reduce((acc, item) => {
    const totalCost = (item.bidAmount || 0) + (item.repairCost || 0);
    const profit = (item.soldPrice || 0) - totalCost;
    return acc + profit;
  }, 0);

  return (
    <div className="sold-items-page-container">
      <div className="sold-items-header">
        <h1>Salgsoversigt</h1>
        <div className="search-and-profit-container">
          <div className="search-bar-sold-items">
            <FaSearch className="search-icon" />
            <input 
              type="text"
              placeholder="Søg i solgte varer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="total-profit-display">
              Total Profit: <span>{totalProfit.toFixed(2)} kr.</span>
          </div>
        </div>
      </div>

      {loading && <p>Indlæser...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="sold-items-list-container">
          {soldItems.length > 0 ? (
            soldItems.map(item => <SoldItem key={item._id} item={item} />)
          ) : (
            <p>Du har ikke solgt nogen varer endnu.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SoldItemsPage; 