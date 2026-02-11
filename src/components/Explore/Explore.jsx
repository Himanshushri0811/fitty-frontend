import React, { useState, useEffect, useCallback } from 'react';
import API from '../axiosConfig';
import GymList from './GymList';
import './Explore.css';
import { FaSearch, FaFire, FaCalendarAlt, FaDumbbell, FaCheckCircle, FaClock } from 'react-icons/fa';

const SocialFeed = React.lazy(() => import('../Social/SocialFeed'));


const Explore = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');
    const [search, setSearch] = useState('');
    const [gyms, setGyms] = useState([]);
    const [gymLoading, setGymLoading] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await API.get('/api/explore/dashboard/');
            setDashboardData(response.data);
        } catch (error) {
            console.error("Error fetching dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (type, id) => {
        try {
            const response = await API.post(`/api/explore/${type}s/${id}/join/`);
            if (response.data.status === 'joined') {
                alert(`Successfully joined the ${type}!`);
                fetchDashboard(); // Refresh data to show 'joined' status
            } else {
                alert(`You have already joined this ${type}.`);
            }
        } catch (error) {
            console.error(`Error joining ${type}:`, error);
            alert("Failed to join. Please try again.");
        }
    };

    // Gym Tab Logic
    useEffect(() => {
        if (activeTab === 'Gyms' && gyms.length === 0) {
            setGymLoading(true);
            API.get('/api/explore/gyms/')
                .then(res => setGyms(res.data.results || res.data))
                .catch(err => console.error(err))
                .finally(() => setGymLoading(false));
        }
    }, [activeTab]);

    const tabs = ['Overview', 'Community', 'Events', 'Challenges', 'Workouts', 'Gyms'];

    const renderContent = () => {
        if (loading) {
            return (
                <div className="explore-content">
                    <SkeletonSection />
                    <SkeletonSection />
                </div>
            );
        }

        if (activeTab === 'Community') {
            return (
                <div className="fade-in">
                    <React.Suspense fallback={<div className="explore-content"><SkeletonSection /></div>}>
                        <SocialFeed />
                    </React.Suspense>
                </div>
            );
        }

        if (activeTab === 'Gyms') {
            return <GymList gyms={gyms} loading={gymLoading} />;
        }

        // Helper to filter items if search is active (simple client-side filter for demo)
        const filterItems = (items) => {
            if (!search) return items;
            return items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
        };

        const events = filterItems(dashboardData?.events || []);
        const challenges = filterItems(dashboardData?.challenges || []);
        const articles = filterItems(dashboardData?.articles || []);

        return (
            <div className="explore-content fade-in">
                {/* Events Section */}
                {(activeTab === 'Overview' || activeTab === 'Events') && events.length > 0 && (
                    <Section title={activeTab === 'Events' ? 'All Events' : 'Upcoming Events'} icon={<FaCalendarAlt />}>
                        <div className="horizontal-scroll">
                            {events.map(event => (
                                <EventCard key={event.id} event={event} onJoin={() => handleJoin('event', event.id)} />
                            ))}
                        </div>
                    </Section>
                )}

                {/* Challenges Section */}
                {(activeTab === 'Overview' || activeTab === 'Challenges') && challenges.length > 0 && (
                    <Section title={activeTab === 'Challenges' ? 'All Challenges' : 'Trending Challenges'} icon={<FaFire />}>
                        <div className="horizontal-scroll">
                            {challenges.map(challenge => (
                                <ChallengeCard key={challenge.id} challenge={challenge} onJoin={() => handleJoin('challenge', challenge.id)} />
                            ))}
                        </div>
                    </Section>
                )}

                {/* Articles Section */}
                {(activeTab === 'Overview' || activeTab === 'Workouts') && articles.length > 0 && (
                    <Section title="Expert Tips & Articles" icon={<FaDumbbell />}>
                        <div className="horizontal-scroll">
                            {articles.map(article => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    </Section>
                )}

                {/* Empty State */}
                {activeTab === 'Overview' && (!events.length && !challenges.length) && (
                    <div style={{ textAlign: 'center', marginTop: '50px', color: '#94a3b8' }}>
                        <h3>No content available right now.</h3>
                        <p>Check back later for new events!</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="explore-container">
            <header className="explore-header">
                <h1>Explore FitMitra</h1>
                <p>Discover personalized events, challenges, and fitness hubs.</p>
            </header>

            <div className="explore-nav">
                <div className="search-bar-wrapper">
                    <FaSearch className="search-icon" style={{ position: 'absolute', left: '1.2rem', top: '1.1rem', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search for events, trainers, or challenges..."
                        className="search-input"
                        style={{ paddingLeft: '3rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="category-chips">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`chip ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {renderContent()}
        </div>
    );
};

// Sub-Components

const Section = ({ title, children, icon }) => (
    <div className="explore-section">
        <div className="section-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {icon} <span>{title}</span>
            </div>
            <span className="view-all">View All</span>
        </div>
        {children}
    </div>
);

const SkeletonSection = () => (
    <div className="explore-section" style={{ marginBottom: '3rem' }}>
        <div className="skeleton" style={{ width: '200px', height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '20px' }}></div>
        <div className="horizontal-scroll">
            {[1, 2, 3].map(i => (
                <div key={i} className="" style={{ minWidth: '300px', height: '350px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', flexShrink: 0 }}></div>
            ))}
        </div>
    </div>
);

const Countdown = ({ targetDate }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(targetDate) - +new Date();
        if (difference > 0) {
            return {
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
            };
        }
        return null; // Time is up
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    if (!timeLeft) return <span>Now Live!</span>;

    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
            <FaClock size={12} /> Starts in: {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m
        </span>
    );
};

const EventCard = ({ event, onJoin }) => (
    <div className="content-card">
        {event.banner && <img src={event.banner} alt={event.title} className="card-banner" />}
        {!event.banner && <div className="card-banner" style={{ background: 'linear-gradient(45deg, #1e293b, #334155)' }} />}

        <span className="card-overlay">
            {event.status === 'live' ? '🔴 Live' : <Countdown targetDate={event.start_time} />}
        </span>

        <div className="card-content">
            <h3 className="card-title">{event.title}</h3>
            <p className="card-desc">{event.description}</p>
            <div className="card-meta">
                <span>{event.participants_count} joined</span>
                <span>{event.trainer?.name}</span>
            </div>
            <button
                className="join-btn"
                onClick={onJoin}
                disabled={event.is_joined}
                style={{ opacity: event.is_joined ? 0.6 : 1 }}
            >
                {event.is_joined ? <><FaCheckCircle /> Joined</> : 'Register Now'}
            </button>
        </div>
    </div>
);

const ChallengeCard = ({ challenge, onJoin }) => (
    <div className="content-card">
        {challenge.banner && <img src={challenge.banner} alt={challenge.title} className="card-banner" />}
        {!challenge.banner && <div className="card-banner" style={{ background: 'linear-gradient(45deg, #4f46e5, #06b6d4)' }} />}
        <span className="card-overlay">{challenge.duration_days} Days</span>
        <div className="card-content">
            <h3 className="card-title">{challenge.title}</h3>
            <p className="card-desc">{challenge.description}</p>
            <div className="card-meta">
                <span>{challenge.difficulty}</span>
            </div>
            <button
                className="join-btn"
                onClick={onJoin}
                disabled={challenge.is_joined}
                style={{ opacity: challenge.is_joined ? 0.6 : 1 }}
            >
                {challenge.is_joined ? <><FaCheckCircle /> Joined</> : 'Join Challenge'}
            </button>
        </div>
    </div>
);

const ArticleCard = ({ article }) => (
    <div className="content-card">
        {article.image && <img src={article.image} alt={article.title} className="card-banner" />}
        {!article.image && <div className="card-banner" style={{ background: 'linear-gradient(45deg, #ec4899, #8b5cf6)' }} />}
        <div className="card-content">
            <h3 className="card-title">{article.title}</h3>
            <p className="card-desc">{article.content.substring(0, 100)}...</p>
            <div className="card-meta">
                <span>By {article.author?.name}</span>
                <span>{article.read_time_minutes} min read</span>
            </div>
            <button className="join-btn">Read Article</button>
        </div>
    </div>
);

export default Explore;
