import React from 'react';
import './InfoCard.css';

const InfoCard = ({ title, icon, children }) => {
  return (
    <div className="info-card">
      <div className="info-card-header">
        {icon && <span className="info-card-icon">{icon}</span>}
        <h3 className="info-card-title">{title}</h3>
      </div>
      <div className="info-card-content">
        {children}
      </div>
    </div>
  );
};

export default InfoCard; 