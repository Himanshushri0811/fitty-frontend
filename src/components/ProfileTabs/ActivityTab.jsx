import React from 'react';
import { Activity, Calendar } from 'lucide-react';

const ActivityTab = () => {
    const history = [
        { id: 1, date: 'Today, 8:00 AM', title: 'Morning Yoga', duration: '45 min', cal: '320', type: 'Yoga' },
        { id: 2, date: 'Yesterday, 6:00 PM', title: 'HIIT Cardio', duration: '30 min', cal: '450', type: 'Cardio' },
        { id: 3, date: 'Mon, 12 Feb', title: 'Full Body Strength', duration: '60 min', cal: '500', type: 'Strength' },
        { id: 4, date: 'Sun, 11 Feb', title: 'Rest Day', duration: '0 min', cal: '0', type: 'Rest' },
    ];

    return (
        <div className="glass-card">
            <h3 style={{ marginBottom: '20px' }}>Activity History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {history.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '10px' }}>
                                <Activity size={20} color="var(--primary)" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>{item.title}</h4>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={12} /> {item.date}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '700', color: 'var(--success)' }}>+{item.cal} kcal</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.duration}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityTab;
