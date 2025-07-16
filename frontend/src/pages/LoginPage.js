import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { username, password } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    const user = {
      username,
      password,
    };

    try {
      const res = await api.post('/auth/login', user);
      localStorage.setItem('token', res.data.token);
      navigate('/crm'); // Redirect to CRM dashboard
    } catch (err) {
      setError(err.response ? err.response.data.msg : 'Login Fejlede');
      console.error('Login failed:', err.response ? err.response.data.msg : err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Log ind</h1>
        <div className="login-form">
          <h2>Log ind på din konto</h2>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="username">Email eller Brugernavn</label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={onChange}
                required
                placeholder="f.eks. john@firma.dk"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Adgangskode</label>
              <input
                type="password"
                id="password"
                placeholder="Adgangskode"
                name="password"
                value={password}
                onChange={onChange}
                minLength="6"
                required
                autoComplete="off"
              />
            </div>
            <button type="submit" className="login-button">Log ind</button>
            {error && <div className="login-error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;