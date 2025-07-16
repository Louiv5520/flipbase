import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SoldItem.css';
import { FaTools, FaBatteryFull, FaMobileAlt, FaCameraRetro } from 'react-icons/fa';

const SoldItem = ({ item }) => {
  const totalCost = (item.bidAmount || 0) + (item.repairCost || 0);
  const profit = (item.soldPrice || 0) - totalCost;
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('da-DK', options);
  };

  const handleCardClick = () => {
    navigate(`/sold/${item._id}`);
  };

  const getFlawIcon = (flaw) => {
    const flawLower = flaw.toLowerCase();
    if (flawLower.includes('batteri')) return <FaBatteryFull />;
    if (flawLower.includes('skærm')) return <FaMobileAlt />;
    if (flawLower.includes('kamera')) return <FaCameraRetro />;
    return <FaTools />;
  };

  const flaws = item.flawsAndDefects?.split(/\\n|\//).map(f => f.trim()).filter(line => line.trim() !== '') || [];

  return (
    <div className="sold-item-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="sold-item-main-content">
        <div className="sold-item-product-info">
          <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="sold-item-image" />
          <div className="sold-item-name-date">
              <span className="sold-item-name">{item.name}</span>
              <span className="sold-item-date">Solgt d. {formatDate(item.soldDate)}</span>
          </div>
        </div>
        <div className="sold-item-actors">
          <div className="actor-item">
            <span className="actor-label">Solgt til</span>
            <span className="actor-name">{item.customer ? item.customer.name : 'N/A'}</span>
          </div>
        </div>
        <div className="sold-item-flaws">
          {flaws.length > 0 ? (
            <div className="flaw-tags-container">
              {flaws.map((flaw, index) => (
                <div key={index} className="flaw-tag">
                  {getFlawIcon(flaw)}
                  <span>{flaw.replace('🔧', '').trim()}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="no-flaws-text">Ingen specificerede fejl</span>
          )}
        </div>
      </div>
      <div className="sold-item-financials">
        <div className="financial-item">
          <span className="financial-label">Indkøb</span>
          <span className="financial-value">{item.bidAmount.toFixed(2)} kr.</span>
        </div>
         <div className="financial-item">
          <span className="financial-label">Dele</span>
          <span className="financial-value">{item.repairCost.toFixed(2)} kr.</span>
        </div>
        <div className="financial-item">
          <span className="financial-label">Salgspris</span>
          <span className="financial-value sold-price">{item.soldPrice.toFixed(2)} kr.</span>
        </div>
        <div className="financial-item profit">
          <span className="financial-label">Profit</span>
          <span className={`financial-value ${profit >= 0 ? 'positive-profit' : 'negative-profit'}`}>
            {profit.toFixed(2)} kr.
          </span>
        </div>
        {item.user && item.user.profilePicture ? (
          <img
            src={`http://localhost:5000/${item.user.profilePicture}`}
            alt={item.user.name}
            title={item.user.name} 
            className="actor-profile-picture"
          />
        ) : (
          <div className="actor-profile-placeholder" />
        )}
      </div>
    </div>
  );
};

export default SoldItem; 