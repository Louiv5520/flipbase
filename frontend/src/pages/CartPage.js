import React, { useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import analyticsService from '../services/analytics';
import './CartPage.css';
import { FaTrash } from 'react-icons/fa';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useContext(CartContext);

  useEffect(() => {
    // Track cart view
    analyticsService.trackViewCart();
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + item.soldPrice * item.quantity, 0);

  return (
    <div className="cart-page-container">
      <div className="cart-header">
        <h1>Din Indkøbskurv</h1>
        <p>{cartCount} vare{cartCount !== 1 && 'r'}</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Din indkøbskurv er tom.</p>
          <Link to="/shop" className="continue-shopping-btn">Fortsæt med at handle</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-list">
            {cartItems.map(item => (
              <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>Stand: Fremragende</p>
                  <p className="item-price">{item.soldPrice.toLocaleString('da-DK')} kr.</p>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-selector">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                    <input type="text" value={item.quantity} readOnly />
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="remove-item-btn" onClick={() => removeFromCart(item._id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>Oversigt</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString('da-DK')} kr.</span>
            </div>
            <div className="summary-row">
              <span>Levering</span>
              <span>Gratis</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{subtotal.toLocaleString('da-DK')} kr.</span>
            </div>
            <button className="checkout-btn">Gå til kassen</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage; 