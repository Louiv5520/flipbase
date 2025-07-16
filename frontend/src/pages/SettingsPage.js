import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import api from '../api';
import './SettingsPage.css';
import { FaMoon, FaSun, FaLock, FaUserPlus } from 'react-icons/fa';

const SettingsPage = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [currentUser, setCurrentUser] = useState(null);
    const [newUser, setNewUser] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        company: '',
        role: 'user', // Default role
    });
    const [userCreationMessage, setUserCreationMessage] = useState('');
    const [userCreationError, setUserCreationError] = useState('');

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await api.get('/users/me');
                setCurrentUser(res.data);
            } catch (error) {
                console.error("Kunne ikke hente brugeroplysninger", error);
                setPasswordError("Kunne ikke verificere bruger-session.");
            }
        };
        fetchCurrentUser();
    }, []);

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Den nye adgangskode stemmer ikke overens.');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Den nye adgangskode skal være på mindst 6 tegn.');
            return;
        }

        try {
            const res = await api.post('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setPasswordMessage(res.data.msg);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordError(err.response?.data?.msg || 'Noget gik galt. Prøv igen.');
        }
    };

    const handleNewUserChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleNewUserSubmit = async (e) => {
        e.preventDefault();
        setUserCreationError('');
        setUserCreationMessage('');
        try {
            const res = await api.post('/users', newUser);
            setUserCreationMessage(res.data.msg);
            setNewUser({ name: '', username: '', email: '', password: '', company: '', role: 'user' });
        } catch (err) {
            const errorMsg = err.response?.data?.errors 
                ? err.response.data.errors.map(e => e.msg).join(', ') 
                : (err.response?.data?.msg || 'Kunne ikke oprette bruger.');
            setUserCreationError(errorMsg);
        }
    };

    return (
        <div className="settings-page-container">
            <h1>Indstillinger</h1>

            {/* --- Appearance Settings --- */}
            <div className="settings-card">
                <h2><FaSun /> Udseende</h2>
                <div className="setting-item">
                    <p>Skift mellem lyst og mørkt tema for at tilpasse din visuelle oplevelse.</p>
                    <button onClick={toggleTheme} className="theme-toggle-button-settings">
                        {theme === 'light' ? <><FaMoon /> Skift til Mørkt Tema</> : <><FaSun /> Skift til Lyst Tema</>}
                    </button>
                </div>
            </div>

            {/* --- Security Settings --- */}
            <div className="settings-card">
                <h2><FaLock /> Sikkerhed</h2>
                <div className="setting-item">
                    <p>Opdater din adgangskode regelmæssigt for at beskytte din konto.</p>
                    <form onSubmit={handlePasswordSubmit} className="password-form">
                        <div className="form-group-settings">
                            <label htmlFor="currentPassword">Nuværende Adgangskode</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group-settings">
                            <label htmlFor="newPassword">Ny Adgangskode</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group-settings">
                            <label htmlFor="confirmPassword">Bekræft Ny Adgangskode</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <button type="submit" className="save-password-btn">Opdater Adgangskode</button>
                    </form>
                    {passwordMessage && <p className="success-message">{passwordMessage}</p>}
                    {passwordError && <p className="error-message">{passwordError}</p>}
                </div>
            </div>

            {/* --- User Management (Admin Only) --- */}
            {currentUser && currentUser.role === 'admin' && (
                <div className="settings-card">
                    <h2><FaUserPlus /> Brugeradministration</h2>
                    <div className="setting-item">
                        <p>Opret nye brugere til systemet her.</p>
                        <form onSubmit={handleNewUserSubmit} className="password-form">
                             <div className="form-group-settings">
                                <label htmlFor="name">Fulde Navn</label>
                                <input type="text" id="name" name="name" value={newUser.name} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group-settings">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" value={newUser.email} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group-settings">
                                <label htmlFor="company">Firma</label>
                                <input type="text" id="company" name="company" value={newUser.company} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group-settings">
                                <label htmlFor="username">Brugernavn</label>
                                <input type="text" id="username" name="username" value={newUser.username} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group-settings">
                                <label htmlFor="password">Adgangskode</label>
                                <input type="password" id="password" name="password" value={newUser.password} onChange={handleNewUserChange} required />
                            </div>
                            <button type="submit" className="save-password-btn">Opret Bruger</button>
                        </form>
                        {userCreationMessage && <p className="success-message">{userCreationMessage}</p>}
                        {userCreationError && <p className="error-message">{userCreationError}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage; 