import React from 'react';
import InfoCard from './InfoCard';
import './InfoCards.css';
import { FaChartLine, FaHistory, FaLink, FaExternalLinkAlt, FaPlus } from 'react-icons/fa';

const InfoCards = ({ user, bids, totalValue }) => {
  // A bid is "won" if it's in any of the purchased or transit states.
  const wonStatuses = ['Købt', 'Købt (Mangler afhentning)', 'Købt (Mangler sendes)', 'På vej', 'På lager', 'Vundet'];
  const bidsWon = bids.filter(bid => wonStatuses.includes(bid.status)).length;
  const totalBids = bids.length;
  const winRate = totalBids > 0 ? ((bidsWon / totalBids) * 100).toFixed(0) : 0;

  // Filter for items that are purchased but not yet in stock
  const ongoingPurchases = bids.filter(bid => 
    ['Købt (Mangler afhentning)', 'Købt (Mangler sendes)', 'På vej'].includes(bid.status)
  );

  // --- Grouping Logic for Purchased Items ---
  const statusOrder = ['Købt (Mangler afhentning)', 'Købt (Mangler sendes)', 'På vej'];
  
  const statusDetails = {
    'Købt (Mangler afhentning)': { emoji: '🛍️' },
    'Købt (Mangler sendes)': { emoji: '📦' },
    'På vej': { emoji: '🚚' }
  };

  const groupedPurchases = ongoingPurchases.reduce((acc, purchase) => {
    const { status } = purchase;
    if (!acc[status]) acc[status] = [];
    acc[status].push(purchase);
    return acc;
  }, {});
  // --- End Grouping Logic ---

  return (
    <div className="info-cards-container">
      <InfoCard title="Oversigt" icon={<FaChartLine />}>
        <div className="info-item-grid">
          <div className="info-item">
            <label>Totalt antal bud</label>
            <span>{totalBids}</span>
          </div>
          <div className="info-item">
            <label>Vundne bud</label>
            <span>{bidsWon}</span>
          </div>
          <div className="info-item">
            <label>Vinderrate</label>
            <span>{winRate}%</span>
          </div>
          <div className="info-item">
            <label>Samlet værdi (vundet)</label>
            <span>{totalValue.toLocaleString('da-DK')} DKK</span>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Købt" icon={<FaHistory />}>
        <div className="activity-list">
          {ongoingPurchases.length > 0 ? (
            statusOrder.map((status, index) => {
              const items = groupedPurchases[status];
              if (!items || items.length === 0) return null;

              return (
                <div key={status} className="activity-group">
                  <div className="activity-group-header">
                    {statusDetails[status].emoji} {status}
                  </div>
                  {items.map(activity => (
                    <div key={activity._id} className="activity-item">
                      <span className="activity-name">{activity.name}</span>
                      {/* Status is now in the group header */}
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <p>Ingen igangværende køb.</p>
          )}
        </div>
      </InfoCard>

      <InfoCard title="Hurtige Links" icon={<FaLink />}>
        <a href="https://www.facebook.com/marketplace" target="_blank" rel="noopener noreferrer" className="quick-link">
          Facebook Marketplace <FaExternalLinkAlt />
        </a>
        <a href="https://phone-parts.dk/" target="_blank" rel="noopener noreferrer" className="quick-link">
          Phone-Parts.dk <FaExternalLinkAlt />
        </a>
         <button className="add-button-subtle"><FaPlus /> Tilføj nyt bud</button>
      </InfoCard>
    </div>
  );
};

export default InfoCards; 