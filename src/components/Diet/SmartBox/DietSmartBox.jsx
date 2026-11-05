import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchDietCarousel } from '../../../services/dietService';
import RobotAssistant from './RobotAssistant';
import './SmartBox.css';

const DietSmartBox = () => {
    const navigate = useNavigate();
    const [foods, setFoods] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isInteracting, setIsInteracting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Refs
    const speechRef = useRef(null);
    const isSpeakingRef = useRef(false);

    // Check prefers-reduced-motion
    useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            setPrefersReducedMotion(mq.matches);
            const handler = (e) => setPrefersReducedMotion(e.matches);
            if (mq.addEventListener) {
                mq.addEventListener('change', handler);
                return () => mq.removeEventListener('change', handler);
            }
        }
    }, []);

    // 1. Fetch Carousel Data
    useEffect(() => {
        let mounted = true;
        const fetchCarousel = async () => {
            try {
                const data = await fetchDietCarousel();
                if (mounted && data && data.length > 0) {
                    setFoods(data);
                }
            } catch (err) {
                console.error("SmartBox Fetch Error", err);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        fetchCarousel();
        return () => {
            mounted = false;
        };
    }, []);

    // 2. TTS Logic - Only triggered manually by user tap
    const stopSpeaking = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            isSpeakingRef.current = false;
        }
    }, []);

    const toggleSpeech = (text) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        if (isSpeaking) {
            stopSpeaking();
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('India')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

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
        utterance.onerror = () => {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    // Stop speaking on slide change or unmount
    useEffect(() => {
        return () => {
            stopSpeaking();
        };
    }, [currentIndex, stopSpeaking]);

    // Handle document.hidden to pause auto-rotation & pause speech
    const [isDocumentHidden, setIsDocumentHidden] = useState(false);
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsDocumentHidden(true);
                stopSpeaking();
            } else {
                setIsDocumentHidden(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [stopSpeaking]);

    // 3. Carousel Auto-rotation: Paused when interacting, speaking, or document hidden
    useEffect(() => {
        if (isLoading || foods.length === 0) return;
        if (isInteracting || isSpeaking || isDocumentHidden) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % foods.length);
        }, 8000);

        return () => {
            clearInterval(interval);
        };
    }, [foods.length, isInteracting, isSpeaking, isDocumentHidden, isLoading]);

    const handleSeeMore = (e, food) => {
        e.stopPropagation();
        stopSpeaking();
        navigate(`/diet/food/${food.id}`);
    };

    if (isLoading) return <div className="smart-box-loading">Loading Fitty AI...</div>;
    if (foods.length === 0) return null;

    const item = foods[currentIndex];

    return (
        <div
            className={`smart-box-container ${prefersReducedMotion ? 'reduced-motion' : ''}`}
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => setIsInteracting(false)}
        >
            <div className={`carousel-slide ${prefersReducedMotion ? '' : 'slide-enter'}`} key={item.id}>
                {/* 1. LEFT CONTENT */}
                <div className="sb-left">
                    <div className="sb-top-bar">
                        <span className="sb-slide-counter">{currentIndex + 1} / {foods.length}</span>
                        {/* MANUAL SPEAKER BUTTON - NO AUTOPLAY */}
                        <button
                            type="button"
                            className={`speaker-btn ${isSpeaking ? 'speaking-active' : ''}`}
                            aria-label={isSpeaking ? "Stop voice assistant" : "Listen to voice introduction"}
                            onClick={() => toggleSpeech(item.persona_text || item.description || item.name)}
                            title={isSpeaking ? "Mute" : "Listen to persona voice"}
                        >
                            {isSpeaking ? "🔊 Speaking... (Tap to Mute)" : "🔈 Tap to Listen"}
                        </button>
                    </div>

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

                    <div className="sb-actions-row">
                        <button
                            type="button"
                            className="see-more-btn"
                            onClick={(e) => handleSeeMore(e, item)}
                        >
                            See More Details →
                        </button>
                    </div>
                </div>

                {/* 2. CENTER: ROBOT */}
                <div className="sb-center">
                    <RobotAssistant isSpeaking={!prefersReducedMotion && isSpeaking} />
                </div>

                {/* 3. RIGHT: IMAGE */}
                <div className="sb-right" onClick={(e) => handleSeeMore(e, item)}>
                    <img src={item.image_url} alt={item.name} loading="lazy" />
                    <div className="food-name-overlay">{item.name}</div>
                </div>
            </div>
        </div>
    );
};

export default DietSmartBox;
