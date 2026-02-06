import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, LogOut } from 'lucide-react';

const SettingsTab = () => {
    const { user, updateProfile, logout } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        height: user?.height || '',
        weight: user?.weight || '',
        goal: localStorage.getItem('user_goal') || 'Muscle Building'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // Save to AuthContext and LocalStorage
        updateProfile({ ...user, ...formData });
        localStorage.setItem('user_goal', formData.goal);
        alert("Profile Updated!");
    };

    return (
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '24px' }}>Account Settings</h3>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
                        <input
                            name="name"
                            className="glass"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                            value={formData.name} onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
                        <input
                            name="email"
                            disabled
                            className="glass"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'var(--text-muted)', border: '1px solid var(--border-color)', opacity: 0.7 }}
                            value={formData.email}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Bio</label>
                    <textarea
                        name="bio"
                        rows="3"
                        className="glass"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                        value={formData.bio} onChange={handleChange}
                    />
                </div>

                <div style={{ gridTemplateColumns: '1fr 1fr 1fr', display: 'grid', gap: '20px', marginBottom: '32px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Height (cm)</label>
                        <input
                            name="height" type="number"
                            className="glass"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                            value={formData.height} onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Weight (kg)</label>
                        <input
                            name="weight" type="number"
                            className="glass"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                            value={formData.weight} onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Goal</label>
                        <select
                            name="goal"
                            className="glass"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                            value={formData.goal} onChange={handleChange}
                        >
                            <option>Muscle Building</option>
                            <option>Weight Loss</option>
                            <option>Endurance</option>
                            <option>Flexibility</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" onClick={logout} className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                        <LogOut size={16} style={{ marginRight: '8px' }} /> Logout
                    </button>
                    <button type="submit" className="btn-primary">
                        <Save size={16} style={{ marginRight: '8px' }} /> Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsTab;
