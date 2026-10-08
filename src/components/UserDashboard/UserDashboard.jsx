import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../axiosConfig';
import { motion } from 'framer-motion';
import {
    Flame, Droplets, Dumbbell, Trophy, Play, Utensils, Target,
    RefreshCw, BedDouble, Plus, Check, Award, ArrowRight
} from 'lucide-react';
import './UserDashboard.css';

// ---- Constants ----
const WATER_GOAL_GLASSES = 12;
const KCAL_PER_SET_REP = 2.5; // rough estimate: sets * reps * 2.5
const PROTEIN_GOAL_G = 150;
const WORKOUTS_PER_LEVEL = 10;
const SESSION_PREVIEW = 5;
// Backend sets/reps strings bhejta hai ("3", "8-12"). parseInt("8-12") = 8, "AMRAP" = 0
const toNum = (v) => parseInt(v, 10) || 0;

const EMPTY_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name) => ({ name, calories: 0, consumed: 0 }));

const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

// Backend profile_pic relative aata hai (/media/...). Use absolute banao.
const mediaUrl = (src) => {
    if (!src) return null;
    if (/^(https?:|data:|blob:)/.test(src)) return src;
    return `${API.defaults.baseURL}${src.startsWith('/') ? '' : '/'}${src}`;
};

/* ---------- Avatar with XP ring ---------- */
const Avatar = ({ name, src, progress = 0, level = 1 }) => {
    const [broken, setBroken] = useState(false);
    const url = broken ? null : mediaUrl(src);
    const initials = (name || 'C').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
    const r = 52;
    const c = 2 * Math.PI * r;
    return (
        <div className="db-avatar" role="img" aria-label={`${name}, level ${level}`}>
            <svg className="db-avatar-ring" viewBox="0 0 112 112" aria-hidden="true">
                <circle cx="56" cy="56" r={r} className="db-avatar-ring-track" />
                <circle cx="56" cy="56" r={r} className="db-avatar-ring-fill"
                    strokeDasharray={c} strokeDashoffset={c * (1 - progress)} />
            </svg>
            <div className="db-avatar-photo">
                {url ? <img src={url} alt="" onError={() => setBroken(true)} /> : <span>{initials}</span>}
            </div>
        </div>
    );
};

const Skeleton = () => (
    <div className="dashboard-container" aria-busy="true">
        <div className="dx-inner">
            <div className="dx-skel" style={{ height: 40, width: 320, marginBottom: 24 }} />
            <div className="dx-main">
                <div className="dx-skel" style={{ height: 340 }} />
                <div className="dx-skel" style={{ height: 340 }} />
            </div>
            <div className="dx-skel" style={{ height: 150, marginTop: 20 }} />
        </div>
    </div>
);

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const greeting = useMemo(getGreeting, []);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [todayWorkout, setTodayWorkout] = useState(null);
    const [waterData, setWaterData] = useState({ glasses: 0, total_ml: 0 });
    const [metric, setMetric] = useState('calories');
    const [stats, setStats] = useState(null);
    const [addingWater, setAddingWater] = useState(false);
    const [waterFailed, setWaterFailed] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Parallel + independent: ek fail hone par dusra chalta rahega.
        const localDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD (local)
        const [planRes, waterRes, statsRes] = await Promise.allSettled([
            API.get('/api/accounts/workout/plan/'),
            API.get('/api/fitness/water-intake/'),
            API.get('/api/accounts/dashboard/stats/', { params: { date: localDate } }),
        ]);

        if (planRes.status === 'fulfilled') {
            const plan = planRes.value.data;
            if (Array.isArray(plan)) {
                const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const todayIndex = (new Date().getDay() + 6) % 7;
                setTodayWorkout(plan.find((d) => d.day_name?.toLowerCase() === todayName) ?? plan[todayIndex] ?? null);
            }
        }
        if (waterRes.status === 'fulfilled') setWaterData(waterRes.value.data);
        if (statsRes.status === 'fulfilled' && Array.isArray(statsRes.value.data?.weekly)) setStats(statsRes.value.data);
        if (planRes.status === 'rejected' && waterRes.status === 'rejected') {
            setError('We could not load your dashboard. Check your connection and try again.');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchDashboardData();
        const onWater = (e) => {
            if (e.detail) setWaterData((prev) => ({ ...prev, glasses: e.detail.glasses, total_ml: e.detail.total_ml }));
        };
        window.addEventListener('waterUpdated', onWater);
        return () => window.removeEventListener('waterUpdated', onWater);
    }, [fetchDashboardData]);

    const exercises = todayWorkout?.exercises ?? [];
    const isRestDay = exercises.length === 0;
    const chartData = stats?.weekly ?? EMPTY_WEEK;
    const displayName = user?.name || stats?.name || 'Champ';
    const firstName = displayName.split(' ')[0];

    const workouts = stats?.workouts_completed ?? 0;
    const streak = stats?.streak ?? 0;
    const level = Math.floor(workouts / WORKOUTS_PER_LEVEL) + 1;
    const intoLevel = workouts % WORKOUTS_PER_LEVEL;
    const toNext = WORKOUTS_PER_LEVEL - intoLevel;
    const activeDays = stats ? stats.weekly.filter((d) => d.calories > 0).length : 0;

    const plannedBurn = useMemo(
        () => Math.round(exercises.reduce((acc, ex) => acc + toNum(ex.sets) * toNum(ex.reps) * KCAL_PER_SET_REP, 0)),
        [exercises]
    );

    // POST /api/fitness/water-intake/ -> { glasses, total_ml, last_drink_at } (backend default 250 ml)
    const addWater = async () => {
        if (addingWater) return;
        setAddingWater(true);
        setWaterFailed(false);
        try {
            const { data } = await API.post('/api/fitness/water-intake/', { amount_ml: 250 });
            setWaterData((prev) => ({ ...prev, glasses: data.glasses, total_ml: data.total_ml }));
        } catch (err) {
            console.error('Add water failed', err);
            setWaterFailed(true);
        } finally {
            setAddingWater(false);
        }
    };

    if (loading) return <Skeleton />;

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="dx-inner">
                    <div className="error-state" role="alert">
                        <p>{error}</p>
                        <button className="dx-btn dx-btn-brand" onClick={fetchDashboardData}>
                            <RefreshCw size={16} /> Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ---- derived values for the UI ---- */
    const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const maxVal = Math.max(...chartData.map((d) => d[metric] || 0), 1);
    const weekTotal = chartData.reduce((a, d) => a + (d[metric] || 0), 0);
    const weekEmpty = chartData.every((d) => !d.calories && !d.consumed);

    const goalNow = stats?.current_weight;
    const goalTarget = stats?.target_weight ?? user?.target_weight ?? user?.goal_weight;
    const hasGoal = goalTarget !== null && goalTarget !== undefined;

    const milestones = [
        { id: 'first', icon: Dumbbell, title: 'First workout', desc: 'Finish your first workout', value: workouts, target: 1 },
        { id: 's3', icon: Flame, title: '3-day streak', desc: 'Train 3 days in a row', value: streak, target: 3 },
        { id: 's7', icon: Flame, title: '7-day streak', desc: 'Train 7 days in a row', value: streak, target: 7 },
        { id: 'w10', icon: Trophy, title: '10 workouts', desc: 'Complete 10 workouts', value: workouts, target: 10 },
        { id: 'water', icon: Droplets, title: 'Fully hydrated', desc: `Drink ${WATER_GOAL_GLASSES} glasses in a day`, value: waterData.glasses, target: WATER_GOAL_GLASSES },
    ].map((m) => ({ ...m, done: m.value >= m.target }));
    const unlocked = milestones.filter((m) => m.done).length;

    const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

    return (
        <div className="dashboard-container">
            <motion.div className="dx-inner" {...fade}>

                {/* ============ PAGE HEADER ============ */}
                <header className="dx-header">
                    <h1>{greeting}, {firstName}</h1>
                    <p>{dateLabel}</p>
                </header>

                {/* ============ TODAY + PROFILE ============ */}
                <div className="dx-main">
                    <section className="dx-today" style={{ '--hero-img': `url(${process.env.PUBLIC_URL || ''}/hero.jpg)` }} aria-label="Today's session">
                        <div className="dx-today-copy">
                            <p className="dx-today-label">Today's session</p>
                            <h2>{isRestDay ? 'Rest day' : todayWorkout?.focus}</h2>
                            <p className="dx-today-meta">
                                {isRestDay
                                    ? 'Recovery is part of training.'
                                    : `${exercises.length} exercises, about ${plannedBurn} kcal`}
                            </p>
                            <div className="dx-today-actions">
                                <button className="dx-btn dx-btn-grad" onClick={() => navigate('/workout')}>
                                    {isRestDay
                                        ? <><BedDouble size={18} /> View routine</>
                                        : <><Play size={17} fill="currentColor" /> Start workout</>}
                                </button>
                                {!isRestDay && (
                                    <button className="dx-btn dx-btn-glass" onClick={() => navigate('/workout')}>Full routine</button>
                                )}
                            </div>
                        </div>

                        <div className="dx-today-list">
                            {isRestDay ? (
                                <p className="dx-rest-note">
                                    No exercises are planned for today. Light stretching, a walk and good sleep
                                    will help you come back stronger.
                                </p>
                            ) : (
                                <>
                                    <ul>
                                        {exercises.slice(0, SESSION_PREVIEW).map((ex, i) => (
                                            <li key={i}>
                                                <span className="dx-ex-name">{ex.name}</span>
                                                <span className="dx-ex-sets">{ex.sets} × {ex.reps}</span>
                                                {ex.adaptive_note && <span className="dx-ex-note">{ex.adaptive_note}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                    {exercises.length > SESSION_PREVIEW && (
                                        <p className="dx-more">+ {exercises.length - SESSION_PREVIEW} more in your routine</p>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    <aside className="dx-profile" aria-label="Your progress">
                        <Avatar name={displayName} src={stats?.profile_pic ?? user?.profile_pic}
                            progress={intoLevel / WORKOUTS_PER_LEVEL} level={level} />
                        <h3>{displayName}</h3>
                        <p className="dx-level">Level {level}</p>
                        <div className="dx-xp" role="progressbar" aria-valuemin={0} aria-valuemax={WORKOUTS_PER_LEVEL} aria-valuenow={intoLevel} aria-label="Progress to next level">
                            <i style={{ width: `${(intoLevel / WORKOUTS_PER_LEVEL) * 100}%` }} />
                        </div>
                        <p className="dx-xp-note">{toNext} more {toNext === 1 ? 'workout' : 'workouts'} to Level {level + 1}</p>

                        <dl className="dx-facts">
                            <div><dd><Flame size={16} className="dx-ic-streak" />{streak}</dd><dt>Day streak</dt></div>
                            <div><dd>{workouts}</dd><dt>Workouts</dt></div>
                            <div><dd>{activeDays}</dd><dt>Active days</dt></div>
                        </dl>
                    </aside>
                </div>

                {/* ============ STAT STRIP ============ */}
                <section className="dx-strip" aria-label="Daily summary">
                    <div className="dx-cell">
                        <h2>Planned burn</h2>
                        <p className="dx-fig dx-fig-kcal">{plannedBurn}<span>kcal</span></p>
                        <p className="dx-note">{isRestDay ? 'No session today' : `From ${exercises.length} exercises`}</p>
                    </div>

                    <div className="dx-cell">
                        <h2>Water</h2>
                        <p className="dx-fig dx-fig-water">{waterData.glasses}<span>/ {WATER_GOAL_GLASSES} glasses</span></p>
                        <div className="dx-segs" aria-hidden="true">
                            {Array.from({ length: WATER_GOAL_GLASSES }, (_, i) => (
                                <i key={i} className={i < waterData.glasses ? 'on' : ''} />
                            ))}
                        </div>
                        <div className="dx-cell-row">
                            <p className="dx-note">{waterData.total_ml || 0} ml today</p>
                            <button className="dx-chip" onClick={addWater} disabled={addingWater} aria-label="Add one glass of water">
                                <Plus size={14} /> {addingWater ? 'Adding' : waterFailed ? 'Retry' : 'Add glass'}
                            </button>
                        </div>
                    </div>

                    <div className="dx-cell">
                        <h2>Protein target</h2>
                        <p className="dx-fig dx-fig-ok">{PROTEIN_GOAL_G}<span>g a day</span></p>
                        <div className="dx-cell-row">
                            <p className="dx-note">Fitty plans your meals around it</p>
                        </div>
                        <button className="dx-link" onClick={() => navigate('/diet')}><Utensils size={14} /> Open diet plan</button>
                    </div>

                    <div className="dx-cell">
                        <h2>Goal weight</h2>
                        {hasGoal ? (
                            <>
                                <p className="dx-fig">{goalTarget}<span>kg</span></p>
                                {goalNow != null ? (
                                    <>
                                        <div className="dx-bar"><i style={{ width: `${Math.round((Math.min(goalNow, goalTarget) / Math.max(goalNow, goalTarget)) * 100)}%` }} /></div>
                                        <p className="dx-note">{goalNow} kg now, {Math.abs(goalTarget - goalNow).toFixed(1)} kg to go</p>
                                    </>
                                ) : <p className="dx-note">Log your weight to track progress</p>}
                            </>
                        ) : (
                            <>
                                <p className="dx-note dx-note-lg">Set a target weight and Fitty will track how close you are.</p>
                                <button className="dx-link" onClick={() => navigate('/profile')}><Target size={14} /> Set goal weight</button>
                            </>
                        )}
                    </div>
                </section>

                {/* ============ WEEK + MILESTONES ============ */}
                <div className="dx-lower">
                    <section className="dx-week" aria-label="Weekly activity">
                        <header className="dx-sec-head">
                            <div>
                                <h2>This week</h2>
                                <p>{weekTotal.toLocaleString()} kcal {metric === 'calories' ? 'burned' : 'consumed'}</p>
                            </div>
                            <div className="dx-seg" role="tablist">
                                {[['calories', 'Burned'], ['consumed', 'Consumed']].map(([key, label]) => (
                                    <button key={key} role="tab" aria-selected={metric === key}
                                        className={metric === key ? 'active' : ''} onClick={() => setMetric(key)}>{label}</button>
                                ))}
                            </div>
                        </header>

                        <div className={`dx-plot m-${metric}`}>
                            <ol className="dx-cols">
                                {chartData.map((d) => {
                                    const v = d[metric] || 0;
                                    const pct = v ? Math.max((v / maxVal) * 100, 5) : 0;
                                    return (
                                        <li key={d.name} className={d.name === todayShort ? 'today' : ''}>
                                            <span className="dx-col-val">{v || ''}</span>
                                            <span className="dx-col-bar"><i style={{ height: `${pct}%` }} /></span>
                                            <span className="dx-col-day">{d.name}</span>
                                        </li>
                                    );
                                })}
                            </ol>
                            {weekEmpty && (
                                <div className="dx-plot-empty">
                                    <p>Your week fills in as you finish workouts.</p>
                                    <button className="dx-link" onClick={() => navigate('/workout')}>Start today's workout <ArrowRight size={14} /></button>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="dx-miles" aria-label="Milestones">
                        <header className="dx-sec-head">
                            <div>
                                <h2>Milestones</h2>
                                <p>{unlocked} of {milestones.length} unlocked</p>
                            </div>
                            <Award size={20} className="dx-ic-brand" />
                        </header>
                        <ul>
                            {milestones.map((m) => {
                                const Icon = m.icon;
                                return (
                                    <li key={m.id} className={m.done ? 'done' : ''}>
                                        <span className="dx-miles-ic"><Icon size={18} /></span>
                                        <div className="dx-miles-text">
                                            <h3>{m.title}</h3>
                                            <p>{m.desc}</p>
                                        </div>
                                        {m.done
                                            ? <span className="dx-miles-state ok"><Check size={14} /> Done</span>
                                            : <span className="dx-miles-state">{Math.min(m.value, m.target)}/{m.target}</span>}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

export default UserDashboard;