import React, { useState, useEffect } from 'react';
import api from '../api';
import './PriceListPage.css';

const PriceListPage = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [allModels, setAllModels] = useState([]);
    const [allCategories, setAllCategories] = useState([]);

    const [selectedModel, setSelectedModel] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchParts = async () => {
            try {
                const res = await api.get('/phone-parts');
                setParts(res.data);
                
                const models = [...new Set(res.data.map(p => p.model))].sort((a,b) => b.localeCompare(a, 'da', { numeric: true }));
                const categories = [...new Set(res.data.map(p => p.category))].sort();
                setAllModels(models);
                setAllCategories(categories);

                setLoading(false);
            } catch (err) {
                setError('Kunne ikke hente reservedele. Prøv venligst igen senere.');
                setLoading(false);
                console.error(err);
            }
        };

        fetchParts();
    }, []);

    const filteredParts = parts.filter(part => {
        const searchMatch = searchTerm === '' ||
            part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (part.variant && part.variant.toLowerCase().includes(searchTerm.toLowerCase()));

        const modelMatch = selectedModel === '' || part.model === selectedModel;
        const categoryMatch = selectedCategory === '' || part.category === selectedCategory;

        return searchMatch && modelMatch && categoryMatch;
    });

    return (
        <div className="price-list-container">
            <div className="price-list-header">
                <h1>Reservedelskatalog</h1>
            </div>

            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Søg i reservedele..."
                    className="filter-item price-list-search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select 
                    className="filter-item"
                    value={selectedModel} 
                    onChange={e => setSelectedModel(e.target.value)}
                >
                    <option value="">Alle Modeller</option>
                    {allModels.map(model => <option key={model} value={model}>{model}</option>)}
                </select>

                <select 
                    className="filter-item"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                >
                    <option value="">Alle Kategorier</option>
                    {allCategories.map(category => <option key={category} value={category}>{category}</option>)}
                </select>
            </div>

            {loading && <p>Indlæser reservedele...</p>}
            {error && <p className="error-message">{error}</p>}
            
            {!loading && !error && (
                <div className="price-list-table-container">
                    <table className="price-list-table">
                        <thead>
                            <tr>
                                <th>Produktnavn</th>
                                <th>Variant</th>
                                <th>Model</th>
                                <th>Kategori</th>
                                <th>Pris (DKK)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredParts.length > 0 ? (
                                filteredParts.map(part => (
                                    <tr key={part._id}>
                                        <td data-label="Produktnavn">{part.name}</td>
                                        <td data-label="Variant">{part.variant || '-'}</td>
                                        <td data-label="Model">{part.model}</td>
                                        <td data-label="Kategori">{part.category}</td>
                                        <td data-label="Pris (DKK)">{part.price.toFixed(2).replace('.', ',')} kr.</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">Ingen reservedele fundet, der matcher dine filtre.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PriceListPage; 