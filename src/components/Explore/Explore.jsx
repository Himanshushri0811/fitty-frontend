import React, { useState, useEffect, useCallback } from 'react';
import API from '../axiosConfig';
import GymList from './GymList';
import './Explore.css';

const Explore = () => {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [ordering, setOrdering] = useState('distance');
    const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error

    const fetchGyms = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                search: search,
                ordering: ordering === 'distance' ? 'distance' : (ordering === 'price' ? 'price_range_min' : '-rating'),
            };

            const response = await API.get('/api/explore/gyms/', { params });
            setGyms(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching gyms:", error);
        } finally {
            setLoading(false);
        }
    }, [search, ordering]);

    useEffect(() => {
        fetchGyms();
    }, [fetchGyms]);

    const handleLocationAccess = () => {
        setLocationStatus('loading');
        if (!navigator.geolocation) {
            setLocationStatus('error');
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationStatus('success');
                // In a real production app, we would send these coords to the API
                console.log("Latitude:", position.coords.latitude, "Longitude:", position.coords.longitude);
                // fetchGyms(position.coords.latitude, position.coords.longitude);
            },
            () => {
                setLocationStatus('error');
                alert("Unable to retrieve your location. Please check permissions.");
            }
        );
    };

    return (
        <div className="explore-container">
            <header className="explore-header">
                <h1>Discover Fitness Near You</h1>
                <p>Premium gyms, trainers, and studios tailored to your goals.</p>
            </header>

            <div className="filter-bar">
                <input
                    type="text"
                    placeholder="Search gym name or city..."
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="filter-group">
                    <select
                        className="filter-select"
                        value={ordering}
                        onChange={(e) => setOrdering(e.target.value)}
                    >
                        <option value="distance">Near Me</option>
                        <option value="rating">Top Rated</option>
                        <option value="price">Budget Friendly</option>
                    </select>

                    <button
                        className="location-btn"
                        onClick={handleLocationAccess}
                        disabled={locationStatus === 'loading'}
                    >
                        {locationStatus === 'loading' ? 'Locating...' : 'Use Precise Location'}
                    </button>
                </div>
            </div>

            <GymList gyms={gyms} loading={loading} />
        </div>
    );
};

export default Explore;
