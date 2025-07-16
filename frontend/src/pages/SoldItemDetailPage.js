import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import debounce from 'lodash.debounce';
import './SoldItemDetailPage.css';

const SoldItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerAddress: '',
    soldDate: '',
  });

  // New state for suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const formatDateForInput = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/api/bids/${id}`);
        setItem(res.data);
        setFormData({
          buyerName: res.data.customer?.name || '',
          buyerEmail: res.data.customer?.email || '',
          buyerPhone: res.data.customer?.phone || '',
          buyerAddress: res.data.customer?.address || '',
          soldDate: formatDateForInput(res.data.soldDate) || formatDateForInput(new Date()),
        });
      } catch (err) {
        setError('Kunne ikke hente data for varen.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // Debounced search function using useCallback for performance
  const debouncedSearch = useCallback(debounce(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await api.get(`/api/customers/search?q=${query}`);
      setSuggestions(res.data);
      setShowSuggestions(res.data.length > 0);
    } catch (err) {
      console.error("Error searching for customers:", err);
    }
  }, 300), []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'buyerName') {
      if (value) {
        debouncedSearch(value);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (customer) => {
    setFormData({
      ...formData,
      buyerName: customer.name,
      buyerEmail: customer.email || '',
      buyerPhone: customer.phone || '',
      buyerAddress: customer.address || '',
    });
    setShowSuggestions(false);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/bids/${id}/buyer`, formData);
      alert('Køberoplysninger er gemt!');
      navigate('/sold');
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Fejl ved lagring. Prøv igen.';
      setError(errorMessage);
    }
  };

  if (loading) return <div>Indlæser...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!item) return <div>Varen blev ikke fundet.</div>;

  return (
    <div className="sold-item-detail-page">
      <h1>Detaljer for {item.name}</h1>
      <div className="detail-container">
        {/* Placeholder for item summary if needed */}
        <div className="buyer-info-form">
          <h2>Køberoplysninger</h2>
          <form onSubmit={handleSaveChanges} autoComplete="off">
            <div className="form-grid">
              <div className="form-group">
                <label>Fulde Navn</label>
                <input
                  type="text"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleInputChange}
                  onFocus={() => formData.buyerName && suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // hide with delay
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((customer) => (
                      <li key={customer._id} onMouseDown={() => handleSuggestionClick(customer)}>
                        <strong>{customer.name}</strong><br />
                        <small>{customer.email || 'N/A'} &bull; {customer.phone || 'N/A'}</small><br/>
                        <small>{customer.address || 'Adresse ikke angivet'}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label>Salgsdato</label>
                <input type="date" name="soldDate" value={formData.soldDate} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="buyerEmail" value={formData.buyerEmail} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input type="tel" name="buyerPhone" value={formData.buyerPhone} onChange={handleInputChange} />
              </div>
              <div className="form-group full-width">
                <label>Adresse</label>
                <textarea name="buyerAddress" value={formData.buyerAddress} onChange={handleInputChange} rows="3"></textarea>
              </div>
            </div>
            <button type="submit" className="save-button">Gem Oplysninger</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SoldItemDetailPage; 