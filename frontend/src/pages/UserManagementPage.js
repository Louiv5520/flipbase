import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import './UserManagementPage.css';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({});

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            setError('Kunne ikke hente brugere. Du har muligvis ikke adgang.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEdit = (user) => {
        setEditingUser(user._id);
        setFormData({
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
        });
    };

    const handleCancel = () => {
        setEditingUser(null);
        setFormData({});
    };

    const handleSave = async (userId) => {
        try {
            await api.put(`/users/${userId}`, formData);
            setEditingUser(null);
            fetchUsers(); // Refresh user list
        } catch (err) {
            setError(err.response?.data?.msg || 'Opdatering fejlede.');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Er du sikker på, at du vil slette denne bruger? Handlingen kan ikke fortrydes.')) {
            try {
                await api.delete(`/users/${userId}`);
                fetchUsers(); // Refresh user list
            } catch (err) {
                setError(err.response?.data?.msg || 'Sletning fejlede.');
            }
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <div>Indlæser brugere...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="user-management-container">
            <h1>Brugeradministration</h1>
            <div className="user-list-card">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Navn</th>
                            <th>Email</th>
                            <th>Brugernavn</th>
                            <th>Rolle</th>
                            <th>Handlinger</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                {editingUser === user._id ? (
                                    <>
                                        <td><input type="text" name="name" value={formData.name} onChange={handleInputChange} /></td>
                                        <td><input type="email" name="email" value={formData.email} onChange={handleInputChange} /></td>
                                        <td><input type="text" name="username" value={formData.username} onChange={handleInputChange} /></td>
                                        <td>
                                            <select name="role" value={formData.role} onChange={handleInputChange}>
                                                <option value="user">Bruger</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button onClick={() => handleSave(user._id)} className="action-btn save"><FaSave /></button>
                                            <button onClick={handleCancel} className="action-btn cancel"><FaTimes /></button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.username}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <button onClick={() => handleEdit(user)} className="action-btn edit"><FaEdit /></button>
                                            <button onClick={() => handleDelete(user._id)} className="action-btn delete"><FaTrash /></button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementPage; 