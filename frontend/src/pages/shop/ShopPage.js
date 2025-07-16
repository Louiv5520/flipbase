import React, { useState, useEffect } from 'react';
import { getShopInventory } from '../../api';
import ProductCard from './ProductCard';
import Header from './Header';
import './ShopPage.css';
import { FaShippingFast, FaCheckCircle, FaAward, FaStar } from 'react-icons/fa';

const TrustpilotWidget = () => (
  <div className="trustpilot-widget">
    <div className="trustpilot-stars">
      {[...Array(5)].map((_, i) => <FaStar key={i} />)}
    </div>
    <p><strong>Fremragende</strong> på Trustpilot</p>
  </div>
);

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and Sort States
  const [filters, setFilters] = useState({
    model: 'all',
    condition: 'all',
    storage: 'all',
    color: 'all',
    priceRange: { min: 0, max: 10000 }
  });
  const [sortOrder, setSortOrder] = useState('popular');
  const [filterOptions, setFilterOptions] = useState({
    models: [],
    conditions: [],
    storages: [],
    colors: [],
    priceRange: { min: 0, max: 10000 }
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getShopInventory();
        
        // Sikkerhedsforanstaltning for at sikre, at vi har gyldige data
        if (!response || !response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid data format received from server');
        }

        const fetchedProducts = response.data;
        
        // Sanitize products to ensure they have a valid price before processing
        const validProducts = fetchedProducts.filter(p => typeof p.price === 'number' && !isNaN(p.price));
        setProducts(validProducts);
        
        // Fortsæt kun, hvis der er produkter at behandle
        if (validProducts.length > 0) {
          const models = [...new Set(validProducts.map(p => p.name.split(' ')[1]))];
          const conditions = [...new Set(validProducts.map(p => p.condition))];
          const storages = [...new Set(validProducts.map(p => p.storageGB))].sort((a,b) => a-b);
          // Nogle produkter har muligvis ikke varianter, så vi tilføjer en sikkerhedstjek
          const colors = [...new Set(validProducts.flatMap(p => p.variants ? p.variants.map(v => v.color) : []))];
          const prices = validProducts.map(p => p.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);

          setFilterOptions({ models, conditions, storages, colors, priceRange: { min: minPrice, max: maxPrice } });
          setFilters(prev => ({...prev, priceRange: { min: minPrice, max: maxPrice }}));
        }

      } catch (err) {
        setError('Kunne ikke hente produkter. Prøv igen senere.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
        ...prev,
        priceRange: { ...prev.priceRange, [name]: parseInt(value, 10) }
    }));
  };

  const filteredAndSortedProducts = products
    .filter(p => {
        const { model, condition, storage, color, priceRange } = filters;
        return (
            (model === 'all' || p.name.includes(model)) &&
            (condition === 'all' || p.condition === condition) &&
            (storage === 'all' || p.storageGB === parseInt(storage)) &&
            (color === 'all' || (p.variants && p.variants.some(v => v.color === color))) && // Added check for p.variants
            (p.price >= priceRange.min && p.price <= priceRange.max)
        );
    })
    .sort((a, b) => {
        switch (sortOrder) {
            case 'price-asc': return a.price - b.price;
            case 'price-desc': return b.price - a.price;
            case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
            default: return 0; // 'popular' would need a popularity score
        }
    });

  return (
    <div className="shop-page-container">
      <Header />
      
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Istandsatte iPhones</h1>
          <p className="hero-subtitle">Spar på prisen, ikke på kvaliteten. Alle telefoner er grundigt tjekket og kommer med 12 måneders garanti.</p>
          <div className="hero-actions">
            <button className="cta-button">Se alle telefoner</button>
            <TrustpilotWidget />
          </div>
        </div>
      </section>

      <main className="shop-main-content">
        {/* ----- Filter Panel ----- */}
        <aside className="filter-panel">
          <h3 className="filter-title">Find Din Perfekte iPhone</h3>
          
          <div className="filter-group">
            <label htmlFor="model">Model</label>
            <select id="model" name="model" value={filters.model} onChange={handleFilterChange}>
                <option value="all">Alle Modeller</option>
                {filterOptions.models.map(m => <option key={m} value={m}>{`iPhone ${m}`}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="condition">Stand</label>
            <select id="condition" name="condition" value={filters.condition} onChange={handleFilterChange}>
                <option value="all">Alle Stå</option>
                {filterOptions.conditions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="storage">Lagerplads</label>
            <select id="storage" name="storage" value={filters.storage} onChange={handleFilterChange}>
                <option value="all">Al lagerplads</option>
                {filterOptions.storages.map(s => <option key={s} value={s}>{`${s} GB`}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="color">Farve</label>
            <select id="color" name="color" value={filters.color} onChange={handleFilterChange}>
                <option value="all">Alle farver</option>
                {filterOptions.colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Prisinterval</label>
            <div className="price-range-inputs">
                <input type="number" name="min" value={filters.priceRange.min} onChange={handlePriceChange} placeholder="Min" />
                <span>-</span>
                <input type="number" name="max" value={filters.priceRange.max} onChange={handlePriceChange} placeholder="Max" />
            </div>
            <input 
                type="range" 
                min={filterOptions.priceRange.min} 
                max={filterOptions.priceRange.max} 
                value={filters.priceRange.max}
                onChange={(e) => handlePriceChange({target: {name: 'max', value: e.target.value}})}
                className="price-slider"
            />
          </div>

        </aside>

        {/* ----- Product Grid ----- */}
        <section className="product-grid-container">
            <div className="product-grid-header">
                <p>{filteredAndSortedProducts.length} produkter fundet</p>
                <div className="sort-container">
                    <label htmlFor="sort-order">Sortér efter: </label>
                    <select id="sort-order" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="popular">Popularitet</option>
                        <option value="price-asc">Pris: Lav til Høj</option>
                        <option value="price-desc">Pris: Høj til Lav</option>
                        <option value="newest">Nyeste</option>
                    </select>
                </div>
            </div>
            
            {loading && <div className="loader">Henter produkter...</div>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && (
            <div className="product-grid">
                {filteredAndSortedProducts.length > 0 ? (
                filteredAndSortedProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))
                ) : (
                <p>Ingen produkter matcher dine filtre.</p>
                )}
            </div>
            )}
        </section>
      </main>

      <section className="features-section" id="about">
          <div className="swappie-feature">
            <FaCheckCircle className="swappie-feature-icon" />
            <h3>Grundigt tjekket</h3>
            <p>Vores teknikere gennemgår hver telefon for at sikre fuld funktionalitet.</p>
          </div>
          <div className="swappie-feature">
            <FaAward className="swappie-feature-icon" />
            <h3>12 måneders garanti</h3>
            <p>Sov trygt med vores omfattende garanti, der dækker alle tekniske fejl.</p>
          </div>
          <div className="swappie-feature">
            <FaShippingFast className="swappie-feature-icon" />
            <h3>Hurtig levering</h3>
            <p>Bestil inden kl. 14, og vi sender din nye telefon afsted samme dag.</p>
          </div>
        </section>

      <footer className="swappie-footer" id="contact">
        <div className="swappie-footer-content">
            <p>&copy; 2024 Flipbase. Alle rettigheder forbeholdes.</p>
        </div>
      </footer>
    </div>
  );
};

export default ShopPage; 