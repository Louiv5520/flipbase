import React, { useState } from 'react';
import api from '../../api';
import './InventoryItem.css';
import { FaSave, FaEdit } from 'react-icons/fa';

const InventoryItem = ({ item, onDataChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        image: item.image || '',
        price: item.price || '', // Changed from soldPrice
        forSale: item.forSale || false,
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        try {
            const updatePayload = {
                ...formData,
                price: formData.price ? Number(formData.price) : undefined, // Changed from soldPrice
            };

            await api.put(`/bids/${item._id}`, updatePayload);
            setIsEditing(false);
            setError('');
            if (onDataChange) {
                onDataChange(); // Refreshes data on the parent page
            }
        } catch (err) {
            console.error("Failed to update item", err);
            setError('Kunne ikke gemme ændringer.');
        }
    };
    
    return (
        <div className={`inventory-item-card ${formData.forSale ? 'for-sale' : ''}`}>
            <div className="item-image-section">
                <img src={formData.image || 'https://via.placeholder.com/200x200'} alt={item.name} className="item-main-image" />
                {isEditing && (
                    <div className="edit-image-field">
                        <label>Billed-URL</label>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            placeholder="Indsæt ny billed-URL"
                        />
                    </div>
                )}
            </div>

            <div className="item-details-section">
                <h3 className="item-title">{item.name}</h3>
                
                <div className="detail-row">
                    <span className="detail-label">Købspris:</span>
                    <span className="detail-value">{item.bidAmount.toLocaleString('da-DK')} kr.</span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Reparation:</span>
                    <span className="detail-value">{item.repairCost.toLocaleString('da-DK')} kr.</span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Total Omk.:</span>
                    <span className="detail-value bold">{(item.bidAmount + item.repairCost).toLocaleString('da-DK')} kr.</span>
                </div>

                {isEditing ? (
                     <div className="detail-row editing-row">
                        <label htmlFor={`price-${item._id}`} className="detail-label">Udsalgspris:</label>
                        <input
                            type="number"
                            id={`price-${item._id}`}
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="detail-input"
                            placeholder="f.eks. 1500"
                        />
                    </div>
                ) : (
                    <div className="detail-row">
                        <span className="detail-label">Udsalgspris:</span>
                        <span className="detail-value price">{(item.price || 0).toLocaleString('da-DK')} kr.</span>
                    </div>
                )}
               
                <div className="item-actions">
                    <div className="for-sale-status">
                        {isEditing ? (
                            <div className="for-sale-toggle-edit">
                                <input
                                    type="checkbox"
                                    id={`forSale-${item._id}`}
                                    name="forSale"
                                    checked={formData.forSale}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor={`forSale-${item._id}`}>Til salg på webshop</label>
                            </div>
                        ) : (
                             <span className={`status-indicator ${formData.forSale ? 'active' : 'inactive'}`}>
                                {formData.forSale ? '● Til Salg' : '● Ikke til Salg'}
                            </span>
                        )}
                    </div>
                    {isEditing ? (
                        <button onClick={handleSave} className="action-button save-button" title="Gem">
                            <FaSave /> Gem
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="action-button edit-button" title="Rediger">
                            <FaEdit /> Rediger
                        </button>
                    )}
                </div>

                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default InventoryItem; 