import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Use relative path for proxying
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = (userData) => api.post('/auth/login', userData);
export const getMyProfile = () => api.get('/users/me');

// Add a new function to fetch inventory items for the shop
export const getShopInventory = () => api.get('/bids/inventory');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export default api; 