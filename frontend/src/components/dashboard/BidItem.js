import React from 'react';
import './BidItem.css';
import { FaExternalLinkAlt, FaPen, FaTrash, FaTools, FaBatteryFull, FaMobileAlt, FaCameraRetro } from 'react-icons/fa';

const BidItem = ({ item, onClick, user, onDelete }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Købt (Mangler afhentning)':
      case 'Købt (Mangler sendes)':
        return 'status-purchased';
      case 'På vej':
        return 'status-in-transit';
      case 'På lager':
        return 'status-in-stock';
      case 'Tabt':
        return 'status-lost';
      default:
        return 'status-bidding';
    }
  };

  const getFlawIcon = (flaw) => {
    const flawLower = flaw.toLowerCase();
    if (flawLower.includes('batteri')) return <FaBatteryFull />;
    if (flawLower.includes('skærm')) return <FaMobileAlt />;
    if (flawLower.includes('kamera')) return <FaCameraRetro />;
    return <FaTools />;
  };

  const getInitials = (name) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0].slice(0, 2);
  };
  
  const renderAvatar = (bidUser) => {
    if (bidUser && bidUser.profilePicture) {
      return <img src={`/${bidUser.profilePicture}`} alt={bidUser.name} className="owner-avatar-item" />;
    }
    return (
      <div className="initials-avatar-item">
        {bidUser ? getInitials(bidUser.name) : ''}
      </div>
    );
  };

  const flaws = item.flawsAndDefects?.split(/\\n|\//).map(f => f.trim()).filter(line => line.trim() !== '') || [];

  return (
    <div className="bid-item" onClick={onClick}>
      <div className="bid-item-info" data-label="Produkt">
        <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="item-image" />
        <span className="item-name">{item.name}</span>
      </div>

      <div className="bid-item-flaws" data-label="Fejl og Mangler">
        {flaws && flaws.length > 0 ? (
          <div className="flaw-tags-container">
            {flaws.map((flaw, index) => (
              <div key={index} className="flaw-tag">
                {getFlawIcon(flaw)}
                <span>{flaw.replace('🔧', '').trim()}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="no-flaws-text-dashboard">Ingen specificerede fejl</span>
        )}
      </div>

      <div className="bid-item-details" data-label="Detaljer">
        <span className="item-bid">{item.bidAmount.toLocaleString('da-DK')} DKK</span>
        <span className={`item-status ${getStatusClass(item.status)}`}>{item.status}</span>
        
        <div className="owner-details">
          {renderAvatar(item.user)}
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="item-link" onClick={(e) => e.stopPropagation()}>
            <FaExternalLinkAlt />
          </a>
          <button className="edit-button" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <FaPen />
          </button>
          {user && user.role === 'admin' && (
              <button className="delete-button" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                  <FaTrash />
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidItem;