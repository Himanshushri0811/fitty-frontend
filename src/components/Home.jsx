import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  FaDumbbell,
  FaFire,
  FaHeartbeat,
  FaAppleAlt,
  FaTrophy,
  FaChartLine,
  FaRunning,
  FaUserFriends,
  FaMobileAlt,
  FaShieldAlt,
  FaArrowRight,
  FaPlay,
  FaQuoteLeft,
  FaStar,
  FaCheckCircle,
  FaCrown,
  FaBolt,
  FaRobot,
  FaBrain,
  FaYoutube,
  FaWhatsapp,
  FaInstagram
} from 'react-icons/fa';
import { GiMuscleUp, GiWeightLiftingUp, GiBiceps } from 'react-icons/gi';
import { MdLocalFireDepartment, MdTimer, MdTrendingUp } from 'react-icons/md';
import { TbDeviceAnalytics } from 'react-icons/tb';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const [activeFeature, setActiveFeature] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [counterValues, setCounterValues] = useState({
    members: 0,
    workouts: 0,
    transformations: 0,
    calories: 0
  });

  // Animated counter effect
  useEffect(() => {
    const duration = 2000;
    const steps = 100;
    const increment = {
      members: 50000 / steps,
      workouts: 1200000 / steps,
      transformations: 12000 / steps,
      calories: 4500000 / steps
    };

    let currentValues = { members: 0, workouts: 0, transformations: 0, calories: 0 };
    let step = 0;

    const timer = setInterval(() => {
      step++;
      currentValues = {
        members: Math.min(Math.round(increment.members * step), 50000),
        workouts: Math.min(Math.round(increment.workouts * step), 1200000),
        transformations: Math.min(Math.round(increment.transformations * step), 12000),
        calories: Math.min(Math.round(increment.calories * step), 4500000)
      };

      setCounterValues(currentValues);

      if (step >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    // Feature rotation
    const featureInterval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(featureInterval);
    };
  }, []);

  // Hero animation variants
  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Features with enhanced data
  const features = [
    {
      icon: <FaRobot />,
      title: "AI-Personalized Workouts",
      description: "Get custom workout plans tailored to your body type, goals, and fitness level with our advanced AI",
      color: "#667eea",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      points: ["Adaptive plans", "Form correction", "Progress tracking"]
    },
    {
      icon: <FaAppleAlt />,
      title: "Indian Diet Plans",
      description: "Personalized meal plans with Indian recipes, macro tracking, and grocery lists",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      points: ["Vegetarian/Vegan options", "Regional cuisines", "Festival specials"]
    },
    {
      icon: <GiMuscleUp />,
      title: "Real-Time Posture Analysis",
      description: "AI-powered posture correction with live feedback using your camera",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      points: ["Instant corrections", "Exercise form analysis", "Injury prevention"]
    },
    {
      icon: <TbDeviceAnalytics />,
      title: "Advanced Progress Tracking",
      description: "3D body scans, detailed analytics, and performance insights",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      points: ["Body measurements", "Performance graphs", "Goal tracking"]
    },
    {
      icon: <FaBrain />,
      title: "Smart Health Monitoring",
      description: "Track heart rate, calories, sleep, and overall wellness metrics",
      color: "#ef4444",
      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      points: ["Health insights", "Recovery tracking", "Wellness scores"]
    },
    {
      icon: <FaMobileAlt />,
      title: "Hindi/English Voice Coach",
      description: "Hands-free workout guidance with multilingual voice commands",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      points: ["Voice commands", "Real-time guidance", "Multi-language"]
    }
  ];

  // Success stories with enhanced data
  const successStories = [
    {
      name: "Rajesh Kumar",
      role: "Lost 15kg in 3 months",
      text: "FitMitra's personalized Indian diet plans completely transformed my life. The AI workout plans were perfect for my body type!",
      image: "https://i.pravatar.cc/400?img=11",
      stats: ["-15kg", "+8% muscle", "98% consistency"],
      duration: "3 months"
    },
    {
      name: "Priya Sharma",
      role: "Gained 5kg muscle",
      text: "As a vegetarian, I struggled with protein intake. FitMitra's vegetarian meal plans and posture correction were game-changers!",
      image: "https://i.pravatar.cc/400?img=5",
      stats: ["+5kg muscle", "0 injuries", "100% vegetarian"],
      duration: "4 months"
    },
    {
      name: "Amit Patel",
      role: "Fixed chronic back pain",
      text: "The AI posture correction helped me fix years of back pain. The real-time feedback during workouts is incredible!",
      image: "https://i.pravatar.cc/400?img=8",
      stats: ["0 back pain", "+40% flexibility", "Daily posture"],
      duration: "2 months"
    }
  ];

  // Stats with icons
  const stats = [
    {
      icon: <FaUserFriends />,
      value: counterValues.members.toLocaleString() + "+",
      label: "Active Members",
      description: "Growing community"
    },
    {
      icon: <GiWeightLiftingUp />,
      value: counterValues.workouts.toLocaleString() + "+",
      label: "Workouts Completed",
      description: "And counting"
    },
    {
      icon: <FaTrophy />,
      value: counterValues.transformations.toLocaleString() + "+",
      label: "Transformations",
      description: "Life changing results"
    },
    {
      icon: <MdLocalFireDepartment />,
      value: counterValues.calories.toLocaleString() + "+",
      label: "Calories Burned",
      description: "Total calories burned"
    }
  ];

  return (
    <div className="home-page" ref={containerRef}>
      {/* Floating Particles Background */}
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{ y: 0, x: Math.random() * 100 }}
            animate={{
              y: [0, -100, 0],
              x: [Math.random() * 100, Math.random() * 100 + 50, Math.random() * 100]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Hero Section - Ultra Modern */}
      <motion.section
        className="hero-section"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <div className="hero-gradient"></div>

        <div className="container hero-container">
          <motion.div className="hero-content" variants={itemVariants}>
            <motion.div
              className="hero-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <FaCrown /> #1 AI Fitness App in India
            </motion.div>

            <motion.h1 className="hero-title" variants={itemVariants}>
              Transform Your Body with
              <span className="gradient-text typing-animation">
                AI-Powered Precision
              </span>
            </motion.h1>

            <motion.p className="hero-subtitle" variants={itemVariants}>
              Personalized workouts, Indian diet plans, and real-time posture correction
              designed specifically for the Indian lifestyle. Join 50,000+ success stories.
            </motion.p>

            <motion.div className="hero-buttons" variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 87, 34, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
                onClick={() => navigate('/auth?tab=signup')}
              >
                <FaBolt /> Start 7-Day Free Trial
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary"
                onClick={() => setShowVideo(true)}
              >
                <FaPlay /> Watch Demo Video
              </motion.button>
            </motion.div>

            <motion.div className="hero-features" variants={itemVariants}>
              <div className="feature-check">
                <FaCheckCircle /> No credit card required
              </div>
              <div className="feature-check">
                <FaCheckCircle /> Cancel anytime
              </div>
              <div className="feature-check">
                <FaCheckCircle /> 24/7 AI Support
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <div className="floating-phone">
              <div className="phone-screen">
                <div className="screen-content">
                  <div className="app-header">
                    <div className="app-logo">💪</div>
                    <span>FitMitra</span>
                  </div>
                  <div className="app-stats">
                    <div className="stat">
                      <div className="stat-value">98%</div>
                      <div className="stat-label">Accuracy</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">4.9★</div>
                      <div className="stat-label">Rating</div>
                    </div>
                  </div>
                  <div className="workout-preview">
                    <div className="exercise">AI Recommended</div>
                    <div className="exercise-name">Chest & Shoulders</div>
                    <div className="timer">45:00</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated Scroll Indicator */}
        <motion.div
          className="scroll-indicator"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="scroll-text">Scroll to explore</div>
          <div className="scroll-arrow">↓</div>
        </motion.div>
      </motion.section>

      {/* Animated Stats Section */}
      <motion.section
        className="stats-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -15,
                  boxShadow: "0 25px 50px rgba(102, 126, 234, 0.15)"
                }}
              >
                <motion.div
                  className="stat-icon-wrapper"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="stat-icon">
                    {stat.icon}
                  </div>
                </motion.div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-description">{stat.description}</div>
                </div>
                <div className="stat-glow"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Interactive Features Showcase */}
      <section className="features-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-badge">
              <FaRobot /> AI-Powered Features
            </div>
            <h2>Why <span className="gradient-text">FitMitra</span> is Different</h2>
            <p>Experience the future of fitness with our cutting-edge AI technology</p>
          </motion.div>

          {/* Feature Navigation */}
          <div className="feature-navigation">
            {features.map((feature, index) => (
              <motion.button
                key={index}
                className={`feature-nav-btn ${activeFeature === index ? 'active' : ''}`}
                onClick={() => setActiveFeature(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <span className="nav-icon">{feature.icon}</span>
                <span className="nav-text">{feature.title.split(' ')[0]}</span>
              </motion.button>
            ))}
          </div>

          {/* Active Feature Display */}
          <div className="feature-display">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                className="feature-detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="feature-detail-content">
                  <div
                    className="feature-main-icon"
                    style={{ background: features[activeFeature].gradient }}
                  >
                    {features[activeFeature].icon}
                  </div>
                  <h3>{features[activeFeature].title}</h3>
                  <p>{features[activeFeature].description}</p>

                  <div className="feature-points">
                    {features[activeFeature].points.map((point, idx) => (
                      <div key={idx} className="feature-point">
                        <FaCheckCircle /> {point}
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn-feature"
                    onClick={() => navigate(features[activeFeature].title.includes('Workout') ? '/workout' :
                      features[activeFeature].title.includes('Diet') ? '/diet' : '/posture')}
                  >
                    Try it now <FaArrowRight />
                  </button>
                </div>

                <div className="feature-visual">
                  <div className="visual-container">
                    <div className="visual-content">
                      {/* Animated visual representation */}
                      <div className="ai-animation">
                        <div className="ai-core">
                          <FaBrain />
                        </div>
                        <div className="ai-rays">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="ai-ray" style={{ '--i': i }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-badge">
              <FaStar /> Success Stories
            </div>
            <h2>Real People, <span className="gradient-text">Real Results</span></h2>
            <p>Join thousands of Indians who transformed their lives with FitMitra</p>
          </motion.div>

          <div className="testimonials-carousel">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                className="testimonial-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="testimonial-header">
                  <img src={story.image} alt={story.name} className="testimonial-avatar" />
                  <div className="testimonial-info">
                    <h4>{story.name}</h4>
                    <div className="testimonial-role">{story.role}</div>
                    <div className="testimonial-duration">{story.duration}</div>
                  </div>
                  <div className="testimonial-rating">
                    <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
                  </div>
                </div>

                <div className="testimonial-content">
                  <FaQuoteLeft className="quote-icon" />
                  <p>{story.text}</p>
                </div>

                <div className="testimonial-stats">
                  {story.stats.map((stat, idx) => (
                    <div key={idx} className="stat-badge">
                      {stat}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <motion.section
        className="cta-section"
        style={{ opacity, scale }}
      >
        <div className="cta-gradient"></div>
        <div className="container">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="cta-badge">
              <FaBolt /> Limited Time Offer
            </div>

            <h2>Start Your Transformation Journey Today!</h2>
            <p>Get access to all premium features with our 7-day free trial</p>

            <div className="cta-features">
              <div className="cta-feature">
                <FaCheckCircle /> AI-Personalized Workouts
              </div>
              <div className="cta-feature">
                <FaCheckCircle /> Indian Diet Plans
              </div>
              <div className="cta-feature">
                <FaCheckCircle /> Posture Correction
              </div>
              <div className="cta-feature">
                <FaCheckCircle /> Progress Tracking
              </div>
            </div>

            <div className="cta-buttons">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 87, 34, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary btn-xl"
                onClick={() => navigate('/auth?tab=signup')}
              >
                <FaCrown /> Start Free Trial
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline"
                onClick={() => navigate('/auth?tab=login')}
              >
                Already a member? Sign In
              </motion.button>
            </div>

            <div className="cta-footer">
              <div className="security-badge">
                <FaShieldAlt /> 256-bit SSL Secured
              </div>
              <div className="social-proof">
                <span>Trusted by 50K+ Indians</span>
                <div className="social-icons">
                  <FaWhatsapp />
                  <FaInstagram />
                  <FaYoutube />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            className="video-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="close-modal" onClick={() => setShowVideo(false)}>×</button>
              <div className="video-container">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="FitMitra Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;