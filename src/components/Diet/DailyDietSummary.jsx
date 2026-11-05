import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fetchDailySummary, logWater, removeLogEntry } from '../../services/dietService';
import './DailyDietSummary.css';

const DailyDietSummary = ({ summary: propSummary, onRefresh, refreshTrigger }) => {
    const today = new Date().toLocaleDateString('en-CA');
    const [localSummary, setLocalSummary] = useState(null);
    const [loadingWater, setLoadingWater] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const loadSummary = useCallback(async () => {
        try {
            const data = await fetchDailySummary(today);
            setLocalSummary(data);
        } catch (err) {
            console.error("Failed to fetch daily summary", err);
        }
    }, [today]);

    useEffect(() => {
        if (propSummary) {
            setLocalSummary(propSummary);
        } else {
            loadSummary();
        }
    }, [propSummary, loadSummary, refreshTrigger]);

    const summary = propSummary || localSummary;

    const handleWaterDelta = async (delta) => {
        if (loadingWater) return;
        setLoadingWater(true);
        try {
            await logWater(today, { delta });
            if (onRefresh) {
                await onRefresh();
            } else {
                await loadSummary();
            }
        } catch (err) {
            console.error("Water log error:", err);
        } finally {
            setLoadingWater(false);
        }
    };

    const handleDeleteEntry = async (entryId) => {
        if (!entryId || deletingId) return;
        setDeletingId(entryId);
        try {
            await removeLogEntry(today, entryId);
            if (onRefresh) {
                await onRefresh();
            } else {
                await loadSummary();
            }
        } catch (err) {
            console.error("Remove log error:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const targets = summary?.targets || { calories: 2000, protein: 120, carbs: 220, fats: 60, water: 8 };
    const consumed = summary?.consumed || { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
    const remaining = summary?.remaining || { calories: 2000, protein: 120, carbs: 220, fats: 60, water: 8 };
    const percent = summary?.percent || { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
    const overTarget = summary?.over_target || {};
    const entries = summary?.entries || [];

    const getProgressClass = (key) => {
        if (overTarget[key] || percent[key] > 100) return 'progress-fill over-target';
        if (percent[key] >= 85) return 'progress-fill warning-target';
        return `progress-fill fill-${key.slice(0, 3)}`;
    };

    return (
        <div className="daily-summary-card">
            <div className="summary-card-header">
                <h3 className="summary-title">📊 Today's Nutrition Summary</h3>
                <span className="summary-date-badge">{today}</span>
            </div>

            {/* Live Totals Grid */}
            <div className="summary-grid" aria-live="polite">
                {/* Calories */}
                <div className="summary-item">
                    <div className="summary-header">
                        <span className="macro-name">🔥 Calories</span>
                        <span className="summary-val">{consumed.calories} / {targets.calories} kcal</span>
                    </div>
                    <div className="progress-track" role="progressbar" aria-valuenow={percent.calories} aria-valuemin="0" aria-valuemax="100">
                        <motion.div
                            className={getProgressClass('calories')}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percent.calories, 100)}%` }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                    <div className="macro-sub-info">
                        <small className={remaining.calories < 0 ? 'text-over' : 'text-remaining'}>
                            {remaining.calories < 0 ? `${Math.abs(remaining.calories)} kcal over` : `${remaining.calories} kcal remaining`}
                        </small>
                        <small className="pct-label">{percent.calories}%</small>
                    </div>
                </div>

                {/* Protein */}
                <div className="summary-item">
                    <div className="summary-header">
                        <span className="macro-name">💪 Protein</span>
                        <span className="summary-val">{consumed.protein}g / {targets.protein}g</span>
                    </div>
                    <div className="progress-track" role="progressbar" aria-valuenow={percent.protein} aria-valuemin="0" aria-valuemax="100">
                        <motion.div
                            className={getProgressClass('protein')}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percent.protein, 100)}%` }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                    <div className="macro-sub-info">
                        <small className={remaining.protein < 0 ? 'text-over' : 'text-remaining'}>
                            {remaining.protein < 0 ? `${Math.abs(remaining.protein)}g over` : `${remaining.protein}g remaining`}
                        </small>
                        <small className="pct-label">{percent.protein}%</small>
                    </div>
                </div>

                {/* Carbs */}
                <div className="summary-item">
                    <div className="summary-header">
                        <span className="macro-name">🌾 Carbs</span>
                        <span className="summary-val">{consumed.carbs}g / {targets.carbs}g</span>
                    </div>
                    <div className="progress-track" role="progressbar" aria-valuenow={percent.carbs} aria-valuemin="0" aria-valuemax="100">
                        <motion.div
                            className={getProgressClass('carbs')}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percent.carbs, 100)}%` }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                    <div className="macro-sub-info">
                        <small className={remaining.carbs < 0 ? 'text-over' : 'text-remaining'}>
                            {remaining.carbs < 0 ? `${Math.abs(remaining.carbs)}g over` : `${remaining.carbs}g remaining`}
                        </small>
                        <small className="pct-label">{percent.carbs}%</small>
                    </div>
                </div>

                {/* Fats */}
                <div className="summary-item">
                    <div className="summary-header">
                        <span className="macro-name">🥑 Fats</span>
                        <span className="summary-val">{consumed.fats}g / {targets.fats}g</span>
                    </div>
                    <div className="progress-track" role="progressbar" aria-valuenow={percent.fats} aria-valuemin="0" aria-valuemax="100">
                        <motion.div
                            className={getProgressClass('fats')}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percent.fats, 100)}%` }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                    <div className="macro-sub-info">
                        <small className={remaining.fats < 0 ? 'text-over' : 'text-remaining'}>
                            {remaining.fats < 0 ? `${Math.abs(remaining.fats)}g over` : `${remaining.fats}g remaining`}
                        </small>
                        <small className="pct-label">{percent.fats}%</small>
                    </div>
                </div>
            </div>

            {/* Water Tracker */}
            <div className="water-tracker-container">
                <div className="water-header">
                    <div className="water-title-wrap">
                        <span className="water-icon">💧</span>
                        <div>
                            <span className="water-title">Hydration Tracker</span>
                            <small className="water-count">{consumed.water} / {targets.water || 8} glasses ({Math.round(consumed.water * 250)} ml)</small>
                        </div>
                    </div>
                    <div className="water-stepper">
                        <button
                            type="button"
                            className="water-btn minus"
                            aria-label="Decrease water intake by 1 glass"
                            disabled={loadingWater || consumed.water <= 0}
                            onClick={() => handleWaterDelta(-1)}
                        >
                            -
                        </button>
                        <span className="water-val-badge">{consumed.water}</span>
                        <button
                            type="button"
                            className="water-btn plus"
                            aria-label="Increase water intake by 1 glass"
                            disabled={loadingWater}
                            onClick={() => handleWaterDelta(1)}
                        >
                            +
                        </button>
                    </div>
                </div>
                <div className="water-glasses-row">
                    {Array.from({ length: Math.max(targets.water || 8, 8) }).map((_, i) => (
                        <span
                            key={i}
                            className={`glass-glyph ${i < consumed.water ? 'glass-filled' : 'glass-empty'}`}
                            title={`Glass ${i + 1}`}
                        >
                            🥛
                        </span>
                    ))}
                </div>
            </div>

            {/* Today's Logged Entries */}
            {entries.length > 0 && (
                <div className="logged-entries-section">
                    <h4 className="entries-subtitle">📝 Today's Logged Items ({entries.length})</h4>
                    <div className="entries-list">
                        {entries.map((entry) => (
                            <div key={entry.id} className="entry-row">
                                <span className={`entry-tag tag-${(entry.meal_type || 'snack').toLowerCase()}`}>
                                    {entry.meal_type || 'Meal'}
                                </span>
                                <div className="entry-desc">
                                    <span className="entry-text">{entry.text || 'Logged Meal'}</span>
                                    {entry.items && entry.items.length > 0 && (
                                        <small className="entry-items-preview">{entry.items.join(', ')}</small>
                                    )}
                                </div>
                                <div className="entry-actions">
                                    <span className="entry-cal">+{entry.calories} kcal</span>
                                    <button
                                        type="button"
                                        className="entry-del-btn"
                                        aria-label={`Remove log entry ${entry.text}`}
                                        disabled={deletingId === entry.id}
                                        onClick={() => handleDeleteEntry(entry.id)}
                                        title="Delete entry"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyDietSummary;
