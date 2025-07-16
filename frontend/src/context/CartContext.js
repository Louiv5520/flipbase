import React, { createContext, useState, useEffect } from 'react';
import analyticsService from '../services/analytics';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse cart data from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Could not save cart data to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id);
      if (existingItem) {
        // If item exists, you might want to increase quantity instead
        // For now, we'll just prevent duplicates
        return prevItems;
      }
      
      // Track analytics
      analyticsService.trackAddToCart(item);
      
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item._id === itemId);
      if (itemToRemove) {
        // Track analytics
        analyticsService.trackRemoveFromCart(itemToRemove);
      }
      return prevItems.filter(item => item._id !== itemId);
    });
  };

  const updateQuantity = (itemId, quantity) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item._id === itemId) {
          const newQuantity = Math.max(1, quantity);
          // Track analytics
          analyticsService.trackUpdateCart(item, newQuantity);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      return updatedItems;
    });
  };
  
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}; 