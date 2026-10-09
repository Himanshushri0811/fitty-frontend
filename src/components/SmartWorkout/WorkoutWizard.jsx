import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Dumbbell, Activity, Calendar, User, ArrowRight, CheckCircle, 
    Loader2, Trash2, ChevronUp, ChevronDown, Plus, Sparkles, AlertCircle, X, Clock, ShieldAlert
} from 'lucide-react';
import API from '../axiosConfig';
import './SmartWorkout.css';

const MUSCLE_OPTIONS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Bicep', 'Tricep', 'Abs', 'Full Body'];
const EQUIPMENT_OPTIONS = ['None (Bodyweight)', 'Dumbbells', 'Barbell', 'Full Gym', 'Resistance Bands', 'Cable Machine'];
const DURATION_OPTIONS = [30, 45, 60, 90];

const WorkoutWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // Form Inputs
    const [formData, setFormData] = useState({
        age: '',
        weight: '',
        height: '',
        gender: 'Male',
        goal: 'General Fitness',
        experience_level: 'Beginner',
        duration_min: 45,
        equipment: ['Dumbbells'],
        focus: ['Full Body'],
        days_per_week: 5,
        injuries: ''
    });

    // Preview Mode State
    const [previewMode, setPreviewMode] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [planSource, setPlanSource] = useState('ai'); // 'ai' or 'template'

    // Exercise Picker Modal State
    const [pickerModal, setPickerModal] = useState({ show: false, dayIndex: null });
    const [pickerSearch, setPickerSearch] = useState('');
    const [pickerMuscle, setPickerMuscle] = useState('');
    const [libraryResults, setLibraryResults] = useState([]);
    const [libraryLoading, setLibraryLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEquipmentToggle = (item) => {
        setFormData(prev => {
            const current = prev.equipment;
            if (current.includes(item)) {
                return { ...prev, equipment: current.filter(i => i !== item) };
            } else {
                return { ...prev, equipment: [...current, item] };
            }
        });
    };

    const handleFocusToggle = (muscle) => {
        setFormData(prev => {
            const current = prev.focus;
            if (current.includes(muscle)) {
                return { ...prev, focus: current.filter(m => m !== muscle) };
            } else {
                return { ...prev, focus: [...current, muscle] };
            }
        });
    };

    const handleGenerate = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const payload = {
                ...formData,
                save: false // Request preview mode
            };
            const response = await API.post('/api/workouts/generate/', payload);
            if (response.data && response.data.plan) {
                setGeneratedPlan(response.data.plan);
                setPlanSource(response.data.source || 'ai');
                setPreviewMode(true);
            } else {
                setErrorMessage('Unexpected response from AI service. Please try again.');
            }
        } catch (error) {
            console.error("Failed to generate workout", error);
            const msg = error.response?.data?.error || "AI Generation failed. Please try again.";
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    // Plan editing functions
    const updateDayFocus = (dayIdx, newFocus) => {
        setGeneratedPlan(prev => {
            const routines = [...prev.routines];
            routines[dayIdx] = { ...routines[dayIdx], focus_area: newFocus };
            return { ...prev, routines };
        });
    };

    const updateExerciseField = (dayIdx, exIdx, field, value) => {
        setGeneratedPlan(prev => {
            const routines = [...prev.routines];
            const exercises = [...routines[dayIdx].exercises];
            exercises[exIdx] = { ...exercises[exIdx], [field]: value };
            routines[dayIdx] = { ...routines[dayIdx], exercises };
            return { ...prev, routines };
        });
    };

    const removeExercise = (dayIdx, exIdx) => {
        setGeneratedPlan(prev => {
            const routines = [...prev.routines];
            const exercises = routines[dayIdx].exercises.filter((_, i) => i !== exIdx);
            routines[dayIdx] = { ...routines[dayIdx], exercises };
            return { ...prev, routines };
        });
    };

    const moveExercise = (dayIdx, exIdx, direction) => {
        setGeneratedPlan(prev => {
            const routines = [...prev.routines];
            const exercises = [...routines[dayIdx].exercises];
            const targetIdx = exIdx + direction;
            if (targetIdx < 0 || targetIdx >= exercises.length) return prev;
            const temp = exercises[exIdx];
            exercises[exIdx] = exercises[targetIdx];
            exercises[targetIdx] = temp;
            routines[dayIdx] = { ...routines[dayIdx], exercises };
            return { ...prev, routines };
        });
    };

    // Exercise Library Picker
    const openExercisePicker = (dayIdx) => {
        setPickerModal({ show: true, dayIndex: dayIdx });
        fetchLibraryExercises('', '');
    };

    const fetchLibraryExercises = async (muscle, q) => {
        setLibraryLoading(true);
        try {
            const params = {};
            if (muscle) params.muscle = muscle;
            if (q) params.q = q;
            const res = await API.get('/api/workouts/library/', { params });
            setLibraryResults(res.data || []);
        } catch (e) {
            console.error("Failed to fetch library", e);
        } finally {
            setLibraryLoading(false);
        }
    };

    const addExerciseToDay = (libraryEx) => {
        if (pickerModal.dayIndex === null) return;
        setGeneratedPlan(prev => {
            const routines = [...prev.routines];
            const exercises = [...(routines[pickerModal.dayIndex].exercises || [])];
            exercises.push({
                name: libraryEx.name,
                sets: 3,
                reps: "12",
                rest: 60,
                notes: `Target: ${libraryEx.muscle}`,
                video_url: libraryEx.video_url,
                thumbnail: libraryEx.thumbnail
            });
            routines[pickerModal.dayIndex] = { ...routines[pickerModal.dayIndex], exercises };
            return { ...prev, routines };
        });
        setPickerModal({ show: false, dayIndex: null });
    };

    const handleSavePlan = async () => {
        if (!generatedPlan) return;
        setSaving(true);
        setErrorMessage('');
        try {
            const payload = {
                name: generatedPlan.name || "My Custom Plan",
                goal: generatedPlan.goal || formData.goal,
                routines: generatedPlan.routines
            };
            const res = await API.post('/api/workouts/save/', payload);
            if (res.data) {
                localStorage.setItem('workout_tab', 'my_plan');
                navigate('/workout');
            }
        } catch (e) {
            console.error("Save plan error", e);
            setErrorMessage(e.response?.data?.error || "Failed to save plan.");
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const variants = {
        enter: { x: 80, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -80, opacity: 0 }
    };

    // PREVIEW AND CUSTOMIZE SCREEN
    if (previewMode && generatedPlan) {
        return (
            <div className="wizard-container">
                <div className="preview-customizer-card">
                    <div className="preview-header">
                        <div>
                            <h2>Preview & Customize Your Plan</h2>
                            <p className="preview-subtitle">Fine-tune exercises, sets, reps and rest times before saving.</p>
                        </div>
                        {planSource === 'template' && (
                            <span className="source-badge">
                                Offline plan, AI was unavailable
                            </span>
                        )}
                    </div>

                    {errorMessage && (
                        <div className="error-alert">
                            <AlertCircle size={18} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="plan-name-input-group">
                        <label>Plan Name</label>
                        <input 
                            type="text" 
                            value={generatedPlan.name || ''} 
                            onChange={(e) => setGeneratedPlan(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div className="preview-routines-list">
                        {(generatedPlan.routines || []).map((routine, dayIdx) => (
                            <div key={dayIdx} className="routine-edit-card">
                                <div className="routine-edit-header">
                                    <span className="routine-day-badge">{routine.day_name}</span>
                                    <input 
                                        type="text"
                                        className="focus-edit-input"
                                        value={routine.focus_area || ''}
                                        onChange={(e) => updateDayFocus(dayIdx, e.target.value)}
                                        placeholder="Focus Area (e.g. Chest & Triceps)"
                                    />
                                    <button 
                                        className="btn-add-ex-mini"
                                        onClick={() => openExercisePicker(dayIdx)}
                                        title="Add Exercise"
                                    >
                                        <Plus size={16} /> Add Exercise
                                    </button>
                                </div>

                                <div className="routine-exercises-table">
                                    {(!routine.exercises || routine.exercises.length === 0) ? (
                                        <p className="rest-note">Rest / Recovery Day (No exercises scheduled)</p>
                                    ) : (
                                        routine.exercises.map((ex, exIdx) => (
                                            <div key={exIdx} className="exercise-edit-row">
                                                <div className="ex-title-cell">
                                                    <strong>{ex.name}</strong>
                                                </div>
                                                <div className="ex-inputs-cell">
                                                    <div className="input-mini">
                                                        <label>Sets</label>
                                                        <input 
                                                            type="number" 
                                                            min="1" max="10"
                                                            value={ex.sets || 3}
                                                            onChange={(e) => updateExerciseField(dayIdx, exIdx, 'sets', parseInt(e.target.value) || 1)}
                                                        />
                                                    </div>
                                                    <div className="input-mini">
                                                        <label>Reps</label>
                                                        <input 
                                                            type="text" 
                                                            value={ex.reps || "12"}
                                                            onChange={(e) => updateExerciseField(dayIdx, exIdx, 'reps', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="input-mini">
                                                        <label>Rest(s)</label>
                                                        <input 
                                                            type="number" 
                                                            step="5" min="0" max="600"
                                                            value={ex.rest || 60}
                                                            onChange={(e) => updateExerciseField(dayIdx, exIdx, 'rest', parseInt(e.target.value) || 30)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="ex-actions-cell">
                                                    <button 
                                                        disabled={exIdx === 0} 
                                                        onClick={() => moveExercise(dayIdx, exIdx, -1)}
                                                        title="Move Up"
                                                    >
                                                        <ChevronUp size={16} />
                                                    </button>
                                                    <button 
                                                        disabled={exIdx === routine.exercises.length - 1} 
                                                        onClick={() => moveExercise(dayIdx, exIdx, 1)}
                                                        title="Move Down"
                                                    >
                                                        <ChevronDown size={16} />
                                                    </button>
                                                    <button 
                                                        className="btn-trash"
                                                        onClick={() => removeExercise(dayIdx, exIdx)}
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="customizer-actions-bar">
                        <button className="secondary-btn" onClick={() => setPreviewMode(false)}>
                            Cancel / Edit Inputs
                        </button>
                        <button className="secondary-btn" onClick={handleGenerate} disabled={loading}>
                            {loading ? <><Loader2 className="spin" size={16} /> Regenerating...</> : "Regenerate"}
                        </button>
                        <button className="primary-btn glow" onClick={handleSavePlan} disabled={saving}>
                            {saving ? <><Loader2 className="spin" size={16} /> Saving...</> : "Save as My Plan"}
                        </button>
                    </div>
                </div>

                {/* MODAL PICKER FOR ADDING EXERCISES */}
                <AnimatePresence>
                    {pickerModal.show && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="video-modal-overlay"
                            onClick={() => setPickerModal({ show: false, dayIndex: null })}
                        >
                            <motion.div 
                                initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                                className="picker-modal-content"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="modal-header">
                                    <h3>Choose Exercise from Library</h3>
                                    <button className="close-btn" onClick={() => setPickerModal({ show: false, dayIndex: null })}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="picker-filters">
                                    <input 
                                        type="text" 
                                        placeholder="Search by exercise name..."
                                        value={pickerSearch}
                                        onChange={(e) => {
                                            setPickerSearch(e.target.value);
                                            fetchLibraryExercises(pickerMuscle, e.target.value);
                                        }}
                                    />
                                    <select 
                                        value={pickerMuscle}
                                        onChange={(e) => {
                                            setPickerMuscle(e.target.value);
                                            fetchLibraryExercises(e.target.value, pickerSearch);
                                        }}
                                    >
                                        <option value="">All Muscle Groups</option>
                                        {MUSCLE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>

                                <div className="picker-results-list">
                                    {libraryLoading ? (
                                        <div className="picker-loading"><Loader2 className="spin" /> Loading library...</div>
                                    ) : libraryResults.length === 0 ? (
                                        <p className="no-results">No matching exercises found.</p>
                                    ) : (
                                        libraryResults.map((item) => (
                                            <div key={item.id} className="picker-item-row">
                                                <div>
                                                    <strong>{item.name}</strong>
                                                    <span className="lib-badge">{item.muscle} • {item.equipment}</span>
                                                </div>
                                                <button 
                                                    className="primary-btn-sm" 
                                                    onClick={() => addExerciseToDay(item)}
                                                >
                                                    <Plus size={14} /> Add
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // 3-STEP WIZARD FORM
    return (
        <div className="wizard-container">
            <div className="wizard-card">
                <div className="wizard-progress">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                </div>

                <h2 className="wizard-title">
                    {step === 1 && "Personal Profile & Safety"}
                    {step === 2 && "Goals & Session Focus"}
                    {step === 3 && "Equipment & Days"}
                </h2>

                {errorMessage && (
                    <div className="error-alert">
                        <AlertCircle size={18} />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <AnimatePresence mode='wait'>
                    {/* STEP 1: Profile & Safety */}
                    {step === 1 && (
                        <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" className="step-content">
                            <div className="input-group">
                                <label><User size={18} /> Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Years (e.g. 25)" />
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>Weight (kg)</label>
                                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="kg" />
                                </div>
                                <div className="input-group">
                                    <label>Height (cm)</label>
                                    <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="cm" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label><ShieldAlert size={18} /> Injuries or Physical Limitations</label>
                                <input 
                                    type="text" 
                                    name="injuries" 
                                    value={formData.injuries} 
                                    onChange={handleChange} 
                                    placeholder="e.g. lower back pain, knee arthritis, none" 
                                />
                            </div>
                            <button className="primary-btn" onClick={nextStep}>Next <ArrowRight size={18} /></button>
                        </motion.div>
                    )}

                    {/* STEP 2: Goals & Duration */}
                    {step === 2 && (
                        <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" className="step-content">
                            <div className="input-group">
                                <label><Activity size={18} /> Fitness Goal</label>
                                <div className="options-grid">
                                    {['Fat Loss', 'Muscle Gain', 'Strength', 'General Fitness'].map(g => (
                                        <button key={g}
                                            className={`option-btn ${formData.goal === g ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, goal: g })}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Experience Level</label>
                                <div className="options-grid">
                                    {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                                        <button key={l}
                                            className={`option-btn ${formData.experience_level === l ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, experience_level: l })}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group">
                                <label><Clock size={18} /> Session Duration</label>
                                <div className="options-grid small">
                                    {DURATION_OPTIONS.map(d => (
                                        <button key={d}
                                            className={`option-btn ${formData.duration_min === d ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, duration_min: d })}
                                        >
                                            {d} Mins
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Focus Muscle Groups</label>
                                <div className="options-grid small">
                                    {MUSCLE_OPTIONS.map(m => (
                                        <button key={m}
                                            className={`option-btn ${formData.focus.includes(m) ? 'selected' : ''}`}
                                            onClick={() => handleFocusToggle(m)}
                                        >
                                            {formData.focus.includes(m) && <CheckCircle size={14} />} {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="btn-row">
                                <button className="secondary-btn" onClick={prevStep}>Back</button>
                                <button className="primary-btn" onClick={nextStep}>Next <ArrowRight size={18} /></button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Equipment & Schedule */}
                    {step === 3 && (
                        <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" className="step-content">
                            <div className="input-group">
                                <label><Dumbbell size={18} /> Available Equipment</label>
                                <div className="options-grid small">
                                    {EQUIPMENT_OPTIONS.map(eq => (
                                        <button key={eq}
                                            className={`option-btn ${formData.equipment.includes(eq) ? 'selected' : ''}`}
                                            onClick={() => handleEquipmentToggle(eq)}
                                        >
                                            {formData.equipment.includes(eq) && <CheckCircle size={14} />} {eq}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group">
                                <label><Calendar size={18} /> Days Per Week: {formData.days_per_week}</label>
                                <input
                                    type="range" min="1" max="7" step="1"
                                    name="days_per_week"
                                    value={formData.days_per_week}
                                    onChange={handleChange}
                                    className="range-slider"
                                />
                            </div>

                            <div className="btn-row">
                                <button className="secondary-btn" onClick={prevStep}>Back</button>
                                <button className="primary-btn glow" onClick={handleGenerate} disabled={loading}>
                                    {loading ? (
                                        <><Loader2 className="spin" /> Generating Plan with AI...</>
                                    ) : (
                                        <><Sparkles size={16} /> Generate & Preview Plan</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WorkoutWizard;
