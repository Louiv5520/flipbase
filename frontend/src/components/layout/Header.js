import React from 'react';
import { FaBars } from 'react-icons/fa';
import './Header.css';

const Header = ({ onMenuClick }) => {
  return (
    <header className="mobile-header">
      <button onClick={onMenuClick} className="menu-button">
        <FaBars />
      </button>
    </header>
  );
};

export default Header; 