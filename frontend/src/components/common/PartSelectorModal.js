import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import './PartSelectorModal.css';

// Simple debounce function
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

const PartSelectorModal = ({ isOpen, onClose, onPartsSelected }) => {
    const [catalog, setCatalog] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [loading, setLoading] = useState(false);

    const fetchCatalog = useCallback(async (query) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/phone-parts?search=${query}`);
            setCatalog(res.data);
        } catch (err) {
            console.error("Could not fetch part catalog", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedFetch = useCallback(debounce(fetchCatalog, 300), [fetchCatalog]);

    useEffect(() => {
        if (isOpen) {
            fetchCatalog(''); // Initial fetch
        }
    }, [isOpen, fetchCatalog]);

    useEffect(() => {
        debouncedFetch(searchQuery);
    }, [searchQuery, debouncedFetch]);

    const handleSelectionChange = (partId) => {
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(partId)) {
            newSelectedIds.delete(partId);
        } else {
            newSelectedIds.add(partId);
        }
        setSelectedIds(newSelectedIds);
    };

    const handleConfirm = () => {
        const selectedParts = catalog.filter(part => selectedIds.has(part._id));
        onPartsSelected(selectedParts);
        onClose();
        setSelectedIds(new Set());
        setSearchQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container part-selector-modal">
                <div className="modal-header">
                    <h2>Find Reservedel</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <input
                        type="text"
                        className="modal-search-input"
                        placeholder="Søg efter navn, variant eller kategori..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="part-list-container">
                        {loading ? <p>Indlæser...</p> : catalog.map(part => (
                            <div key={part._id} className="part-list-item">
                                <input
                                    type="checkbox"
                                    id={`part-${part._id}`}
                                    checked={selectedIds.has(part._id)}
                                    onChange={() => handleSelectionChange(part._id)}
                                />
                                <label htmlFor={`part-${part._id}`} className="part-info">
                                    <span className="part-name">{part.name}</span>
                                    <span className="part-variant">{part.variant}</span>
                                </label>
                                <span className="part-price">{part.price.toFixed(2)} kr.</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleConfirm} className="confirm-button" disabled={selectedIds.size === 0}>
                        Tilføj {selectedIds.size > 0 ? `(${selectedIds.size})` : ''} Valgte
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartSelectorModal; 