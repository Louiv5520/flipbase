import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import PriceLookupModal from './PriceLookupModal';
import { averageSalePrices } from '../../config/salePrices';
import api from '../../api'; // Make sure api is imported
import './MarketplaceTracker.css';
import { FaTrash } from 'react-icons/fa';

const BidDetailModal = ({ isOpen, onClose, bid, onSave, onDelete, allPrices, user }) => {
  const [formData, setFormData] = useState(null);
  const [isPriceLookupOpen, setPriceLookupOpen] = useState(false);
  const [suggestedSalePrice, setSuggestedSalePrice] = useState(null);

  useEffect(() => {
    const initialData = {
        facebookDescription: '',
        flawsAndDefects: '',
        repairCost: 0,
        storageGB: '',
        batteryHealth: '',
        soldPrice: '', // Initialize soldPrice
        ...bid
    };
    setFormData(initialData);
  }, [bid]);

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectParts = (parts) => {
    if (!parts || parts.length === 0) return;

    // Calculate total cost
    const totalCostOfSelectedParts = parts.reduce((sum, part) => sum + part.price, 0);
    // Create description string with emoji and one part per line
    const partsDescription = parts.map(part => `🔧 ${part.name}`).join('\n');

    // Get existing values
    const currentRepairCost = Number(formData.repairCost) || 0;
    const existingDefects = formData.flawsAndDefects || '';

    // Create new values
    const newRepairCost = currentRepairCost + totalCostOfSelectedParts;
    const newDefects = existingDefects 
        ? `${existingDefects}\n${partsDescription}` 
        : partsDescription;

    setFormData({ 
        ...formData, 
        repairCost: newRepairCost,
        flawsAndDefects: newDefects
    });
    setPriceLookupOpen(false);
  };

  const handleSuggestSalePrice = async () => {
    const modelKey = formData.name.toLowerCase().trim();
    if (!modelKey) return;

    try {
      // First, try to get the dynamic average price
      const res = await api.get(`/bids/average-price/${modelKey}`);
      let suggestedPrice = res.data.averagePrice;

      // If no dynamic price is found, fall back to the static list
      if (suggestedPrice === null) {
        suggestedPrice = averageSalePrices[modelKey];
      }

      if (suggestedPrice) {
        setSuggestedSalePrice(Math.round(suggestedPrice)); // Round to nearest whole number
      } else {
        alert('Kunne ikke finde en gennemsnitlig salgspris for denne model.');
        setSuggestedSalePrice(null);
      }
    } catch (err) {
      console.error('Fejl ved hentning af salgspris:', err);
      alert('Der opstod en fejl under hentning af salgspris.');
      setSuggestedSalePrice(null);
    }
  };

  const handleApplySalePrice = () => {
    if (suggestedSalePrice !== null) {
      setFormData({ ...formData, soldPrice: suggestedSalePrice });
      setSuggestedSalePrice(null);
    }
  };

  const handleSave = () => {
    if (!formData.storageGB || !formData.batteryHealth) {
        const proceed = window.confirm("Husk at spørge efter batteritilstand og GB. Vil du fortsætte?");
        if (!proceed) return;
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Er du sikker på, at du vil slette dette bud? Dette kan ikke fortrydes.')) {
      onDelete(formData._id);
    }
  };

  if (!formData) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <h2>Redigér Bud</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="bid-form">
          <label>Produktnavn</label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required />
          
          <label>Budbeløb</label>
          <input type="number" name="bidAmount" value={formData.bidAmount || ''} onChange={handleInputChange} required />

          <div className="form-row">
            <input type="number" name="storageGB" value={formData.storageGB || ''} onChange={handleInputChange} placeholder="Lagerplads (GB)" />
            <input type="number" name="batteryHealth" value={formData.batteryHealth || ''} onChange={handleInputChange} placeholder="Batteritilstand (%)" />
          </div>
          
          <label>Reparationsomkostninger</label>
          <div className="input-with-button">
            <input type="number" name="repairCost" value={formData.repairCost || ''} onChange={handleInputChange} placeholder="Klik for at tilføje dele..." />
            <button type="button" className="find-price-button" onClick={() => setPriceLookupOpen(true)}>Find Reservedele</button>
          </div>

          <label>Facebook Beskrivelse</label>
          <textarea name="facebookDescription" value={formData.facebookDescription || ''} onChange={handleInputChange} rows="3"></textarea>
          
          <label>Fejl og Mangler</label>
          <textarea name="flawsAndDefects" value={formData.flawsAndDefects || ''} onChange={handleInputChange} rows="3"></textarea>
          
          <label>Marketplace Link</label>
          <input type="text" name="link" value={formData.link || ''} onChange={handleInputChange} required />
          
          <label>Billed-URL</label>
          <input type="text" name="image" value={formData.image || ''} onChange={handleInputChange} />
          
          <label>Status</label>
          <select name="status" value={formData.status || 'Byder'} onChange={handleInputChange}>
            <option value="Byder">Byder</option>
            <option value="Købt (Mangler afhentning)">Købt (Mangler afhentning)</option>
            <option value="Købt (Mangler sendes)">Købt (Mangler sendes)</option>
            <option value="På vej">På vej</option>
            <option value="På lager">På lager</option>
            <option value="Solgt">Solgt</option>
            <option value="Tabt">Tabt</option>
          </select>

          {formData.status === 'Solgt' && (
            <div className="sale-price-section">
              <label>Salgspris (DKK)</label>
              <div className="input-with-suggestion">
                <input
                  type="number"
                  name="soldPrice"
                  value={formData.soldPrice || ''}
                  onChange={handleInputChange}
                  placeholder="Indtast endelig salgspris"
                />
                <button type="button" className="suggest-price-button" onClick={handleSuggestSalePrice}>
                  Foreslå pris
                </button>
              </div>
              {suggestedSalePrice !== null && (
                <div className="suggestion-display">
                  <p>Foreslået salgspris: <strong>{suggestedSalePrice} kr.</strong></p>
                  <button type="button" onClick={handleApplySalePrice}>Anvend</button>
                </div>
              )}
            </div>
          )}
          
          <div className="form-actions">
            <button type="submit">Gem Ændringer</button>
            {user && user.role === 'admin' && (
              <button type="button" className="delete-button-modal" onClick={handleDelete}>
                <FaTrash /> Slet Bud
              </button>
            )}
          </div>
        </form>
      </Modal>

      <PriceLookupModal 
        isOpen={isPriceLookupOpen}
        onClose={() => setPriceLookupOpen(false)}
        allPrices={allPrices}
        onSelectPart={handleSelectParts}
      />
    </>
  );
};

export default BidDetailModal; 