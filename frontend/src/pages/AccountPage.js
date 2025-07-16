import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaUserEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import './AccountPage.css';

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState('');
  
  const fetchUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
      setFormData({
        name: res.data.name || '',
        nickname: res.data.nickname || '',
        company: res.data.company || '',
        gender: res.data.gender || 'Male',
        country: res.data.country || 'Denmark'
      });
    } catch (err) {
      console.error('Failed to fetch user', err);
      setError('Kunne ikke hente brugeroplysninger.');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    try {
      const res = await api.put('/users/me', formData);
      setUser(res.data);
      setIsEditMode(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      setError('Opdatering fejlede. Prøv igen.');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const avatarFormData = new FormData();
    avatarFormData.append('avatar', file);

    try {
        const res = await api.put('/users/me/avatar', avatarFormData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        setUser(res.data); // The backend should return the updated user object
    } catch (err) {
        console.error('Avatar upload failed', err);
        setError('Upload af profilbillede fejlede.');
    }
  };
  
  const getInitials = (name) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    return nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : name.slice(0, 2);
  };

  if (!user) {
    return <div className="loading-container">Indlæser profil...</div>;
  }
  
  return (
    <div className="account-page">
      <div className="account-card">
        
        {/* Left Side: Identity and Avatar */}
        <div className="account-identity">
          <div className="avatar-section">
            {user.profilePicture ? (
              <img src={`/${user.profilePicture}`} alt="Profile" className="avatar-image" />
            ) : (
              <div className="initials-avatar-large">{getInitials(user.name)}</div>
            )}
            <label htmlFor="avatarUpload" className="avatar-upload-button">
              <FaCamera />
              <input type="file" id="avatarUpload" onChange={handleAvatarUpload} accept="image/*" />
            </label>
          </div>
          <h2 className="user-name-display">{user.name}</h2>
          <p className="user-email-display">{user.username}</p>
          <p className="last-login-display">
            Sidst logget ind: {new Date(user.lastLoginDate).toLocaleString('da-DK')}
          </p>
        </div>

        {/* Right Side: Profile Details Form */}
        <div className="account-details">
          <div className="details-header">
            <h3>Profiloplysninger</h3>
            {!isEditMode ? (
              <button className="edit-profile-btn" onClick={() => setIsEditMode(true)}><FaUserEdit /> Redigér</button>
            ) : (
              <div className="edit-mode-actions">
                <button className="cancel-btn" onClick={() => { setIsEditMode(false); fetchUser(); }}><FaTimes /> Annuller</button>
                <button className="save-btn" onClick={handleSaveChanges}><FaSave /> Gem</button>
              </div>
            )}
          </div>
          
          <div className="details-grid">
            <div className="form-group">
              <label>Fulde Navn</label>
              {isEditMode ? (
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
              ) : (
                <p>{user.name}</p>
              )}
            </div>
            <div className="form-group">
              <label>Kaldenavn</label>
              {isEditMode ? (
                <input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} />
              ) : (
                <p>{user.nickname || 'Ikke angivet'}</p>
              )}
            </div>
            <div className="form-group">
              <label>Firma</label>
              {isEditMode ? (
                <input type="text" name="company" value={formData.company} onChange={handleInputChange} />
              ) : (
                <p>{user.company || 'Ikke angivet'}</p>
              )}
            </div>
            <div className="form-group">
              <label>Køn</label>
              {isEditMode ? (
                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                  <option value="Male">Mand</option>
                  <option value="Female">Kvinde</option>
                  <option value="Other">Andet</option>
                </select>
              ) : (
                <p>{user.gender || 'Ikke angivet'}</p>
              )}
            </div>
             <div className="form-group full-width">
              <label>Land</label>
              {isEditMode ? (
                <select name="country" value={formData.country} onChange={handleInputChange}>
                    <option value="Denmark">Danmark</option>
                    <option value="Norway">Norge</option>
                    <option value="Sweden">Sverige</option>
                    <option value="Germany">Tyskland</option>
                    <option value="United Kingdom">Storbritannien</option>
                </select>
              ) : (
                <p>{user.country || 'Ikke angivet'}</p>
              )}
            </div>
          </div>
          {error && <p className="error-message-account">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default AccountPage; 