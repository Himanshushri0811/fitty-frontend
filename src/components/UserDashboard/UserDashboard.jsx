import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Flame,
    Timer,
    TrendingUp,
    Calendar,
    ChevronRight,
    Plus,
    Dumbbell,
    Utensils
} from 'lucide-react';
import StatsChart from './components/StatsChart';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // Mock data for dashboard
    const stats = [
        {
            id: 1,
            label: 'Calories Burned',
            value: '1,284',
            unit: 'kcal',
            icon: Flame,
            color: 'var(--primary)',
            trend: '+12%'
        },
        {
            id: 2,
            label: 'Workouts',
            value: '12',
            unit: 'sessions',
            icon: Dumbbell,
            color: 'var(--secondary)',
            trend: '+2'
        },
        {
            id: 3,
            label: 'Active Minutes',
            value: '340',
            unit: 'min',
            icon: Timer,
            color: '#10b981',
            trend: '+5%'
        },
        {
            id: 4,
            label: 'Current Streak',
            value: '5',
            unit: 'days',
            icon: TrendingUp,
            color: '#f59e0b',
            trend: 'Best: 12'
        }
    ];

    const todaySchedule = [
        { id: 1, title: 'Morning Yoga', time: '07:00 AM', type: 'workout', status: 'completed' },
        { id: 2, title: 'High Protein Lunch', time: '01:00 PM', type: 'diet', status: 'pending' },
        { id: 3, title: 'Evening HIIT', time: '06:00 PM', type: 'workout', status: 'pending' },
    ];

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <header className="dashboard-header animate-fade-in">
                <div className="header-content">
                    <h1>{greeting}, <span className="text-gradient">{user?.name || 'Athlete'}</span></h1>
                    <p className="subtitle">Here's your daily fitness summary.</p>
                </div>
                <div className="header-date">
                    <Calendar size={18} />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
            </header>

            {/* Stats Grid */}
            <section className="stats-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {stats.map((stat) => (
                    <div key={stat.id} className="stat-card glass-panel">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <div className="stat-value-group">
                                <h3 className="stat-value">{stat.value}</h3>
                                <span className="stat-unit">{stat.unit}</span>
                            </div>
                            <span className="stat-trend">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </section>

            {/* Main Content Areas */}
            <div className="dashboard-main-layout">
                {/* Left Column: Chart */}
                <section className="chart-section glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="section-header">
                        <h3>Activity Overview</h3>
                        <select className="chart-filter">
                            <option>This Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <StatsChart />
                </section>

                {/* Right Column: Schedule & Quick Actions */}
                <div className="sidebar-column">

                    {/* Today's Plan */}
                    <section className="schedule-section glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="section-header">
                            <h3>Today's Plan</h3>
                            <button className="btn-link" onClick={() => navigate('/schedule')}>View All</button>
                        </div>
                        <div className="timeline-list">
                            {todaySchedule.map((item) => (
                                <div key={item.id} className={`timeline-item ${item.status}`}>
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <div className="timeline-time">{item.time}</div>
                                        <div className="timeline-title">{item.title}</div>
                                        <div className="timeline-type">{item.type}</div>
                                    </div>
                                    {item.status === 'completed' && <div className="status-badge">Done</div>}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="quick-actions animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <button className="action-card" onClick={() => navigate('/workout')}>
                            <div className="action-icon bg-indigo">
                                <Plus size={20} />
                            </div>
                            <span>Log Workout</span>
                            <ChevronRight size={16} className="arrow" />
                        </button>
                        <button className="action-card" onClick={() => navigate('/diet')}>
                            <div className="action-icon bg-pink">
                                <Utensils size={20} />
                            </div>
                            <span>Log Meal</span>
                            <ChevronRight size={16} className="arrow" />
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
