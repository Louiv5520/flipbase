import React, { useState } from 'react';
import Modal from '../common/Modal';
import './PriceLookupModal.css';

const PriceLookupModal = ({ isOpen, onClose, allPrices, onSelectPart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState({});
    const [activeCategory, setActiveCategory] = useState('Alle');

    if (!isOpen) return null;

    const categories = ['Alle', 'Skærm', 'Batteri', 'Kamera', 'Bagcover', 'Flexkabel'];

    const handleToggleSelect = (partId) => {
        setSelectedIds(prev => ({
            ...prev,
            [partId]: !prev[partId]
        }));
    };

    const handleAddSelected = () => {
        const selectedParts = allPrices.filter(part => selectedIds[part._id]);
        onSelectPart(selectedParts);
        onClose(); // Close after adding
    };

    const filteredPrices = allPrices.filter(part => {
        const categoryMatch = activeCategory === 'Alle' || part.name.toLowerCase().includes(activeCategory.toLowerCase());
        const searchMatch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            part.variant.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="large">
            <div className="price-lookup-container">
                <h2>Find Reservedel</h2>
                <input
                    type="text"
                    placeholder="Søg efter navn eller variant..."
                    className="price-lookup-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
                <div className="category-filters">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`category-button ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="price-lookup-list">
                    {filteredPrices.length > 0 ? (
                        filteredPrices.map(part => (
                            <div
                                key={part._id}
                                className={`price-lookup-item ${selectedIds[part._id] ? 'selected' : ''}`}
                                onClick={() => handleToggleSelect(part._id)}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={!!selectedIds[part._id]} 
                                    readOnly 
                                    className="item-checkbox"
                                />
                                <div className="item-details">
                                    <span className="item-name">{part.name}</span>
                                    <span className="item-variant">{part.variant}</span>
                                </div>
                                <span className="item-price">{part.price.toFixed(2).replace('.', ',')} kr.</span>
                            </div>
                        ))
                    ) : (
                        <p>Ingen reservedele matcher din søgning.</p>
                    )}
                </div>
                <div className="modal-actions">
                    <button onClick={handleAddSelected} className="add-selected-button">Tilføj Valgte</button>
                </div>
            </div>
        </Modal>
    );
};

export default PriceLookupModal; 