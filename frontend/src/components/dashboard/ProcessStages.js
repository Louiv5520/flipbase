import React from 'react';
import StageColumn from './StageColumn';
import './ProcessStages.css';

const ProcessStages = ({ bids, onBidClick, user, onDelete }) => {
  
  const getBidsForStatus = (statuses) => {
      return bids.filter(bid => statuses.includes(bid.status));
  }

  return (
    <div className="process-stages-container">
      <StageColumn 
        title="Byder" 
        bids={getBidsForStatus(['Byder'])} 
        onBidClick={onBidClick} 
        user={user}
        onDelete={onDelete}
       />
      <StageColumn 
        title="Vundet" 
        bids={getBidsForStatus(['Vundet', 'Won'])} 
        onBidClick={onBidClick} 
        user={user}
        onDelete={onDelete}
      />
      <StageColumn 
        title="Tabt" 
        bids={getBidsForStatus(['Tabt', 'Lost'])}
        onBidClick={onBidClick} 
        user={user}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ProcessStages; 