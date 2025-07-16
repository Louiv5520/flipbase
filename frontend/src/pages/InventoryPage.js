import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import InventoryItem from '../components/inventory/InventoryItem';
import SparePartsTab from '../components/inventory/SparePartsTab';
import './InventoryPage.css';
import '../components/inventory/SparePartsTab.css';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'parts'

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [inventoryRes, partsRes] = await Promise.all([
        api.get('/bids/inventory/all'),
        api.get('/parts')
      ]);
      
      setInventory(inventoryRes.data);
      setParts(partsRes.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data', err);
      setError('Kunne ikke indlæse data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="inventory-page-container">
      <div className="inventory-header">
        <h1>Lagerbeholdning</h1>
        <div className="inventory-tabs">
          <button 
            className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Varer på lager
          </button>
          <button 
            className={`tab-button ${activeTab === 'parts' ? 'active' : ''}`}
            onClick={() => setActiveTab('parts')}
          >
            Reservedele
          </button>
        </div>
      </div>

      {loading && <p>Indlæser data...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && activeTab === 'items' && (
        <div className="inventory-list-container">
          <div className="inventory-list">
            {inventory.length > 0 ? (
              inventory.map(item => (
                <InventoryItem key={item._id} item={item} onDataChange={fetchData} />
              ))
            ) : (
              <p>Dit lager er tomt.</p>
            )}
          </div>
        </div>
      )}

      {!loading && !error && activeTab === 'parts' && (
        <SparePartsTab 
          parts={parts} 
          inventoryItems={inventory} 
          onDataChange={fetchData} 
        />
      )}
    </div>
  );
};

export default InventoryPage; 