import React from 'react';
import { Trophy, Target, Zap } from 'lucide-react';

const OverviewTab = () => {
    // In real app, fetch these from API
    const stats = [
        { label: "Total Workouts", value: "42", icon: Trophy, color: "#f59e0b" },
        { label: "Weight Goal", value: "70 kg", sub: "Current: 75kg", icon: Target, color: "#ef4444" },
        { label: "Fitness Score", value: "780", icon: Zap, color: "#6366f1" }
    ];

    return (
        <div className="tab-content">
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ padding: '12px', background: `${stat.color}20`, borderRadius: '12px', color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>{stat.value}</div>
                            {stat.sub && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stat.sub}</div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Achievements */}
            <div className="glass-card">
                <h3 style={{ marginBottom: '20px' }}>Recent Achievements</h3>
                <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ minWidth: '200px', padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                            <div style={{ width: '60px', height: '60px', margin: '0 auto 12px', background: 'gold', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                🏆
                            </div>
                            <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Early Bird</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed 5 workouts before 8 AM</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
