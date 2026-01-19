import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fittyVoice from "../utils/fittyVoice";
import API from "./axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Dumbbell, Activity, Info, ChevronRight,
  Edit2, Save, Play, Star, AlertCircle, Zap, TrendingUp, RefreshCw, PlayCircle, X
} from "lucide-react";
import { normalizeExerciseId } from "./utils/postureRules";
import "./Workout.css";

export default function Workout() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [aiExplanation, setAiExplanation] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [showPlanSelector, setShowPlanSelector] = useState(false); // New Modal for switching plans

  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editFocus, setEditFocus] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null); // Video Modal State
  const [videoUrlInput, setVideoUrlInput] = useState(""); // For editing video URL
  const [isSavingVideo, setIsSavingVideo] = useState(false);


  // Post-Workout Logic
  const [activeExercise, setActiveExercise] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ difficulty: "Medium", fatigue: 5, form: "Good" });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
      fetchWorkoutPlan();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchWorkoutPlan = async (force = false, goal = null) => {
    try {
      let url = "/api/accounts/workout/plan/";
      const params = [];
      if (force) params.push("force=true");
      if (goal) params.push(`goal=${encodeURIComponent(goal)}`);

      if (params.length > 0) url += "?" + params.join("&");

      const res = await API.get(url);
      setWeeklyPlan(res.data);
      if (goal) { // Update local display if goal changed
        localStorage.setItem('user_goal', goal);
        setShowPlanSelector(false);
        fittyVoice.speak(`Plan switched to ${goal}. Let's go.`);
      } else if (force) {
        fittyVoice.speak("Plan refreshed with latest data.");
      }


      // select today
      const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0
      setSelectedDayIndex(todayIndex);

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch plan", err);
      setLoading(false);
    }
  };

  const fetchExplanation = async () => {
    try {
      setShowExplanation(true);
      if (!aiExplanation) {
        const res = await API.get("/api/accounts/workout/explain/");
        setAiExplanation(res.data.explanation);
      }
    } catch (err) {
      console.error("AI Explain Error", err);
      setAiExplanation("AI is currently restocking whey protein. Try again later.");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const day = weeklyPlan[selectedDayIndex];
      const updatedPlan = [...weeklyPlan];
      updatedPlan[selectedDayIndex].focus = editFocus;
      setWeeklyPlan(updatedPlan);

      await API.put("/api/accounts/workout/plan/", {
        day_index: selectedDayIndex,
        focus: editFocus
      });

      setIsEditing(false);
      fittyVoice.speak("Plan updated.");
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleStartSession = () => {
    // Navigate to Posture Check with the first exercise of the day or user selection
    const day = weeklyPlan[selectedDayIndex];
    if (day && day.exercises.length > 0) {
      // Just pick the first one for auto-setup or let user pick.
      // The user asked for "Start Session" to go to posture.
      navigate("/posture", {
        state: {
          workoutContext: day.focus,
          exercises: day.exercises.map(e => e.name)
        }
      });
      fittyVoice.speak("Starting session. Let's crush it.");
    }
  };

  const submitFeedback = async () => {
    try {
      await API.post("/api/accounts/workout/feedback/", {
        day_index: selectedDayIndex,
        ...feedbackData
      });
      setShowFeedbackModal(false);
      fittyVoice.speak("Feedback received. adjusting your future training.");
      // Optionally refetch plan to see immediate updates if logic allows
      fetchWorkoutPlan();
    } catch (err) {
      console.error("Feedback failed", err);
    }
  };

  const handleSaveVideoUrl = async () => {
    if (!selectedVideo || !videoUrlInput.trim()) return;
    setIsSavingVideo(true);
    try {
      const day = weeklyPlan[selectedDayIndex];
      const updatedExercises = day.exercises.map(ex =>
        ex.name === selectedVideo.name ? { ...ex, video_url: videoUrlInput } : ex
      );

      // Update local state
      const updatedPlan = [...weeklyPlan];
      updatedPlan[selectedDayIndex].exercises = updatedExercises;
      setWeeklyPlan(updatedPlan);

      // Update selected video to reflect change immediately in UI (if we were re-rendering from prop)
      setSelectedVideo({ ...selectedVideo, video_url: videoUrlInput });

      // Persist to backend
      await API.put("/api/accounts/workout/plan/", {
        day_index: selectedDayIndex,
        exercises: updatedExercises
      });

      fittyVoice.speak("Video link saved.");
    } catch (err) {
      console.error("Failed to save video URL", err);
      fittyVoice.speak("Could not save video link.");
    } finally {
      setIsSavingVideo(false);
    }
  };

  // Effect to reset input when modal opens
  useEffect(() => {
    if (selectedVideo) {
      setVideoUrlInput(selectedVideo.video_url || "");
    }
  }, [selectedVideo]);


  if (loading) return <div className="loading-spinner">Loading your plan...</div>;

  if (!isLoggedIn) {
    return (
      <div className="workout-container restricted">
        <div className="login-gate">
          <h1>Unlock Your Personal Plan</h1>
          <p>Sign in to get AI-generated workouts tailored to your goal.</p>
          <button onClick={() => navigate('/auth?tab=login')}>Login Now</button>
        </div>
      </div>
    );
  }

  const currentDay = weeklyPlan[selectedDayIndex];

  return (
    <div className="workout-container">
      {/* HEADER */}
      <header className="page-header">
        <div>
          <h1 className="gradient-text">Weekly Schedule</h1>
          <p className="subtitle" onClick={() => setShowPlanSelector(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Goal: <span className="highlight-goal">{localStorage.getItem('user_goal') || 'Fitness'}</span>
            <Edit2 size={14} />
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="ai-insight-btn" onClick={() => fetchWorkoutPlan(true)}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button className="ai-insight-btn" onClick={fetchExplanation}>
            <Zap size={18} fill="currentColor" /> Why this workout?
          </button>
        </div>
      </header>

      {/* DAYS STRIP */}
      <div className="days-strip">
        {weeklyPlan.map((day, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`date-card ${idx === selectedDayIndex ? 'active' : ''}`}
            onClick={() => setSelectedDayIndex(idx)}
          >
            <span className="day-name">{day.day_name.substring(0, 3)}</span>
            {idx === selectedDayIndex && <motion.div layoutId="active-pill" className="active-pill" />}
          </motion.div>
        ))}
      </div>

      {/* ACTIVE DAY VIEW */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDayIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="day-detail-card"
        >
          <div className="day-header">
            {isEditing ? (
              <div className="edit-box">
                <input
                  value={editFocus}
                  onChange={(e) => setEditFocus(e.target.value)}
                  placeholder="Enter focus..."
                />
                <button onClick={handleSaveEdit} className="save-icon"><Save size={20} /></button>
              </div>
            ) : (
              <div className="focus-row">
                <h2>{currentDay?.focus}</h2>
                <button onClick={() => { setEditFocus(currentDay.focus); setIsEditing(true); }} className="edit-icon">
                  <Edit2 size={16} />
                </button>
              </div>
            )}

            <div className="day-actions">
              <button className="start-btn pulse" onClick={handleStartSession}>
                Start Session <Play size={20} fill="currentColor" />
              </button>
              <button className="feedback-btn-text" onClick={() => setShowFeedbackModal(true)}>
                Log Past Session
              </button>
            </div>
          </div>

          {/* EXERCISES */}
          <div className="exercises-list">
            {currentDay?.exercises?.length > 0 ? (
              currentDay.exercises.map((ex, i) => (
                <div key={i} className="exercise-row">
                  <div className="ex-icon"><Dumbbell /></div>
                  <div className="ex-info">
                    <h3>{ex.name}</h3>
                    <p>{ex.description}</p>
                    {/* Video Button */}
                    <button className="video-trigger" onClick={(e) => { e.stopPropagation(); setSelectedVideo(ex); }}>
                      <PlayCircle size={14} /> Watch Demo
                    </button>
                    {ex.adaptive_note && <span className="adaptive-badge">{ex.adaptive_note}</span>}
                  </div>
                  <div className="ex-stats">
                    <span className="stat-pill">{ex.sets} Sets</span>
                    <span className="stat-pill">{ex.reps} Reps</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rest-day-state">
                <Activity size={48} />
                <h3>Rest & Recovery</h3>
                <p>Take it easy today. Mobility work is optional.</p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* AI EXPLANATION MODAL */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExplanation(false)}>
            <motion.div className="modal-card ai-card" onClick={e => e.stopPropagation()}>
              <div className="ai-header">
                <Zap size={24} color="#FFD700" />
                <h3>Coach's Insight</h3>
              </div>
              <div className="ai-body">
                {aiExplanation ? (
                  <p>{aiExplanation}</p>
                ) : (
                  <div className="typing-indicator"><span>.</span><span>.</span><span>.</span></div>
                )}
              </div>
              <button onClick={() => setShowExplanation(false)}>Got it!</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK MODAL */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="modal-card feedback-card">
              <h3>Session Feedback</h3>

              <div className="fb-section">
                <label>Difficulty</label>
                <div className="segment-control">
                  {['Easy', 'Medium', 'Hard'].map(opt => (
                    <button
                      key={opt}
                      className={feedbackData.difficulty === opt ? 'active' : ''}
                      onClick={() => setFeedbackData({ ...feedbackData, difficulty: opt })}
                    >{opt}</button>
                  ))}
                </div>
              </div>

              <div className="fb-section">
                <label>Fatigue (1-10)</label>
                <input
                  type="range" min="1" max="10"
                  value={feedbackData.fatigue}
                  onChange={(e) => setFeedbackData({ ...feedbackData, fatigue: parseInt(e.target.value) })}
                />
                <span className="value-display">{feedbackData.fatigue}</span>
              </div>

              <div className="fb-section">
                <label>Form Quality</label>
                <select
                  value={feedbackData.form}
                  onChange={(e) => setFeedbackData({ ...feedbackData, form: e.target.value })}
                >
                  <option>Good</option>
                  <option>Needs Improvement</option>
                  <option>Poor</option>
                </select>
              </div>

              <div className="fb-actions">
                <button className="cancel" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                <button className="submit" onClick={submitFeedback}>Submit & Adapt</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIDEO PLAYER MODAL */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedVideo(null)}>
            <motion.div className="modal-card video-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedVideo.name}</h3>
                <button className="close-btn" onClick={() => setSelectedVideo(null)}>
                  <X size={24} />
                </button>
              </div>
              <div className="video-frame">
                {selectedVideo.video_url ? (
                  <div className="video-contain-wrapper">
                    <div className="video-wrapper">
                      <video controls autoPlay src={selectedVideo.video_url}>
                        Your browser does not support the video tag.
                      </video>
                      <div className="video-overlay-controls">
                        <button
                          className="ai-coach-btn-top"
                          onClick={() => {
                            const normalizedId = normalizeExerciseId(selectedVideo.name);
                            navigate("/posture", {
                              state: {
                                exercises: [selectedVideo.name],
                                exerciseId: normalizedId
                              }
                            });
                          }}
                        >
                          <Zap size={14} fill="currentColor" /> AI Coach
                        </button>

                        <button
                          className="change-video-btn-top"
                          onClick={() => {
                            setVideoUrlInput(selectedVideo.video_url);
                            setSelectedVideo({ ...selectedVideo, video_url: "" });
                          }}
                        >
                          <Edit2 size={14} /> Change Video
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-video-state">
                    <Dumbbell size={48} className="bounce" />
                    <p>No video uploaded yet.</p>

                    <div className="video-input-group">
                      <input
                        type="text"
                        placeholder="Paste your .mp4 or video link here..."
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        className="video-url-input"
                      />
                      <button onClick={handleSaveVideoUrl} disabled={isSavingVideo} className="save-video-btn">
                        {isSavingVideo ? "Saving..." : "Save Video Link"}
                      </button>
                    </div>
                    <button
                      className="ai-form-check-btn"
                      style={{ marginTop: '15px' }}
                      onClick={() => {
                        const normalizedId = normalizeExerciseId(selectedVideo.name);
                        navigate("/posture", {
                          state: {
                            exercises: [selectedVideo.name],
                            exerciseId: normalizedId
                          }
                        });
                      }}
                    >
                      <Zap size={16} fill="white" /> Check Form in AI
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PLAN SELECTOR MODAL */}
      <AnimatePresence>
        {showPlanSelector && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPlanSelector(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <h3>Switch Training Goal</h3>
              <div className="grid-options">
                {['Muscle Building', 'Weight Loss', 'Flexibility & Mobility', 'Endurance Building'].map(g => (
                  <button key={g} className="goal-switch-btn" onClick={() => fetchWorkoutPlan(true, g)}>
                    {g}
                  </button>
                ))}
              </div>
              <button className="close-simple" onClick={() => setShowPlanSelector(false)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
