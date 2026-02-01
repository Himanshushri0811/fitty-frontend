import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SmartBox/SmartBox.css'; // Correct path

const FoodDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await axios.get(`http://localhost:8000/api/diet/foods/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFood(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="detail-loading">🔎 Researching Food Details...</div>;
    if (!food) return <div className="detail-error">Food not found.</div>;

    const { deep_dive } = food;

    return (
        <div className="food-detail-page">
            <button className="back-btn-float" onClick={() => navigate('/diet')}>← Back</button>

            {/* HERO SECTION */}
            <div className="detail-hero" style={{ backgroundImage: `url(${food.image_url})` }}>
                <div className="detail-hero-content">
                    <h1>{food.name}</h1>
                    <div className="detail-badges">
                        <span className="badge-cal">🔥 {food.calories} kcal</span>
                        <span className="badge-pro">💪 {food.protein}g Protein</span>
                    </div>
                </div>
            </div>

            <div className="detail-container">
                {/* AI RESEARCH SECTION */}
                <div className="research-status">
                    <span className="ai-icon">✨</span> AI Research Complete
                </div>

                <div className="detail-section">
                    <h3>📜 History & Profile</h3>
                    <p>{deep_dive?.long_description || food.description}</p>
                    <div className="fun-fact">
                        <strong>💡 Fun Fact:</strong> {deep_dive?.fun_fact}
                    </div>
                </div>

                <div className="detail-grid">
                    <div className="detail-card">
                        <h3>💚 Health Benefits</h3>
                        <ul>
                            {deep_dive?.health_benefits_detailed?.map((b, i) => (
                                <li key={i}>{b}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="detail-card">
                        <h3>⚠️ Who Should Avoid</h3>
                        <p>{deep_dive?.who_should_avoid}</p>
                    </div>

                    <div className="detail-card">
                        <h3>⏰ Best Time to Eat</h3>
                        <p>{deep_dive?.best_time_to_eat}</p>
                    </div>
                </div>

                <div className="detail-section">
                    <h3>👨‍🍳 Chef's Recipes</h3>
                    <div className="recipes-list">
                        {deep_dive?.recipes?.map((recipe, i) => (
                            <div key={i} className="recipe-card">
                                <h4>{recipe.name}</h4>
                                <ol>
                                    {recipe.steps?.map((step, j) => (
                                        <li key={j}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodDetail;
