import React, { useState, useEffect } from 'react';
import API from '../axiosConfig';
import { FaPlus, FaEdit, FaVideo, FaRobot, FaTrash } from 'react-icons/fa';
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
        target_muscle_group: '',
        video_url: '',
        equipment_type: 'None',
        posture_config_str: '' // We'll parse/stringify JSON here
    });

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const res = await API.get('/api/workouts/exercises/');
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
            target_muscle_group: ex.muscle || '',
            video_url: ex.video_url || '',
            equipment_type: ex.equipment || 'None',
            posture_config_str: ex.posture_config ? JSON.stringify(ex.posture_config, null, 2) : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await API.delete(`/api/workouts/exercises/${id}/`);
            setExercises(exercises.filter(e => e.id !== id));
        } catch (err) {
            alert("Failed to delete.");
        }
    };

    const handleAdd = () => {
        setEditingExercise(null);
        setFormData({
            name: '',
            target_muscle_group: '',
            video_url: '',
            equipment_type: 'None',
            posture_config_str: ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let posture_config = [];
        try {
            if (formData.posture_config_str.trim()) {
                posture_config = JSON.parse(formData.posture_config_str);
            }
        } catch (err) {
            alert("Invalid JSON for AI Rules.");
            return;
        }

        const payload = {
            name: formData.name,
            target_muscle_group: formData.target_muscle_group,
            video_url: formData.video_url,
            equipment_type: formData.equipment_type,
            posture_config: posture_config
        };

        try {
            if (editingExercise) {
                // Update
                await API.put(`/api/workouts/exercises/${editingExercise.id}/`, payload);
                fetchExercises(); // Refresh list to get updated structure
            } else {
                // Create
                await API.post('/api/workouts/exercises/', payload);
                fetchExercises();
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
                            <th>Equipment</th>
                            <th>AI Ready?</th>
                            <th>Video?</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exercises.map(ex => (
                            <tr key={ex.id}>
                                <td>{ex.name}</td>
                                <td>{ex.muscle}</td>
                                <td>{ex.equipment}</td>
                                <td>
                                    {ex.posture_config && ex.posture_config.length > 0 ? (
                                        <span className="status-badge active"><FaRobot /> Yes</span>
                                    ) : (
                                        <span className="status-badge inactive">No</span>
                                    )}
                                </td>
                                <td>
                                    {ex.video_url ? (
                                        <span className="status-badge success"><FaVideo /> Yes</span>
                                    ) : (
                                        <span className="status-badge warning">No</span>
                                    )}
                                </td>
                                <td>
                                    <button className="icon-btn" onClick={() => handleEdit(ex)}><FaEdit /></button>
                                    <button className="icon-btn danger" onClick={() => handleDelete(ex.id)}><FaTrash /></button>
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
                                        disabled={!!editingExercise} // Name shouldn't change easily? Or allow it.
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Target Muscle</label>
                                    <select
                                        value={formData.target_muscle_group}
                                        onChange={e => setFormData({ ...formData, target_muscle_group: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Chest">Chest</option>
                                        <option value="Back">Back</option>
                                        <option value="Legs">Legs</option>
                                        <option value="Shoulders">Shoulders</option>
                                        <option value="Arms">Arms</option>
                                        <option value="Core">Core</option>
                                        <option value="Cardio">Cardio</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Equipment</label>
                                    <select
                                        value={formData.equipment_type}
                                        onChange={e => setFormData({ ...formData, equipment_type: e.target.value })}
                                    >
                                        <option value="None">None (Bodyweight)</option>
                                        <option value="Dumbbell">Dumbbell</option>
                                        <option value="Barbell">Barbell</option>
                                        <option value="Machine">Machine</option>
                                        <option value="Cable">Cable</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Demo Video URL</label>
                                    <input
                                        value={formData.video_url}
                                        onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>AI Rules (JSON Config)</label>
                                    <textarea
                                        rows={10}
                                        value={formData.posture_config_str}
                                        onChange={e => setFormData({ ...formData, posture_config_str: e.target.value })}
                                        placeholder={'[\n  {\n    "name": "Knee Angle",\n    "keypoints": [23, 25, 27],\n    "min": 70,\n    "max": 110,\n    "message": {"unsafe": "Too low!"}\n  }\n]'}
                                        style={{ fontFamily: 'monospace', fontSize: '12px', background: '#222', color: '#0f0' }}
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
