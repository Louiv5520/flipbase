import React, { useState, useEffect } from 'react';
import api from '../../api';
import BidItem from './BidItem';
import Modal from '../common/Modal';
import BidDetailModal from './BidDetailModal';
import PriceLookupModal from './PriceLookupModal'; // Import the price lookup modal
import { FaPlus } from 'react-icons/fa';
import { averageSalePrices } from '../../config/salePrices';
import './MarketplaceTracker.css';

const MarketplaceTracker = ({ user, bids, refetchBids }) => {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isPriceLookupOpen, setPriceLookupOpen] = useState(false); // State for the new modal
  const [selectedBid, setSelectedBid] = useState(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [allPrices, setAllPrices] = useState([]); // State for all parts prices
  const [filteredPrices, setFilteredPrices] = useState([]); // State for filtered parts
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bidAmount: '',
    link: '',
    image: '',
    status: 'Byder',
    facebookDescription: '',
    flawsAndDefects: '',
    repairCost: 0,
    storageGB: '',
    batteryHealth: ''
  });

  // Fetch all phone parts on component mount
  useEffect(() => {
    const fetchPrices = async () => {
        try {
            const res = await api.get('/phone-parts');
            setAllPrices(res.data);
        } catch (err) {
            console.error("Could not fetch phone parts.", err);
        }
    };
    fetchPrices();
  }, []);

  const handleBidClick = (bid) => {
    setSelectedBid(bid);
    setDetailModalOpen(true);
  };

  const handleUpdateBid = async (updatedBid) => {
    try {
        await api.put(`/bids/${updatedBid._id}`, updatedBid);
        
        setDetailModalOpen(false);
        refetchBids(); // Use the passed-in refetch function
    } catch (err) {
        console.error('Failed to update bid', err.response.data);
    }
  };

  const handleDeleteBid = async (bidId) => {
    if (window.confirm('Er du sikker på, at du vil slette dette bud?')) {
        try {
            await api.delete(`/bids/${bidId}`);
            refetchBids(); // Refetch bids to update the list
        } catch (err) {
            console.error('Failed to delete bid', err.response?.data);
            alert('Fejl: Kunne ikke slette bud. Se konsollen for detaljer.');
        }
    }
  };

  const fetchBids = async () => {
    try {
      const res = await api.get('/bids');
      refetchBids(res.data);
    } catch (err) {
      console.error('Failed to fetch bids', err);
    }
  };

  useEffect(() => {
    // This call is redundant if ProfilePage is the source of truth for bids
    // and passes them down. `refetchBids` should be used after mutations.
    // fetchBids(); 
  }, []);
  
  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectParts = (parts) => {
    if (!parts || parts.length === 0) return;

    const totalCostOfSelectedParts = parts.reduce((sum, part) => sum + part.price, 0);
    const partsDescription = parts.map(part => `🔧 ${part.name}`).join('\n');

    const currentRepairCost = Number(formData.repairCost) || 0;
    const existingDefects = formData.flawsAndDefects || '';

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

  const handleOpenPriceLookup = () => {
    const modelName = formData.name.trim();
    if (!modelName) {
      setFilteredPrices(allPrices); // Show all if no model is entered
    } else {
      // Create a regex to match the model name as a whole word, case-insensitively.
      // This prevents "iPhone 1" from matching "iPhone 11".
      const modelRegex = new RegExp(`\\b${modelName}\\b`, 'i');
      const filtered = allPrices.filter(part => 
        modelRegex.test(part.name)
      );
      setFilteredPrices(filtered);
    }
    setPriceLookupOpen(true);
  };

  const handleCalculateSuggestion = async () => {
    const modelKey = formData.name.toLowerCase().trim();
    if (!modelKey) {
      alert('Indtast venligst en model først.');
      return;
    }
    
    const desiredProfit = 500;

    try {
      // Step 1: Fetch average sale price from the backend
      const res = await api.get(`/bids/average-price/${modelKey}`);
      let salePrice = res.data.averagePrice;

      // Step 2: If no dynamic price, fall back to the static list
      if (salePrice === null) {
        salePrice = averageSalePrices[modelKey];
      }

      // Step 3: Calculate and set the suggestion
      if (salePrice) {
        const repairCost = Number(formData.repairCost) || 0;
        const suggestion = salePrice - repairCost - desiredProfit;
        setSuggestedPrice(suggestion);
      } else {
        setSuggestedPrice(null);
        alert('Kunne ikke finde en salgspris for denne model. Tjek navnet.');
      }
    } catch (err) {
      console.error('Fejl ved beregning af forslag:', err);
      alert('Der opstod en fejl under beregning af prisforslag.');
      setSuggestedPrice(null);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestedPrice !== null) {
      setFormData({ ...formData, bidAmount: suggestedPrice });
      setSuggestedPrice(null); // Clear suggestion after applying
    }
  };

  const handleScrape = async () => {
    setIsScraping(true);
    try {
        const res = await api.post('/scrape', { url: scrapeUrl });
        
        setFormData({
            ...formData,
            name: res.data.name,
            bidAmount: res.data.bidAmount,
            image: res.data.image,
            facebookDescription: res.data.facebookDescription,
            storageGB: res.data.storageGB || '',
            batteryHealth: res.data.batteryHealth || '',
            link: scrapeUrl // Set link to the scraped url
        });

    } catch (err) {
        console.error('Scraping failed', err);
        alert('Kunne ikke hente data automatisk. Indtast venligst manuelt.');
    }
    setIsScraping(false);
  };

  const handleFormSubmit = async e => {
    e.preventDefault();

    if (!formData.storageGB || !formData.batteryHealth) {
        const proceed = window.confirm("Husk at spørge efter batteritilstand og GB. Vil du fortsætte?");
        if (!proceed) return;
    }

    try {
        const submissionData = { ...formData, bidAmount: Number(formData.bidAmount) };
        await api.post('/bids', submissionData);
        
        setAddModalOpen(false);
        refetchBids(); // Use the passed-in refetch function
        // Reset form
        setFormData({ name: '', bidAmount: '', link: '', image: '', status: 'Byder', facebookDescription: '', flawsAndDefects: '', repairCost: 0, storageGB: '', batteryHealth: '' });

    } catch (err) {
        console.error('Failed to add bid', err.response.data);
    }
  }

  return (
    <>
      <div className="marketplace-tracker-container">
        <div className="tracker-header">
          <h3>Facebook Marketplace Overvågning</h3>
          <button className="add-bid-button" onClick={() => setAddModalOpen(true)}>
            <FaPlus /> Tilføj Nyt Bud
          </button>
        </div>
        <div className="tracker-list-header">
            <div className="header-item">Produkt</div>
            <div className="header-item">Fejl og Mangler</div>
            <div className="header-item">Detaljer</div>
        </div>
        <div className="tracker-list">
          {bids.map(bid => (
            <BidItem key={bid._id} item={bid} onClick={() => handleBidClick(bid)} user={user} onDelete={() => handleDeleteBid(bid._id)} />
          ))}
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)}>
        <h2>Tilføj Nyt Bud</h2>
        <div className="scrape-section">
            <input type="text" value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="Indsæt Facebook Marketplace URL her" />
            <button onClick={handleScrape} disabled={isScraping}>
                {isScraping ? 'Henter...' : 'Hent Data'}
            </button>
        </div>

        <form onSubmit={handleFormSubmit} className="bid-form">
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Produktnavn (f.eks., iPhone 13)" required />
          
          <div className="input-with-suggestion">
            <input type="number" name="bidAmount" value={formData.bidAmount} onChange={handleInputChange} placeholder="Budbeløb (f.eks., 4500)" required />
            <button type="button" className="suggest-price-button" onClick={handleCalculateSuggestion}>Foreslå Pris</button>
          </div>
          {suggestedPrice !== null && (
            <div className="suggestion-display">
              <p>Foreslået bud: <strong>{suggestedPrice} kr.</strong></p>
              <button type="button" onClick={handleApplySuggestion}>Anvend</button>
            </div>
          )}
          
          <div className="input-with-button">
               <input type="number" name="repairCost" value={formData.repairCost} onChange={handleInputChange} placeholder="Reparationsomkostninger" />
               <button type="button" className="find-price-button" onClick={handleOpenPriceLookup}>Find Reservedele</button>
          </div>

          <div className="form-row">
            <input type="number" name="storageGB" value={formData.storageGB} onChange={handleInputChange} placeholder="Lagerplads (GB)" />
            <input type="number" name="batteryHealth" value={formData.batteryHealth} onChange={handleInputChange} placeholder="Batteritilstand (%)" />
          </div>
          <textarea name="facebookDescription" value={formData.facebookDescription} onChange={handleInputChange} placeholder="Facebook beskrivelse" rows="3"></textarea>
          <textarea name="flawsAndDefects" value={formData.flawsAndDefects} onChange={handleInputChange} placeholder="Fejl og mangler" rows="3"></textarea>
          <input type="text" name="link" value={formData.link} onChange={handleInputChange} placeholder="Marketplace Link" required />
          <input type="text" name="image" value={formData.image} onChange={handleInputChange} placeholder="Billed-URL (valgfri)" />
          <select name="status" value={formData.status} onChange={handleInputChange}>
            <option value="Byder">Byder</option>
            <option value="Købt (Mangler afhentning)">Købt (Mangler afhentning)</option>
            <option value="Købt (Mangler sendes)">Købt (Mangler sendes)</option>
            <option value="På vej">På vej</option>
            <option value="På lager">På lager</option>
            <option value="Tabt">Tabt</option>
          </select>
          <button type="submit">Indsend Bud</button>
        </form>
      </Modal>

      <PriceLookupModal 
        isOpen={isPriceLookupOpen}
        onClose={() => setPriceLookupOpen(false)}
        allPrices={filteredPrices}
        onSelectPart={handleSelectParts}
      />

      <BidDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        bid={selectedBid}
        onSave={handleUpdateBid}
        onDelete={handleDeleteBid}
        allPrices={allPrices}
        user={user}
      />
    </>
  );
};

export default MarketplaceTracker; 