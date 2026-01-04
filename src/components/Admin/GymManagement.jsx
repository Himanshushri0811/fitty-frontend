import React, { useState, useEffect } from 'react';
import API from '../axiosConfig';
import { FaEdit, FaTrash, FaPlus, FaImages } from 'react-icons/fa';

const GymManagement = () => {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentGym, setCurrentGym] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [formData, setFormData] = useState({
        name: '', address: '', city: '', latitude: 0.0, longitude: 0.0,
        rating: 0, price_range_min: 0, price_range_max: 0, facilities: []
    });

    const fetchGyms = async () => {
        try {
            const response = await API.get('/api/admin-panel/gyms/');
            setGyms(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching gyms:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGyms();
    }, []);

    const handleEdit = (gym) => {
        setCurrentGym(gym);
        setFormData({
            ...gym,
            latitude: gym.latitude || 0,
            longitude: gym.longitude || 0
        });
        setSelectedFiles([]);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this gym?")) return;
        try {
            await API.delete(`/api/admin-panel/gyms/${id}/`);
            fetchGyms();
        } catch (error) {
            alert("Error deleting gym.");
        }
    };

    const handleFileChange = (e) => {
        setSelectedFiles([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Use FormData for multiple image uploads
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'facilities') {
                data.append(key, JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        // Add gallery images
        selectedFiles.forEach(file => {
            data.append('gallery_images', file);
        });

        try {
            if (currentGym) {
                await API.put(`/api/admin-panel/gyms/${currentGym.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await API.post('/api/admin-panel/gyms/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowModal(false);
            fetchGyms();
            alert(`Gym ${currentGym ? 'updated' : 'added'} successfully.`);
        } catch (error) {
            console.error("Form error:", error.response?.data);
            alert("Error saving gym details. Please check all fields.");
        }
    };

    if (loading) return <div>Loading gyms...</div>;

    return (
        <div>
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Gym Management</h1>
                    <p>Add, edit, or remove gyms from the platform.</p>
                </div>
                <button className="admin-btn" onClick={() => {
                    setCurrentGym(null);
                    setFormData({ name: '', address: '', city: '', latitude: 0, longitude: 0, rating: 0, price_range_min: 0, price_range_max: 0, facilities: [] });
                    setSelectedFiles([]);
                    setShowModal(true);
                }}>
                    <FaPlus /> Add New Gym
                </button>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Gym Name</th>
                            <th>City</th>
                            <th>Monthly Fee</th>
                            <th>Rating</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gyms.map(gym => (
                            <tr key={gym.id}>
                                <td>{gym.name}</td>
                                <td>{gym.city}</td>
                                <td>₹{gym.price_range_min}</td>
                                <td>⭐ {gym.rating}</td>
                                <td>{gym.is_active ? <span className="badge badge-active">Visible</span> : <span className="badge badge-inactive">Hidden</span>}</td>
                                <td>
                                    <button className="action-btn" onClick={() => handleEdit(gym)}>
                                        <FaEdit />
                                    </button>
                                    <button className="action-btn delete" onClick={() => handleDelete(gym.id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h2>{currentGym ? 'Edit Gym' : 'Add New Gym'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Gym Name</label>
                                <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input className="form-input" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>City</label>
                                    <input className="form-input" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Manual Rating (0-5)</label>
                                    <input className="form-input" type="number" step="0.1" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Min Price</label>
                                    <input className="form-input" type="number" value={formData.price_range_min} onChange={(e) => setFormData({ ...formData, price_range_min: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Max Price</label>
                                    <input className="form-input" type="number" value={formData.price_range_max} onChange={(e) => setFormData({ ...formData, price_range_max: e.target.value })} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaImages /> Gallery Images (Select multiple)
                                </label>
                                <input
                                    className="form-input"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ padding: '8px' }}
                                />
                                {selectedFiles.length > 0 && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--admin-primary)', marginTop: '5px' }}>
                                        {selectedFiles.length} images selected
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="admin-btn">Save Changes</button>
                                <button type="button" className="admin-btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GymManagement;
