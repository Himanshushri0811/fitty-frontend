import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlay,
  FaArrowRight,
  FaLeaf,
  FaRunning,
  FaChartLine,
  FaStar,
  FaRobot,
  FaCheckCircle
} from 'react-icons/fa';
import './Home.css';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop", // Gym Atmosphere
  "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop", // Running/Outdoor
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop"  // Intense Focus
];

const HEADLINES = [
  "Revolutionize Your Fitness.",
  "AI-Powered Personal Training.",
  "Achieve Your Dream Body."
];

const Home = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  // --- Background Image Slider Logic ---
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 7000); // 7 Seconds per image

    return () => clearInterval(slideInterval);
  }, []);

  // --- Typing Animation Logic ---
  useEffect(() => {
    const handleTyping = () => {
      const fullText = HEADLINES[currentHeadlineIndex];

      if (isDeleting) {
        setDisplayedText(fullText.substring(0, displayedText.length - 1));
        setTypingSpeed(50); // Faster deleting
      } else {
        setDisplayedText(fullText.substring(0, displayedText.length + 1));
        setTypingSpeed(100); // Normal typing
      }

      if (!isDeleting && displayedText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000); // Pause at end
      } else if (isDeleting && displayedText === "") {
        setIsDeleting(false);
        setCurrentHeadlineIndex((prev) => (prev + 1) % HEADLINES.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentHeadlineIndex, typingSpeed]);

  return (
    <div className="home-page">

      {/* ========================
          HERO SECTION
      ======================== */}
      <section className="hero-section">

        {/* Background Image Slider */}
        <div className="hero-bg-wrapper">
          <AnimatePresence mode='wait'>
            <motion.img
              key={currentImageIndex}
              src={HERO_IMAGES[currentImageIndex]}
              alt="Fitness Background"
              className="hero-bg-image"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.05 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.5 },
                scale: { duration: 7, ease: "linear" }
              }}
            />
          </AnimatePresence>
          <div className="hero-overlay"></div>
        </div>

        {/* Hero Content */}
        <div className="hero-content container">
          <div className="hero-text-center">

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="hero-badge"
            >
              <span className="pulse-dot"></span> #1 AI Fitness Companion
            </motion.div>

            {/* Typing Headline */}
            <h1 className="hero-headline">
              {displayedText}
              <span className="cursor">|</span>
            </h1>

            {/* Subtext */}
            <motion.p
              className="hero-subtext"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              Transform your body and mind with FitMitra. <br className="hidden-mobile" />
              Intelligent diet plans, real-time posture correction, and expert guidance.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="hero-cta-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <button className="btn-hero-primary" onClick={() => navigate('/auth?tab=signup')}>
                Get Started Free
              </button>
              <button className="btn-hero-secondary" onClick={() => navigate('/explore')}>
                <FaPlay className="icon-sm" /> Watch Demo
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="hero-trust-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <div className="trust-item">
                <strong>50K+</strong> Active Users
              </div>
              <div className="trust-divider"></div>
              <div className="trust-item">
                <strong>4.9/5</strong> Rating
              </div>
              <div className="trust-divider"></div>
              <div className="trust-item">
                <strong>AI</strong> Coach
              </div>
            </motion.div>

          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            <div className="mouse">
              <div className="wheel"></div>
            </div>
            <span>Scroll to Explore</span>
          </motion.div>
        </div>
      </section>

      {/* ========================
          FEATURES / CARDS SECTION
      ======================== */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <FeatureCard
              icon={<FaLeaf />}
              title="Smart Diet"
              desc="Personalized nutrition plans tailored to your goals and Indian cuisine preferences."
              delay={0.1}
            />
            <FeatureCard
              icon={<FaRunning />}
              title="Activity Tracking"
              desc="Monitor your daily calorie burn, steps, and hydration with precision."
              delay={0.2}
            />
            <FeatureCard
              icon={<FaChartLine />}
              title="Progress Insights"
              desc="Visualize your journey with detailed analytics and weekly reports."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ========================
          AI COACH SECTION (ZigZag)
      ======================== */}
      <section className="details-section">
        <div className="container">

          {/* Block 1 */}
          <div className="detail-block">
            <motion.div
              className="detail-image"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="AI Coach" />
              <div className="floating-badge badge-1">
                <FaRobot /> AI Powered
              </div>
            </motion.div>
            <div className="detail-content">
              <h2>Meet Fitty, Your AI Coach</h2>
              <p>
                Get real-time feedback on your workout form using our advanced computer vision technology.
                Fitty analyzes your movements to prevent injury and maximize gains.
              </p>
              <ul className="detail-list">
                <li><FaCheckCircle className="text-primary" /> Real-time Posture Correction</li>
                <li><FaCheckCircle className="text-primary" /> Repetition Counting</li>
                <li><FaCheckCircle className="text-primary" /> Voice Feedback</li>
              </ul>
              <button className="text-link" onClick={() => navigate('/workout')}>Try AI Workout <FaArrowRight /></button>
            </div>
          </div>

          {/* Block 2 */}
          <div className="detail-block reverse">
            <motion.div
              className="detail-image"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop" alt="Healthy Food" />
              <div className="floating-badge badge-2">
                <FaLeaf /> 1000+ Recipes
              </div>
            </motion.div>
            <div className="detail-content">
              <h2>Nutrition Made Simple</h2>
              <p>
                Say goodbye to boring diets. Our AI generates meal plans that you'll actually enjoy,
                adapting to your available ingredients and taste preferences.
              </p>
              <ul className="detail-list">
                <li><FaCheckCircle className="text-primary" /> Calorie & Macro Tracking</li>
                <li><FaCheckCircle className="text-primary" /> Custom Meal Generation</li>
                <li><FaCheckCircle className="text-primary" /> Hydration Reminders</li>
              </ul>
              <button className="text-link" onClick={() => navigate('/diet')}>View Diet Plans <FaArrowRight /></button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================
          CTA FOOTER
      ======================== */}
      <section className="footer-cta">
        <div className="container">
          <motion.div
            className="footer-cta-box"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Start Your Transformation Today</h2>
            <p>Join the community of fitness enthusiasts making real progress.</p>
            <button className="btn-white-lg" onClick={() => navigate('/auth?tab=signup')}>Join FitMitra Free</button>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

// Component for Features
const FeatureCard = ({ icon, title, desc, delay }) => {
  return (
    <motion.div
      className="feature-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay, duration: 0.5 }}
      whileHover={{ y: -10 }}
    >
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.div>
  );
}

export default Home;