import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import './ProductCard.css';
import { FaMemory, FaMicrochip, FaBatteryFull } from 'react-icons/fa';

// Helper to get styling based on condition
const getConditionClass = (condition) => {
    switch (condition) {
        case 'Som ny': return 'condition-new';
        case 'Fremragende': return 'condition-excellent';
        case 'God': return 'condition-good';
        default: return 'condition-default';
    }
};

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  
  // The 'variants' logic was removed as it's not part of the current data model.

  return (
    <div className="product-card-container">
      <div className="product-card-image-wrapper">
        <img src={product.image || 'https://via.placeholder.com/300x300'} alt={product.name} className="product-card-image" />
        <div className={`product-card-condition-badge ${getConditionClass(product.condition)}`}>
            {product.condition}
        </div>
      </div>
      <div className="product-card-info">
        <h3 className="product-card-name">{product.name}</h3>
        
        <div className="product-card-specs">
            <div className="spec-item">
                <FaMicrochip className="spec-icon" />
                <span>{product.name.split(' ')[1]}</span>
            </div>
            <div className="spec-item">
                <FaMemory className="spec-icon" />
                <span>{product.storageGB} GB</span>
            </div>
            {product.batteryHealth && (
                 <div className="spec-item">
                    <FaBatteryFull className="spec-icon" />
                    <span>{product.batteryHealth}%</span>
                </div>
            )}
        </div>

        <p className="product-card-price">
          Fra {product.price} kr.
        </p>
        
        <button className="product-card-cta" onClick={() => addToCart(product)}>
          Se muligheder
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 