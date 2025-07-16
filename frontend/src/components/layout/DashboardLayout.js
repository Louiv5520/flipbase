import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header'; // Import the new Header component
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} />
      {isSidebarOpen && <div className="backdrop" onClick={toggleSidebar}></div>}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout; 