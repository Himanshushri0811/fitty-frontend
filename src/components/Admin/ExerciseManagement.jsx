import React, { useState, useEffect } from 'react';
import API from '../axiosConfig';
import { FaPlus, FaEdit, FaVideo, FaRobot } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminPanel.css'; // Reusing existing admin styles

const ExerciseManagement = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        target_muscle: '',
        demo_video_url: '',
        pose_config_str: '' // We'll parse/stringify JSON here
    });

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const res = await API.get('/api/fitness/exercises/');
            setExercises(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch exercises", err);
            setLoading(false);
        }
    };

    const handleEdit = (ex) => {
        setEditingExercise(ex);
        setFormData({
            name: ex.name,
            target_muscle: ex.target_muscle || '',
            demo_video_url: ex.demo_video_url || '',
            pose_config_str: ex.pose_config ? JSON.stringify(ex.pose_config, null, 2) : ''
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingExercise(null);
        setFormData({
            name: '',
            target_muscle: '',
            demo_video_url: '',
            pose_config_str: ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let pose_config = {};
        try {
            if (formData.pose_config_str.trim()) {
                pose_config = JSON.parse(formData.pose_config_str);
            }
        } catch (err) {
            alert("Invalid JSON for AI Rules.");
            return;
        }

        const payload = {
            name: formData.name,
            target_muscle: formData.target_muscle,
            demo_video_url: formData.demo_video_url,
            pose_config: pose_config
        };

        try {
            if (editingExercise) {
                // Update
                const res = await API.put(`/api/fitness/exercises/${editingExercise.name}/`, payload);
                setExercises(exercises.map(ex => ex.id === editingExercise.id ? res.data : ex));
            } else {
                // Create
                const res = await API.post('/api/fitness/exercises/', payload);
                setExercises([...exercises, res.data]);
            }
            setShowModal(false);
        } catch (err) {
            console.error("Failed to save exercise", err);
            alert("Failed to save.");
        }
    };

    if (loading) return <div className="admin-loading">Loading Exercises...</div>;

    return (
        <div className="admin-content-wrapper">
            <header className="admin-header">
                <h1>Exercise Library & AI Config</h1>
                <button className="admin-btn-primary" onClick={handleAdd}>
                    <FaPlus /> Add Exercise
                </button>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Muscle</th>
                            <th>AI Ready?</th>
                            <th>Video?</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exercises.map(ex => (
                            <tr key={ex.id}>
                                <td>{ex.name}</td>
                                <td>{ex.target_muscle}</td>
                                <td>
                                    {ex.pose_config && Object.keys(ex.pose_config).length > 0 ? (
                                        <span className="status-badge active"><FaRobot /> Yes</span>
                                    ) : (
                                        <span className="status-badge inactive">No</span>
                                    )}
                                </td>
                                <td>
                                    {ex.demo_video_url ? (
                                        <span className="status-badge success"><FaVideo /> Yes</span>
                                    ) : (
                                        <span className="status-badge warning">No</span>
                                    )}
                                </td>
                                <td>
                                    <button className="icon-btn" onClick={() => handleEdit(ex)}><FaEdit /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="admin-modal" initial={{ y: 20 }} animate={{ y: 0 }}>
                            <h2>{editingExercise ? 'Edit Exercise' : 'New Exercise'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Exercise Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        disabled={!!editingExercise} // Name is ID for now in backend logic updates
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Target Muscle</label>
                                    <input
                                        value={formData.target_muscle}
                                        onChange={e => setFormData({ ...formData, target_muscle: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Demo Video URL</label>
                                    <input
                                        value={formData.demo_video_url}
                                        onChange={e => setFormData({ ...formData, demo_video_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>AI Rules (JSON Config)</label>
                                    <textarea
                                        rows={10}
                                        value={formData.pose_config_str}
                                        onChange={e => setFormData({ ...formData, pose_config_str: e.target.value })}
                                        placeholder='{"keypoints": "[...]", "rules": "[...]"}'
                                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                                    />
                                    <small>Paste JSON configuration for Posture Detector here.</small>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                    <button type="submit" className="btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExerciseManagement;
