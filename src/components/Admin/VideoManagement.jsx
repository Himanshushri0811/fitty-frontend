import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, Video, Trash2, Loader2, AlertCircle } from 'lucide-react';
import API from '../axiosConfig';
import { FIXED_WEEKLY_PLAN } from '../SmartWorkout/standardPlan';
import './Admin.css';

const VideoManagement = () => {
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [exercises, setExercises] = useState({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Fetch existing exercises from backend to check video status
    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const res = await API.get('/api/workouts/exercises/');
                // Map to object for quick lookup: { "Bench Press": { hasVideo: true, url: "...", id: "..." } }
                const exMap = {};
                res.data.forEach(ex => {
                    exMap[ex.name] = {
                        hasVideo: !!ex.video_url,
                        url: ex.video_url,
                        id: ex.id
                    };
                });
                setExercises(exMap);
            } catch (err) {
                console.error("Failed to load exercises", err);
            }
        };
        fetchExisting();
    }, [refreshTrigger]);

    const handleUpload = async (file, exerciseName) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);
        formData.append('exercise_id', exerciseName);

        setUploading(exerciseName);

        // Determine if Upload or Replace
        const isReplace = exercises[exerciseName]?.hasVideo;
        const endpoint = isReplace
            ? '/api/workouts/admin/videos/replace/'
            : '/api/workouts/admin/videos/upload/';

        try {
            await API.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error(err);
            alert(`Upload/Replace failed: ${err.response?.data?.error || err.message}`);
        } finally {
            setUploading(false);
            // Reset file input if possible, or reliance on React key update
        }
    };

    const handleDelete = async (exerciseName) => {
        const exData = exercises[exerciseName];
        if (!exData || !exData.id) {
            alert("Cannot delete: Exercise not found in database.");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete the video for ${exerciseName}? This will remove it from Cloudinary.`)) return;

        setDeleting(exerciseName);
        try {
            // Call dedicated delete endpoint
            await API.delete(`/api/workouts/admin/videos/delete/${exData.id}/`);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error(err);
            alert(`Delete failed: ${err.response?.data?.error || err.message}`);
        } finally {
            setDeleting(false);
        }
    };

    const currentRoutine = FIXED_WEEKLY_PLAN[selectedDayIndex];

    return (
        <div className="video-mgmt-container">
            <div className="day-tabs">
                {FIXED_WEEKLY_PLAN.map((day, idx) => (
                    <button
                        key={idx}
                        className={`day-tab ${selectedDayIndex === idx ? 'active' : ''}`}
                        onClick={() => setSelectedDayIndex(idx)}
                    >
                        {day.day_name}
                    </button>
                ))}
            </div>

            <div className="workout-day-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>{currentRoutine.day_name}</h3>
                    <span className="role-badge gym_owner" style={{ fontSize: '0.9rem' }}>{currentRoutine.focus_area}</span>
                </div>

                {currentRoutine.categories.map((cat, catIdx) => (
                    <div key={catIdx} className="mgmt-category">
                        <h4>{cat.name}</h4>
                        <div className="mgmt-exercise-grid">
                            {cat.exercises.map((exName, exIdx) => {
                                const status = exercises[exName] || { hasVideo: false };
                                const isProcessing = uploading === exName || deleting === exName;

                                return (
                                    <div className="mgmt-exercise-card" key={exIdx}>
                                        <div className="card-header">
                                            <h5>{exName}</h5>
                                            {status.hasVideo ?
                                                <span className="status-indicator success"><CheckCircle size={14} /> Uploaded</span> :
                                                <span className="status-indicator pending"><AlertCircle size={14} /> Pending</span>
                                            }
                                        </div>

                                        <div className="card-actions">
                                            {/* Upload / Replace Button */}
                                            <label className={`upload-label ${isProcessing ? 'disabled' : ''}`}>
                                                {uploading === exName ? <Loader2 className="spin" size={16} /> : <UploadCloud size={16} />}
                                                <span>{status.hasVideo ? 'Replace Video' : 'Upload Video'}</span>
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    hidden
                                                    onChange={(e) => handleUpload(e.target.files[0], exName)}
                                                    disabled={isProcessing}
                                                    onClick={(e) => { e.target.value = null }} // Allow re-uploading same file
                                                />
                                            </label>

                                            {status.hasVideo && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="preview-btn"
                                                        style={{ flex: 1 }}
                                                        onClick={() => window.open(status.url, '_blank')}
                                                    >
                                                        <Video size={16} /> Play
                                                    </button>
                                                    <button
                                                        className="preview-btn"
                                                        style={{ flex: 0.4, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                                        onClick={() => handleDelete(exName)}
                                                        disabled={isProcessing}
                                                    >
                                                        {deleting === exName ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoManagement;
