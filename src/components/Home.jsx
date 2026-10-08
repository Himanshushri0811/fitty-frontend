import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaPlus, FaMinus, FaQuoteLeft, FaCheckCircle } from 'react-icons/fa';
import {
    MdOutlineFastfood, MdOutlineDirectionsRun, MdOutlineInsights,
    MdOutlineEmojiEvents, MdOutlineWaterDrop, MdOutlineSmartToy
} from 'react-icons/md';
import './Home.css';

/* ---------- DATA ---------- */
/* ---------- 4K IMAGE HELPERS ---------- */
// Swap these Unsplash ids with your own photos anytime. Phones load the small size, 4K screens load 3840w.
const HERO_IDS = [
    'photo-1517836357463-d25dfeac3438',
    'photo-1534438327276-14e5300c3a48',
    'photo-1571019614242-c5c5dee9f50b',
];
const unsplash = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const srcSet = (id) => [1280, 1920, 2560, 3840].map((w) => `${unsplash(id, w)} ${w}w`).join(', ');
const IMG = { gym: unsplash(HERO_IDS[0], 2400), train: unsplash(HERO_IDS[2], 2400) };

const PHRASES = ['Smart Daily Challenges', 'Real-time Posture Correction', 'AI Powered Fitness'];

const FEATURES = [
    { icon: <MdOutlineSmartToy />, title: 'AI Workout Coach', desc: 'Routines built for your goal, level and equipment. They adjust as you improve.', tone: 'cream', wide: true },
    { icon: <MdOutlineDirectionsRun />, title: 'Posture Tracking', desc: 'Your camera spots a dropped shoulder or rising hips and tells you right away.', tone: 'orange' },
    { icon: <MdOutlineFastfood />, title: 'Smart Nutrition', desc: 'Macros calculated from the workouts you finish. Unlimited dish ideas.', tone: 'orange' },
    { icon: <MdOutlineInsights />, title: 'Progress Dashboard', desc: 'Workouts, streaks and XP in one place, so you can see what is working.', tone: 'cream', wide: true },
    { icon: <MdOutlineEmojiEvents />, title: 'Daily Challenges', desc: 'A new challenge every day. Earn XP and keep your streak alive.', tone: 'dark' },
    { icon: <MdOutlineWaterDrop />, title: 'Hydration Log', desc: 'Log water in one tap and hit your daily target.', tone: 'cream' },
];

const STEPS = [
    { t: 'Create your profile', d: 'Tell Fitty your goal, level and schedule.' },
    { t: 'Get your plan', d: 'The AI builds your workouts and meals in seconds.' },
    { t: 'Train with live feedback', d: 'Your camera checks your form on every rep.' },
    { t: 'Track and level up', d: 'Watch your streaks, XP and results grow.' },
];

const REVIEWS = [
    { q: 'The form alerts fixed my squat in two weeks. I had been doing it wrong for years.', n: 'Rohan Mehta', r: 'Software engineer' },
    { q: 'Macros that follow my workouts means I never have to guess what to eat.', n: 'Priya Sharma', r: 'Student' },
    { q: 'The daily challenges got me to the gym on days I would normally skip.', n: 'Aman Verma', r: 'Freelance designer' },
];

const FAQS = [
    { q: 'What does Fitty do?', a: 'Fitty combines AI workout plans, live posture tracking, nutrition and progress tracking in one app.' },
    { q: 'Do I need gym experience?', a: 'No. Fitty sets your starting level from your answers and adjusts as you improve.' },
    { q: 'Is my camera video stored?', a: 'No. Posture analysis runs locally on your device, and video is not uploaded.' },
    { q: 'Can I use it for fat loss?', a: 'Yes. Pick fat loss as your goal and Fitty sets your workouts and calories for it.' },
    { q: 'How do I get started?', a: 'Create a free account, answer a few questions and your first plan is ready.' },
];

/* ---------- SUBCOMPONENTS ---------- */
const RotatingText = () => {
    const [i, setI] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setI((p) => (p + 1) % PHRASES.length), 3000);
        return () => clearInterval(id);
    }, []);
    return (
        <span className="h-rotate" aria-live="polite">
            <AnimatePresence mode="wait">
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                >
                    {PHRASES[i]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

const FaqItem = ({ item, open, onToggle }) => (
    <div className={`h-faq-item ${open ? 'open' : ''}`}>
        <button className="h-faq-q" onClick={onToggle} aria-expanded={open}>
            <span>{item.q}</span>
            <span className="h-faq-icon">{open ? <FaMinus size={11} /> : <FaPlus size={11} />}</span>
        </button>
        <AnimatePresence initial={false}>
            {open && (
                <motion.p
                    className="h-faq-a"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    {item.a}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

const HeroBackground = () => {
    const [i, setI] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setI((p) => (p + 1) % HERO_IDS.length), 6000);
        return () => clearInterval(id);
    }, []);
    return (
        <div className="h-hero-bg" aria-hidden="true">
            <AnimatePresence mode="popLayout">
                <motion.img
                    key={i}
                    src={unsplash(HERO_IDS[i], 2560)}
                    srcSet={srcSet(HERO_IDS[i])}
                    sizes="100vw"
                    alt=""
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.6, ease: 'easeOut' }}
                />
            </AnimatePresence>
        </div>
    );
};

/* ---------- PAGE ---------- */
const Home = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(0);
    const [isReady, setIsReady] = useState(() => !sessionStorage.getItem('fittySplashIsPlaying'));

    useEffect(() => {
        if (!isReady) {
            const ready = () => setIsReady(true);
            window.addEventListener('splashFinished', ready);
            return () => window.removeEventListener('splashFinished', ready);
        }
    }, [isReady]);

    const signup = () => navigate('/auth?tab=signup');

    return (
        <div className="h-page">
            {/* ============ HERO ============ */}
            <section className="h-hero">
                <HeroBackground />

                <div className="h-hero-inner">
                    <motion.div
                        className="h-hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={isReady ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="h-badge"><i className="h-badge-dot" /> AI coach with live form tracking</span>
                        <h1>Train smarter.<br />Reach every goal.</h1>
                        <div className="h-hero-built">Built for <RotatingText /></div>
                        <p>
                            Fitty builds your workouts, counts your reps, checks your form and plans your meals,
                            so every session moves you closer to your goal.
                        </p>
                        <div className="h-hero-cta">
                            <button className="h-btn h-btn-grad" onClick={signup}>
                                Get started <span className="h-btn-dot"><FaArrowRight size={11} /></span>
                            </button>
                            <button className="h-btn h-btn-ghost" onClick={() => navigate('/mission-control')}>
                                Open Mission Control
                            </button>
                        </div>
                        <ul className="h-hero-trust">
                            <li><FaCheckCircle /> Posture analysis runs on your device</li>
                            <li><FaCheckCircle /> Plans adjust as you improve</li>
                            <li><FaCheckCircle /> Workouts, meals and streaks in one app</li>
                        </ul>
                    </motion.div>
                </div>

                <motion.div
                    className="h-hero-stats"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isReady ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <div><strong>5K+</strong><span>Active members</span></div>
                    <div><strong>20K+</strong><span>Workouts completed</span></div>
                    <div><strong>90%</strong><span>Posture detection accuracy</span></div>
                </motion.div>
            </section>

            {/* ============ ABOUT ============ */}
            <section className="h-section h-about">
                <div className="h-about-head">
                    <h2 className="h-title">We build habits<br /><em>that last.</em></h2>
                    <p className="h-lead">
                        Fitty brings together smart programming, live form checks and nutrition tracking. Every
                        session is built around your real progress, not guesswork.
                    </p>
                </div>
                <div className="h-about-grid">
                    <div className="h-about-photo">
                        <img src={IMG.gym} alt="Gym training" />
                    </div>
                    <div className="h-about-cards">
                        <div className="h-card h-card-cream">
                            <strong className="h-big">90%</strong>
                            <span>Posture detection accuracy</span>
                            <button className="h-btn h-btn-grad" onClick={signup}>
                                Try it free <span className="h-btn-dot"><FaArrowRight size={11} /></span>
                            </button>
                        </div>
                        <div className="h-card h-card-photo">
                            <img src={IMG.train} alt="" />
                            <div className="h-card-photo-label">
                                <strong>100%</strong>
                                <span>On-device processing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ FEATURES ============ */}
            <section className="h-section h-features">
                <h2 className="h-title h-title-right">Everything you need<br /><em>to train better.</em></h2>
                <div className="h-bento">
                    {FEATURES.map((f, i) => (
                        <motion.article
                            key={f.title}
                            className={`h-tile h-tile-${f.tone} ${f.wide ? 'wide' : ''}`}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ delay: (i % 3) * 0.08, duration: 0.4 }}
                        >
                            <div className="h-tile-icon">{f.icon}</div>
                            <div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </section>

            {/* ============ HOW IT WORKS (orange block) ============ */}
            <section className="h-steps">
                <div className="h-steps-inner">
                    <h2 className="h-title h-title-light">Train with purpose.<br />Progress with confidence.</h2>
                    <ol className="h-steps-grid">
                        {STEPS.map((s, i) => (
                            <li key={s.t} className={i === 1 ? 'featured' : ''}>
                                <span className="h-step-num">{String(i + 1).padStart(2, '0')}</span>
                                <h3>{s.t}</h3>
                                <p>{s.d}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ============ TESTIMONIALS ============ */}
            <section className="h-section h-reviews">
                <h2 className="h-title">What our members<br /><em>have to say.</em></h2>
                <div className="h-reviews-row">
                    {REVIEWS.map((r) => (
                        <figure key={r.n} className="h-review">
                            <FaQuoteLeft className="h-review-q" />
                            <blockquote>{r.q}</blockquote>
                            <figcaption><strong>{r.n}</strong><span>{r.r}</span></figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            {/* ============ FAQ ============ */}
            <section className="h-section h-faq">
                <h2 className="h-title">Questions?<br /><em>Answers below.</em></h2>
                <div className="h-faq-list">
                    {FAQS.map((f, i) => (
                        <FaqItem key={f.q} item={f} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
                    ))}
                </div>
            </section>

            {/* ============ FINAL CTA ============ */}
            <section className="h-final">
                <div className="h-final-inner">
                    <h2>Your first workout<br />is one tap away.</h2>
                    <p>Create a free account and get your personal plan in under a minute.</p>
                    <button className="h-btn h-btn-dark h-btn-lg" onClick={signup}>
                        Create free account <span className="h-btn-dot"><FaArrowRight size={12} /></span>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Home;