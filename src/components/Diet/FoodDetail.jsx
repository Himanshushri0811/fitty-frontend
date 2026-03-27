import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../axiosConfig';
import './FoodDetail.css';

const FoodDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await API.get(`/api/diet/foods/${id}/`);
                setFood(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return (
        <div className="food-detail-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginLeft: '1rem' }}>Analyzing Food Profile...</p>
        </div>
    );

    if (!food) return <div className="detail-error">Food not found.</div>;

    const { deep_dive } = food;

    return (
        <div className="food-detail-page animate-fade-in">
            <button className="back-btn-float" onClick={() => navigate('/diet')}>
                <span>←</span> Back to Diet
            </button>

            {/* 1. IMMERSIVE HERO */}
            <div className="detail-hero" style={{ backgroundImage: `url(${food.image_url})` }}>
                <div className="detail-hero-content">
                    <div>
                        <h1>{food.name}</h1>
                        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', maxWidth: '600px', marginTop: '0.5rem' }}>
                            {food.description || deep_dive?.long_description?.substring(0, 100) + "..."}
                        </p>
                    </div>

                    <div className="detail-badges">
                        <div className="detail-badge badge-cal">🔥 {food.calories} kcal</div>
                        <div className="detail-badge badge-pro">💪 {food.protein}g Protein</div>
                        <div className="detail-badge badge-macro">🍞 {food.carbs}g Carbs</div>
                        <div className="detail-badge badge-macro">🥑 {food.fats}g Fat</div>
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT GRID */}
            <div className="detail-container">

                {/* A. Overview & Profile */}
                <div className="detail-section-card">
                    <h3>📜 Nutritional Profile & History</h3>
                    <p className="section-text">
                        {deep_dive?.long_description || food.description || "Detailed description unavailable."}
                    </p>

                    {deep_dive?.fun_fact && (
                        <div className="fun-fact-box">
                            <span className="fun-fact-icon">💡</span>
                            <div className="fun-fact-text">
                                <strong>Did You Know?</strong>
                                {deep_dive.fun_fact}
                            </div>
                        </div>
                    )}
                </div>

                {/* B. Key Statistics Grid */}
                <div className="info-grid">
                    <div className="info-card">
                        <h4>💚 Health Benefits</h4>
                        <ul className="benefits-list">
                            {(deep_dive?.health_benefits_detailed || food.benefits || []).slice(0, 4).map((b, i) => (
                                <li key={i}>{b}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="info-card" style={{ borderLeft: '3px solid #ef4444' }}>
                        <h4>⚠️ Who Should Avoid</h4>
                        <div className="card-content">
                            {Array.isArray(deep_dive?.who_should_avoid)
                                ? deep_dive.who_should_avoid.join(", ")
                                : (deep_dive?.who_should_avoid || "Generally safe for everyone.")}
                        </div>
                    </div>

                    <div className="info-card" style={{ borderLeft: '3px solid #3b82f6' }}>
                        <h4>⏰ Best Time to Eat</h4>
                        <div className="card-content">
                            {Array.isArray(deep_dive?.best_time_to_eat)
                                ? deep_dive.best_time_to_eat.join(", ")
                                : (deep_dive?.best_time_to_eat || food.best_time?.join(", ") || "Anytime")}
                        </div>
                    </div>
                </div>

                {/* C. Chef's Recipes */}
                {deep_dive?.recipes && deep_dive.recipes.length > 0 && (
                    <div className="detail-section-card">
                        <h3>👨‍🍳 Chef's Recommendations</h3>
                        <div className="recipe-grid">
                            {deep_dive.recipes.map((recipe, i) => (
                                <div key={i} className="recipe-card">
                                    <h4>{recipe.name}</h4>
                                    <ol className="recipe-steps">
                                        {recipe.steps?.map((step, j) => (
                                            <li key={j}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default FoodDetail;
