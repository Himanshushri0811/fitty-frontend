import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { fetchDietCarousel } from '../../../services/dietService';
import RobotAssistant from './RobotAssistant';
import './SmartBox.css';

const DietSmartBox = () => {
    const navigate = useNavigate();
    const [foods, setFoods] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false); // To drive Robot animation

    // TTS Refs
    const speechRef = useRef(null);
    const isSpeakingRef = useRef(false);

    // 1. Fetch Carousel Data
    useEffect(() => {
        const fetchCarousel = async () => {
            try {
                const data = await fetchDietCarousel();
                if (data && data.length > 0) {
                    setFoods(data);
                }
            } catch (err) {
                console.error("SmartBox Fetch Error", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCarousel();
    }, []);

    // 2. TTS Logic
    const speak = (text) => {
        if (!window.speechSynthesis) return;

        // Cancel previous
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Voice Selection: Try to find a Hindi or Indian English voice
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('India'));
        if (hindiVoice) utterance.voice = hindiVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            isSpeakingRef.current = true;
            setIsSpeaking(true);
        };
        utterance.onend = () => {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            isSpeakingRef.current = false;
        }
    };

    // 3. Carousel Logic
    useEffect(() => {
        if (isLoading || foods.length === 0) return;

        // Speak current slide on change (Enable Autoplay only if user interacted? 
        // Browsers block audio without interaction. We assume user click triggers "Start" or we try anyway)
        const currentFood = foods[currentIndex];
        if (currentFood && !isPaused) {
            speak(currentFood.persona_text);
        }

        const interval = setInterval(() => {
            if (!isPaused) {
                setCurrentIndex(prev => (prev + 1) % foods.length);
            }
        }, 10000); // 10 seconds per slide

        return () => {
            clearInterval(interval);
            stopSpeaking();
        };
    }, [currentIndex, isPaused, isLoading, foods]);


    // Handlers
    const handleMouseEnter = () => {
        setIsPaused(true);
        window.speechSynthesis.pause(); // Pause audio
        setIsSpeaking(false);
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
        window.speechSynthesis.resume(); // Resume audio
        setIsSpeaking(true); // Assume it resumes speaking if it was
    };

    const handleItemClick = (food) => {
        // Do nothing on container click to avoid accidental triggers
    };

    const handleSeeMore = (e, food) => {
        e.stopPropagation(); // Prevent bubble
        stopSpeaking();
        navigate(`/diet/food/${food.id}`);
    };

    if (isLoading) return <div className="smart-box-loading">Loading Fitty AI...</div>;
    if (foods.length === 0) return null;

    const item = foods[currentIndex];

    return (
        <div
            className="smart-box-container"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="carousel-slide slide-enter" key={item.id}>

                {/* 1. LEFT CONTENT (40%) */}
                <div className="sb-left">
                    <h2 className="food-persona-greeting">
                        {item.persona_text ? item.persona_text.split('.')[0] : `Hello, I am ${item.name}`}
                    </h2>

                    <ul className="benefits-list">
                        {item.benefits && item.benefits.slice(0, 3).map((b, i) => (
                            <li key={i} className="benefit-badge">✔ {b}</li>
                        ))}
                    </ul>

                    {item.fitness_relevance && (
                        <div className="fitness-relevance">
                            <small>FITNESS TIP</small>
                            <p>{item.fitness_relevance}</p>
                        </div>
                    )}

                    <div className="sb-macros">
                        <span>🔥 {item.macros?.calories || item.calories} kcal</span>
                        <span>💪 {item.macros?.protein || item.protein}g P</span>
                    </div>

                    <button className="see-more-btn" onClick={(e) => handleSeeMore(e, item)}>
                        See More Details →
                    </button>
                </div>

                {/* 2. CENTER: ROBOT (20%) */}
                <div className="sb-center">
                    <RobotAssistant isSpeaking={isSpeaking} />
                </div>

                {/* 3. RIGHT IMAGE (40%) */}
                <div className="sb-right" onClick={(e) => handleSeeMore(e, item)}>
                    <img src={item.image_url} alt={item.name} />
                    <div className="food-name-overlay">{item.name}</div>
                </div>

            </div>
        </div>
    );
};

export default DietSmartBox;
