import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import './Header.css';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';

const Header = () => {
  const { cartCount } = useContext(CartContext);

  return (
    <header className="shop-header-nav">
      <div className="header-container">
        <div className="logo">
          <a href="/shop">Flipbase</a>
        </div>
        <nav className="main-nav">
          <a href="/shop">iPhones</a>
          <a href="/about">Om Os</a>
          <a href="/contact">Kontakt</a>
        </nav>
        <div className="header-actions">
          <a href="/search" className="action-icon">
            <FaSearch size={22} />
          </a>
          <a href="/cart" className="action-icon cart-icon">
            <FaShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header; 