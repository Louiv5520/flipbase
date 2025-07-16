import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api';
import { FaPlusCircle, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import PartSelectorModal from '../common/PartSelectorModal';
import '../common/PartSelectorModal.css';


// This component now shows the parts selected from the modal
const StagedPartsForm = ({ inventoryItems, onDataChange }) => {
    const [stagedParts, setStagedParts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handlePartsSelected = (selectedParts) => {
        const newParts = selectedParts.map(part => ({
            id: `${part._id}-${Date.now()}`, // Unique ID for the row
            name: `${part.name} - ${part.variant}`,
            purchasePrice: part.price,
            orderedFor: '', // User must select this
            supplier: '',
            invoiceNumber: '',
        }));
        setStagedParts(prev => [...prev, ...newParts]);
    };

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const newParts = [...stagedParts];
        newParts[index][name] = value;
        setStagedParts(newParts);
    };

    const removeRow = (index) => {
        const newParts = stagedParts.filter((_, i) => i !== index);
        setStagedParts(newParts);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const partsToSubmit = stagedParts.map(({ id, ...rest }) => rest);

        if (partsToSubmit.some(p => !p.orderedFor)) {
            alert('Vælg venligst en vare for alle rækker.');
            return;
        }

        try {
            await api.post('/api/parts', { parts: partsToSubmit });
            alert('Reservedele tilføjet!');
            onDataChange();
            setStagedParts([]); // Clear the staging area
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Fejl: Kunne ikke tilføje reservedele.';
            alert(errorMsg);
        }
    };

    return (
        <>
            <PartSelectorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPartsSelected={handlePartsSelected}
            />
            <div className="add-part-container">
                 <button type="button" onClick={() => setIsModalOpen(true)} className="add-from-catalog-button">
                    <FaPlusCircle /> Find & Tilføj fra Katalog
                </button>
            </div>

            {stagedParts.length > 0 && (
                 <form onSubmit={handleSubmit} className="add-part-form">
                    <h3>Dele der skal tilføjes</h3>
                    {stagedParts.map((part, index) => (
                        <div className="form-grid-parts" key={part.id}>
                            <input type="text" name="name" value={part.name} readOnly disabled />
                            <select name="orderedFor" value={part.orderedFor} onChange={(e) => handleInputChange(e, index)} required>
                                <option value="">Bestilt til...</option>
                                {inventoryItems.map(item => (
                                    <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                            <input type="text" name="supplier" value={part.supplier} onChange={(e) => handleInputChange(e, index)} placeholder="Leverandør" />
                            <input type="text" name="invoiceNumber" value={part.invoiceNumber} onChange={(e) => handleInputChange(e, index)} placeholder="Fakturanummer" />
                            <input type="number" name="purchasePrice" value={part.purchasePrice} readOnly disabled />
                            <button type="button" onClick={() => removeRow(index)} className="remove-part-button">
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                    <div className="form-actions">
                        <button type="submit" className="submit-all-parts-button">
                            <FaPlusCircle /> Bekræft & Tilføj {stagedParts.length} Dele
                        </button>
                    </div>
                </form>
            )}
        </>
    );
};


const SparePartsTab = ({ parts, inventoryItems, onDataChange }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/api/users/me');
                    setUser(res.data);
                } catch (err) {
                    console.error('Failed to fetch user', err);
                    // Handle error, e.g., by logging out the user
                }
            }
        };
        fetchUser();
    }, []);

    const [editingPartId, setEditingPartId] = useState(null);
    const [editedPartData, setEditedPartData] = useState({});

    const handleEditStart = (part) => {
        setEditingPartId(part._id);
        setEditedPartData({ ...part });
    };

    const handleEditCancel = () => {
        setEditingPartId(null);
        setEditedPartData({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedPartData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSave = async (partId) => {
        try {
            await api.put(`/api/parts/${partId}`, editedPartData);
            alert('Reservedel opdateret!');
            onDataChange();
            handleEditCancel();
        } catch (err) {
            alert('Fejl: Kunne ikke opdatere reservedelen.');
        }
    };

    const handlePartDelete = async (partId) => {
        if (window.confirm('Er du sikker på, at du vil slette denne reservedel?')) {
            try {
                await api.delete(`/api/parts/${partId}`);
                alert('Reservedel slettet!');
                onDataChange();
            } catch (err) {
                alert('Fejl: Kunne ikke slette reservedelen.');
            }
        }
    };
    
    return (
        <div className="spare-parts-container">
            {user && user.role === 'admin' && <StagedPartsForm inventoryItems={inventoryItems} onDataChange={onDataChange} />}
            
            <div className="parts-list">
                {/* Header for the list */}
                <div className="parts-list-header">
                    <div>Reservedel</div>
                    <div>Bestilt til</div>
                    <div>Leverandør</div>
                    <div>Fakturanr.</div>
                    <div>Pris</div>
                    <div>Status</div>
                    {user && user.role === 'admin' && <div>Handlinger</div>}
                </div>
                {/* List of parts */}
                {parts.length > 0 ? (
                    parts.map(part => (
                        <div key={part._id} className="part-item">
                            {editingPartId === part._id ? (
                                <>
                                    <div className="part-name-cell">
                                        <img src={part.orderedFor?.image || 'https://via.placeholder.com/40'} alt={part.orderedFor?.name} className="part-ordered-for-image"/>
                                        <input type="text" name="name" value={editedPartData.name} onChange={handleInputChange} />
                                    </div>
                                    <div>{part.orderedFor ? part.orderedFor.name : 'N/A'}</div>
                                    <input type="text" name="supplier" value={editedPartData.supplier || ''} onChange={handleInputChange} placeholder="Leverandør" />
                                    <input type="text" name="invoiceNumber" value={editedPartData.invoiceNumber || ''} onChange={handleInputChange} placeholder="Fakturanr." />
                                    <input type="number" step="0.01" name="purchasePrice" value={editedPartData.purchasePrice} onChange={handleInputChange} />
                                    <select name="status" value={editedPartData.status} onChange={handleInputChange}>
                                        <option value="Bestilt">Bestilt</option>
                                        <option value="På lager">På lager</option>
                                        <option value="Brugt">Brugt</option>
                                    </select>
                                    <div className="part-actions">
                                        <button onClick={() => handleEditSave(part._id)} className="action-btn-save"><FaSave /></button>
                                        <button onClick={handleEditCancel} className="action-btn-cancel"><FaTimes /></button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="part-name-cell" data-label="Reservedel">
                                        <img 
                                            src={part.orderedFor?.image || 'https://via.placeholder.com/40'} 
                                            alt={part.orderedFor?.name} 
                                            className="part-ordered-for-image"
                                        />
                                        <span>{part.name}</span>
                                    </div>
                                    <div data-label="Bestilt til">{part.orderedFor ? part.orderedFor.name : 'N/A'}</div>
                                    <div data-label="Leverandør">{part.supplier || 'N/A'}</div>
                                    <div data-label="Fakturanr.">{part.invoiceNumber || 'N/A'}</div>
                                    <div data-label="Pris">{typeof part.purchasePrice === 'number' ? part.purchasePrice.toFixed(2) : '0.00'} kr.</div>
                                    <div data-label="Status">{part.status}</div>
                                    <div className="part-actions" data-label="Handlinger">
                                    {user && user.role === 'admin' && (
                                        <>
                                            <button onClick={() => handleEditStart(part)} className="action-btn-edit"><FaEdit /></button>
                                            <button onClick={() => handlePartDelete(part._id)} className="action-btn-delete"><FaTrash /></button>
                                        </>
                                    )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-parts-found">Ingen reservedele fundet.</div>
                )}
            </div>
        </div>
    );
};

export default SparePartsTab; 