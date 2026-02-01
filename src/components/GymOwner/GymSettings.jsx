import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdSave, MdArrowBack, MdBusiness, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import API from '../axiosConfig';
import { useAuth } from '../../context/AuthContext';
import './GymSettings.css';

const GymSettings = () => {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth(); // Assuming updateProfile exists or we manually update

    const [formData, setFormData] = useState({
        gym_name: '',
        owner_name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        // Pre-fill from user context or fetch fresh profile
        if (user) {
            setFormData({
                gym_name: user.gym_name || '',
                owner_name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
        // Ideally fetch fresh data
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await API.get('/api/gym/profile/');
            setFormData(prev => ({ ...prev, ...res.data }));
        } catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');

        try {
            await API.put('/api/gym/profile/', formData);
            setSuccessMsg('Settings updated successfully!');
            // updateProfile(formData); // Update local context if function exists
        } catch (err) {
            console.error(err);
            alert("Failed to update settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gym-settings-container">
            <header className="settings-header">
                <button className="back-btn" onClick={() => navigate('/gym-dashboard')}>
                    <MdArrowBack /> Back
                </button>
                <h1>Gym Settings</h1>
            </header>

            <div className="settings-content">
                <motion.div
                    className="settings-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="form-header">
                        <h2>General Information</h2>
                        <p>Manage your gym's public profile and contact details.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><MdBusiness /> Gym Name</label>
                            <input
                                type="text"
                                name="gym_name"
                                value={formData.gym_name}
                                onChange={handleChange}
                                placeholder="e.g. Iron Paradise"
                            />
                        </div>

                        <div className="form-group">
                            <label><MdEmail /> Email Address (Read Only)</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="disabled-input"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><MdPhone /> Owner Name</label>
                                <input
                                    type="text"
                                    name="owner_name"
                                    value={formData.owner_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label><MdPhone /> Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label><MdLocationOn /> Address / Location</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Gym Address..."
                            />
                        </div>

                        {successMsg && <div className="success-msg">{successMsg}</div>}

                        <div className="form-actions">
                            <button type="submit" className="save-btn" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'} <MdSave />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default GymSettings;
