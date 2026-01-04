import React from 'react';
import GymCard from './GymCard';

const GymList = ({ gyms, loading }) => {
    if (loading) {
        return (
            <div className="gym-grid">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="gym-card skeleton" style={{ height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px' }}></div>
                ))}
            </div>
        );
    }

    if (gyms.length === 0) {
        return (
            <div className="empty-state">
                <h2>No Gyms Found</h2>
                <p>Try adjusting your filters or location to find gyms near you.</p>
            </div>
        );
    }

    return (
        <div className="gym-grid">
            {gyms.map((gym) => (
                <GymCard key={gym.id} gym={gym} />
            ))}
        </div>
    );
};

export default GymList;
