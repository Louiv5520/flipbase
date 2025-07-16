import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeContext } from './context/ThemeContext';
import AnalyticsWrapper from './components/analytics/AnalyticsWrapper';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import PriceListPage from './pages/PriceListPage';
import AccountPage from './pages/AccountPage'; // Import the new page
import InventoryPage from './pages/InventoryPage'; // Import the inventory page
import SoldItemsPage from './pages/SoldItemsPage'; // Import the sold items page
import SoldItemDetailPage from './pages/SoldItemDetailPage'; // Import the sold item detail page
import ShopPage from './pages/shop/ShopPage'; // Import the new shop page
import AboutUsPage from './pages/AboutUsPage'; // Import the About Us page
import CartPage from './pages/CartPage'; // Import the Cart page
import SettingsPage from './pages/SettingsPage'; // Import the new settings page
import UserManagementPage from './pages/UserManagementPage'; // Import the new user management page
import AnalyticsPage from './pages/AnalyticsPage'; // Import the analytics page
import DashboardLayout from './components/layout/DashboardLayout';
import PrivateRoute from './components/routing/PrivateRoute';
import './App.css';

function App() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <Router>
      <AnalyticsWrapper>
        <div className={`App ${theme}`}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ShopPage />} /> {/* Webshop is now the front page */}
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* CRM Routes */}
            <Route 
              path="/crm" 
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/crm/prices" 
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <PriceListPage />
                  </DashboardLayout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/crm/lager" 
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <InventoryPage />
                  </DashboardLayout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/crm/sold" 
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <SoldItemsPage />
                  </DashboardLayout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/crm/sold/:id" 
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <SoldItemDetailPage />
                  </DashboardLayout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/crm/account" 
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AccountPage />
                  </DashboardLayout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/crm/settings" 
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/crm/users" 
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <UserManagementPage />
                  </DashboardLayout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/crm/analytics" 
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AnalyticsPage />
                  </DashboardLayout>
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </AnalyticsWrapper>
    </Router>
  );
}

export default App; 