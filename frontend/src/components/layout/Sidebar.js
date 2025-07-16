import React, { useContext, useEffect, useState } from 'react';
import {
  FaTachometerAlt,
  FaCog,
  FaSignOutAlt,
  FaTools,
  FaUser, // Add user icon
  FaHome, FaBoxOpen, FaUserCircle, FaSun, FaMoon, FaHandHoldingUsd, FaUsersCog, FaChartBar
} from 'react-icons/fa';
import { useNavigate, NavLink } from 'react-router-dom';
import './Sidebar.css';
import { ThemeContext } from '../../context/ThemeContext';
import api from '../../api';


const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
        try {
            const res = await api.get('/users/me');
            setCurrentUser(res.data);
        } catch (error) {
            console.error("Kunne ikke hente bruger i sidebar", error);
        }
    };
    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Flipbase Logo" className="sidebar-logo-img" />
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/crm" end className={({ isActive }) => isActive ? "active" : ""} title="Dashboard">
          <FaTachometerAlt />
        </NavLink>
        <NavLink to="/crm/lager" className={({ isActive }) => isActive ? "active" : ""} title="Lager">
          <FaBoxOpen />
        </NavLink>
        <NavLink to="/crm/sold" className={({ isActive }) => isActive ? "active" : ""} title="Salgsoversigt">
          <FaHandHoldingUsd />
        </NavLink>
        <NavLink to="/crm/prices" className={({ isActive }) => isActive ? "active" : ""} title="Reservedelskatalog">
          <FaTools />
        </NavLink>
        {currentUser && currentUser.role === 'admin' && (
            <NavLink to="/crm/users" className={({ isActive }) => isActive ? "active" : ""} title="Brugerstyring">
                <FaUsersCog />
            </NavLink>
        )}
        <NavLink to="/crm/analytics" className={({ isActive }) => isActive ? "active" : ""} title="Analyse">
          <FaChartBar />
        </NavLink>
        <div className="nav-divider"></div>
        <NavLink to="/crm/account" className={({ isActive }) => isActive ? "active" : ""} title="Konto">
          <FaUserCircle />
        </NavLink>
        <NavLink to="/crm/settings" className={({ isActive }) => isActive ? "active" : ""} title="Indstillinger">
          <FaCog />
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={toggleTheme} className="theme-toggle-button" title="Skift tema">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
        <button onClick={handleLogout} className="logout-button" title="Log ud">
          <FaSignOutAlt />
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 