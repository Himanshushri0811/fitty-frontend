import React from 'react';
import { UserPlus, MessageCircle } from 'lucide-react';

const CommunityTab = () => {
    const friends = [
        { id: 1, name: "Sarah Connor", status: "In a workout", avatar: "https://ui-avatars.com/api/?name=Sarah&background=random" },
        { id: 2, name: "John Wick", status: "Online", avatar: "https://ui-avatars.com/api/?name=John&background=random" },
        { id: 3, name: "Bruce Wayne", status: "Last seen 2h ago", avatar: "https://ui-avatars.com/api/?name=Bruce&background=random" },
    ];

    return (
        <div>
            <div className="glass-card" style={{ marginBottom: '24px' }}>
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3>Your Squad</h3>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        <UserPlus size={16} style={{ marginRight: '6px' }} /> Invite
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {friends.map(f => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', background: 'var(--bg-main)' }}>
                            <img src={f.avatar} alt={f.name} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '1rem' }}>{f.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: f.status.includes('Online') ? 'var(--success)' : 'var(--text-muted)' }}>{f.status}</p>
                            </div>
                            <button className="btn-secondary" style={{ padding: '8px' }}>
                                <MessageCircle size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommunityTab;
