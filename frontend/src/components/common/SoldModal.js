import React, { useState } from 'react';
import Modal from './Modal';
import './SoldModal.css';

const SoldModal = ({ isOpen, onClose, onConfirm, item }) => {
  const [soldPrice, setSoldPrice] = useState('');

  const handleConfirm = () => {
    if (!soldPrice || isNaN(soldPrice) || Number(soldPrice) <= 0) {
      alert('Indtast venligst en gyldig salgspris.');
      return;
    }
    onConfirm(item._id, soldPrice);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="sold-modal-container">
        <h2>Sælg vare</h2>
        <p>Indtast salgsprisen for <strong>{item?.name}</strong>.</p>
        
        <div className="form-group">
          <label htmlFor="soldPrice">Salgspris (DKK)</label>
          <input
            type="number"
            id="soldPrice"
            value={soldPrice}
            onChange={(e) => setSoldPrice(e.target.value)}
            placeholder="f.eks. 1500"
            autoFocus
          />
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>Annuller</button>
          <button className="confirm-button" onClick={handleConfirm}>Bekræft Salg</button>
        </div>
      </div>
    </Modal>
  );
};

export default SoldModal; 