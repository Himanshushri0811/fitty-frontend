import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FaPlay, FaArrowRight, FaCheckCircle, FaFire, FaTrophy, FaBrain } from 'react-icons/fa';
import { MdOutlineFastfood, MdOutlineDirectionsRun, MdOutlineInsights } from 'react-icons/md';
import { Sparkles } from 'lucide-react';
import './Home.css';

/* --- SUBCOMPONENTS --- */

// Rotating Text Component
const RotatingText = () => {
    const textArray = ["AI Powered Fitness", "Real-time Posture Correction", "Smart Daily Challenges"];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % textArray.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span style={{ display: 'inline-block', position: 'relative', minWidth: '320px', textAlign: 'left' }}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ position: 'absolute', top: 0, left: 0, whiteSpace: 'nowrap', overflow: 'visible' }}
                    className="text-gradient"
                >
                    {textArray[index]}
                </motion.span>
            </AnimatePresence>
            <span style={{ visibility: 'hidden' }}>Real-time Posture Correction</span>
        </span>
    );
};

// CountUp Component
const CountUpStat = ({ target, duration, text, icon }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        const animate = (time) => {
            if (!startTime) startTime = time;
            const progress = (time - startTime) / (duration * 1000);
            if (progress < 1) {
                setCount(Math.floor(target * progress));
                requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };
        requestAnimationFrame(animate);
    }, [target, duration]);

    const displayCount = count >= 1000 ? `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K+` : `${count}%`;

    return (
        <motion.div 
            className="stat-strip-item"
            whileHover={{ scale: 1.05 }}
        >
            <div className="stat-icon-glow">{icon}</div>
            <div className="stat-info">
                <h4>{displayCount}</h4>
                <p>{text}</p>
            </div>
        </motion.div>
    );
};

// Animated Background Slider Component
const BackgroundSlider = () => {
    const images = [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hero-bg-wrapper">
            <AnimatePresence mode="popLayout">
                <motion.img
                    key={index}
                    src={images[index]}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="hero-bg-image-slider"
                    alt="Fitness Background"
                />
            </AnimatePresence>
            <div className="mesh-gradient-bg"></div>
            <div className="hero-grid-overlay"></div>
            
            {/* Floating Particles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="floating-particle"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        scale: Math.random() * 0.5 + 0.5,
                        opacity: Math.random() * 0.5 + 0.1
                    }}
                    animate={{
                        y: [null, Math.random() * -200 - 100],
                        opacity: [null, 0]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

/* --- MAIN PAGE --- */

const Home = () => {
    const navigate = useNavigate();

    const [isReady, setIsReady] = useState(() => {
        return !sessionStorage.getItem('fittySplashIsPlaying');
    });

    useEffect(() => {
        if (!isReady) {
            const handleReady = () => setIsReady(true);
            window.addEventListener('splashFinished', handleReady);
            return () => window.removeEventListener('splashFinished', handleReady);
        }
    }, [isReady]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
    };

    return (
        <div className="home-page">

            {/* ========================
                HERO SECTION
            ======================== */}
            <section className="hero-section">
                {/* Advanced Animated Background with Image Slider */}
                <BackgroundSlider />

                <motion.div 
                    className="hero-content"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isReady ? "visible" : "hidden"}
                >
                    <motion.div variants={itemVariants} className="hero-badge-premium">
                        <span className="ai-core-dot"></span> Next-Generation Neural Engine Active
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="hero-headline">
                        Intelligent Training.<br />
                        <span style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px'}}>
                            <span>Engineered for</span>
                            <RotatingText />
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="hero-subtext">
                        Fitty merges generative AI with kinetic tracking. Stop guessing your macros. Stop recording reps manually. Let the system build the ultimate version of you.
                    </motion.p>

                    <motion.div variants={itemVariants} className="hero-cta-row">
                        <button className="btn-premium-launch" onClick={() => navigate('/auth?tab=signup')}>
                            Initialize System <FaArrowRight size={14} style={{marginLeft: '8px'}} />
                        </button>
                        <button className="btn-hero-secondary" onClick={() => navigate('/mission-control')}>
                            <FaPlay size={12} /> Enter Mission Control
                        </button>
                    </motion.div>
                </motion.div>

                {/* Animated Stats Strip */}
                <motion.div 
                    className="hero-stats-strip"
                    initial={{ opacity: 0, y: 40 }}
                    animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <CountUpStat target={5000} duration={2} text="Active Neural Links" icon={<FaFire />} />
                    <CountUpStat target={20000} duration={2.5} text="Protocols Completed" icon={<FaTrophy />} />
                    <CountUpStat target={90} duration={3} text="Kinetic Accuracy" icon={<FaBrain />} />
                </motion.div>

                {/* Bottom fade overlap */}
                <div className="hero-bottom-fade"></div>
            </section>

            {/* ========================
                FEATURES SECTION
            ======================== */}
            <section className="features-section">
                <div className="features-header">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        A closed-loop fitness ecosystem
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                        Every system communicates. Faster recovery. Better tracking. Zero friction.
                    </motion.p>
                </div>

                <div className="features-grid">
                    <FeatureCard
                        icon={<MdOutlineFastfood />} title="Smarter Nutrition" delay={0.1}
                        desc="Auto-calculated macros fed directly from your completed workouts. Infinite dish generation."
                    />
                    <FeatureCard
                        icon={<MdOutlineDirectionsRun />} title="Kinetic Tracking" delay={0.2}
                        desc="Real-time skeletal analysis. We alert you when your shoulder drops or your hips rise."
                    />
                    <FeatureCard
                        icon={<MdOutlineInsights />} title="Deep Analytics" delay={0.3}
                        desc="Your central dashboard monitors hydration, XP progress, and streaks to gamify your biology."
                    />
                </div>
            </section>

            {/* ========================
                DETAILS ZIGZAG
            ======================== */}
            <section className="details-section">
                <div className="detail-block">
                    <motion.div className="detail-image" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <div className="image-overlay-glow"></div>
                        <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" alt="Workout" />
                    </motion.div>
                    <div className="detail-content">
                        <h2>Your personal AI coach</h2>
                        <p>Our computer vision model tracks your form during workouts in real-time, providing immediate haptic or voice feedback.</p>
                        <ul className="detail-list">
                            <li><FaCheckCircle className="list-icon" /> Sub-millisecond joint tracking</li>
                            <li><FaCheckCircle className="list-icon" /> AI-generated routine adjustments</li>
                            <li><FaCheckCircle className="list-icon" /> Absolute privacy. Processes locally.</li>
                        </ul>
                        <button className="text-link" onClick={() => navigate('/workout')}>Explore AI Workouts <FaArrowRight size={14} /></button>
                    </div>
                </div>
            </section>

            {/* ========================
                FOOTER CTA
            ======================== */}
            <section className="footer-cta">
                <motion.div className="footer-cta-box" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                    <h2>The protocol is ready. Are you?</h2>
                    <p>Initialize your first session today and unlock your biological potential.</p>
                    <button className="btn-premium-launch" style={{ margin: '0 auto' }} onClick={() => navigate('/auth?tab=signup')}>
                        Boot Up Now
                    </button>
                </motion.div>
            </section>

        </div>
    );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
    <motion.div 
        className="feature-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -8 }}
    >
        <div className="feature-icon-wrapper">{icon}</div>
        <h3>{title}</h3>
        <p>{desc}</p>
    </motion.div>
);

export default Home;