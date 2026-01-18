import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  FaDumbbell,
  FaFire,
  FaArrowRight,
  FaPlay,
  FaStar,
  FaCheckCircle,
  FaCrown,
  FaRobot,
  FaLeaf,
  FaRunning,
  FaChartLine,
  FaQuoteLeft,
  FaShieldAlt,
  FaWhatsapp,
  FaInstagram,
  FaYoutube
} from 'react-icons/fa';
import './Home.css';

// Simple Counter Component for stats
const Counter = ({ from, to, duration }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let start = from;
    const end = to;
    const totalDuration = duration * 1000;
    const incrementTime = (totalDuration / (end - start)) * 10;

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [from, to, duration]);

  return <>{count}</>;
};

const Home = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const [showVideo, setShowVideo] = useState(false);

  // Hero Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Letter animation for "FITMITRA"
  const letterContainer = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i }
    })
  };

  const letterChild = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 200 }
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: { type: "spring", damping: 12, stiffness: 200 }
    }
  };

  const brandName = "FITMITRA";

  // Three Main Cards Data
  const mainCards = [
    {
      icon: <FaLeaf />,
      title: "Diet Plans",
      desc: "Personalized Indian nutrition plans",
      color: "from-green-400 to-green-600"
    },
    {
      icon: <FaRunning />,
      title: "Activity Track",
      desc: "Real-time workout monitoring",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: <FaChartLine />,
      title: "Progress Log",
      desc: "Visual analytics of your journey",
      color: "from-purple-400 to-purple-600"
    }
  ];

  return (
    <div className="home-page" ref={containerRef}>

      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        {/* Background Elements */}
        <div className="hero-bg-glow"></div>
        <div className="hero-grid-pattern"></div>

        <div className="container hero-container">

          {/* Left Content */}
          <motion.div
            className="hero-text-content"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="hero-brand-badge">
              <span className="pulse-dot"></span> #1 AI Fitness Companion
            </motion.div>

            <motion.h1 className="hero-heading" variants={fadeInUp}>
              Reach Your Fitness Goals <br />
              with{" "}
              {/* Animated Text Character by Character */}
              <motion.span
                className="text-highlight"
                variants={letterContainer}
                initial="hidden"
                animate="visible"
                style={{ display: "inline-flex" }}
              >
                {Array.from(brandName).map((letter, index) => (
                  <motion.span variants={letterChild} key={index}>
                    {letter}
                  </motion.span>
                ))}
              </motion.span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="hero-subtext">
              Experience the next generation of fitness. AI-powered workout plans, smart diet tracking, and real-time posture correction designed for your success.
            </motion.p>

            <motion.div variants={fadeInUp} className="hero-cta-group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary-glow"
                onClick={() => navigate('/auth?tab=signup')}
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary-glass"
                onClick={() => setShowVideo(true)}
              >
                <FaPlay size={12} /> Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats Row (Visible on Desktop) */}
            <motion.div variants={fadeInUp} className="hero-stats-row">
              <div className="h-stat">
                <h3><Counter from={0} to={50} duration={2} />K+</h3>
                <p>Active Users</p>
              </div>
              <div className="h-divider"></div>
              <div className="h-stat">
                <h3>4.9/5</h3>
                <p>User Rating</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            className="hero-visual-content"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="image-composition">
              {/* Main Image */}
              <div className="main-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop"
                  alt="Fitness Model"
                  className="hero-model-img"
                />
                <div className="image-overlay-gradient"></div>
              </div>

              {/* Floating Glass Cards */}
              <motion.div
                className="glass-card card-top-right"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="glass-icon icon-fire"><FaFire /></div>
                <div>
                  <h4>520 kcal</h4>
                  <p>Burned Today</p>
                </div>
              </motion.div>

              <motion.div
                className="glass-card card-bottom-left"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="glass-icon icon-heart"><FaCrown /></div>
                <div>
                  <h4>Premium</h4>
                  <p>Plan Active</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FLOATING INFO CARDS SECTION --- */}
      <section className="info-cards-section">
        <div className="container">
          <div className="info-cards-grid">
            {mainCards.map((card, index) => (
              <motion.div
                key={index}
                className="feature-glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className={`feature-icon-box ${card.color}`}>
                  {card.icon}
                </div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <div className="card-bg-blur"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US (Content Section) --- */}
      <section className="content-section">
        <div className="container">
          <div className="section-header-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >Redefine Your Limits</motion.h2>
            <p>Our comprehensive modules cover every aspect of your well-being.</p>
          </div>

          <div className="features-showcase-grid">
            <motion.div
              className="feature-block"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="f-image">
                <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" alt="Gym" />
              </div>
              <div className="f-content">
                <h3>AI Workout Coach</h3>
                <p>Get real-time feedback on your form using computer vision technology.</p>
                <button className="text-link" onClick={() => navigate('/workout')}>Explore Workouts <FaArrowRight /></button>
              </div>
            </motion.div>

            <motion.div
              className="feature-block reverse"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="f-image">
                <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop" alt="Food" />
              </div>
              <div className="f-content">
                <h3>Smart Nutrition</h3>
                <p>Calorie tracking and personalized meal plans that adapt to your taste.</p>
                <button className="text-link" onClick={() => navigate('/diet')}>View Diet Plans <FaArrowRight /></button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="testimonials-section-dark">
        <div className="container">
          <h2 className="title-center">Success Stories</h2>
          <div className="testimonial-slider">
            {[1, 2, 3].map((val) => (
              <motion.div
                key={val}
                className="t-card"
                whileHover={{ y: -5, borderColor: "#6366f1" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: val * 0.1 }}
              >
                <div className="t-rating"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                <p className="t-text">"FitMitra completely changed the way I approach fitness. The AI suggestions are spot on!"</p>
                <div className="t-user">
                  <div className="t-avatar">
                    <img src={`https://i.pravatar.cc/150?img=${val + 10}`} alt="User" style={{ width: '100%', borderRadius: '50%' }} />
                  </div>
                  <div>
                    <h5>User {val}</h5>
                    <span>Member since 2023</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="cta-banner-section">
        <motion.div
          className="cta-content-box"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2>Ready to transform?</h2>
          <p>Join thousands of users hitting their goals every day.</p>
          <button className="btn-white" onClick={() => navigate('/auth?tab=signup')}>Join Now Free</button>
        </motion.div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            className="video-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideo(false)}
          >
            <div className="video-modal-content">
              <button className="close-btn" onClick={() => setShowVideo(false)}>×</button>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;