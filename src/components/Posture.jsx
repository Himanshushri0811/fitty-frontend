import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Pose } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import fittyVoice from "../utils/fittyVoice";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Camera, RefreshCw, CheckCircle2, AlertTriangle, XCircle, 
    Play, ArrowLeft, ShieldAlert, Activity, Info, Loader2 
} from "lucide-react";
import "./Posture.css";

import { POSTURE_RULES, normalizeExerciseId } from "./utils/postureRules";
import { 
    PostureSession, 
    getRepConfig, 
    startFrameLoop, 
    openCamera, 
    stopCamera, 
    describeCameraError, 
    requestWakeLock 
} from "../utils/postureEngine";

// Cached Pose model instance
let cachedPose = null;
const getCachedPose = (isMobile) => {
    if (!cachedPose) {
        cachedPose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });
        cachedPose.setOptions({
            modelComplexity: isMobile ? 0 : 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
    }
    return cachedPose;
};

const PostureDetector = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [workout, setWorkout] = useState(null);
    const [exercise, setExercise] = useState(null);
    const [exerciseId, setExerciseId] = useState('default');
    const [isStarted, setIsStarted] = useState(false);
    const [deviceType, setDeviceType] = useState("desktop");
    const [facingMode, setFacingMode] = useState("user"); 
    const [modelLoading, setModelLoading] = useState(true);
    const [cameraError, setCameraError] = useState(null);

    // Live feedback & Rep metrics
    const [feedback, setFeedback] = useState("Align yourself in the frame...");
    const [postureStatus, setPostureStatus] = useState("waiting"); // 'ok' | 'bad' | 'waiting'
    const [safetyAlert, setSafetyAlert] = useState(false);
    const [repCount, setRepCount] = useState(0);
    const [repPhase, setRepPhase] = useState("up");
    const [allVisible, setAllVisible] = useState(true);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const sessionRef = useRef(null);
    const streamRef = useRef(null);
    const wakeLockRef = useRef(null);
    const lastVoiceTime = useRef(0);
    const safetyStartTime = useRef(0);
    const lastRuleStatuses = useRef({});

    // Auth & Route initialization
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
        setDeviceType(isMobile ? "mobile" : "desktop");

        if (location.state?.exercises && location.state?.exercises.length > 0) {
            const incomingName = location.state.exercises[0];
            const currentId = location.state.exerciseId || normalizeExerciseId(incomingName);

            setWorkout("Auto-Selected");
            setExercise(incomingName);
            setExerciseId(currentId);
            setIsStarted(true);

            // Construct standardized rules for PostureSession
            let sessionRules = [];
            if (location.state.poseConfig && Array.isArray(location.state.poseConfig) && location.state.poseConfig.length > 0) {
                sessionRules = location.state.poseConfig.map(r => ({
                    name: r.name || 'Posture Rule',
                    check_type: r.check_type || 'angle',
                    keypoints: r.keypoints || [11, 13, 15],
                    min: r.min ?? r.min_val ?? 45,
                    max: r.max ?? r.max_val ?? 175,
                    message: r.message || { correct: "Good form", unsafe: `Watch ${r.name}` }
                }));
            } else {
                // Static fallback rule conversion
                const staticConfig = POSTURE_RULES[currentId] || POSTURE_RULES['default'];
                if (staticConfig?.keypoints && staticConfig.keypoints.length >= 3) {
                    sessionRules = [{
                        name: staticConfig.displayName || incomingName,
                        check_type: 'angle',
                        keypoints: staticConfig.keypoints.slice(0, 3),
                        min: 50,
                        max: 170,
                        message: { correct: "Form looks good", unsafe: "Watch joint angle" }
                    }];
                } else {
                    sessionRules = [{
                        name: incomingName,
                        check_type: 'angle',
                        keypoints: [11, 13, 15],
                        min: 45,
                        max: 175,
                        message: { correct: "Form looks good", unsafe: "Maintain controlled form" }
                    }];
                }
            }

            sessionRef.current = new PostureSession({
                rules: sessionRules,
                repConfig: getRepConfig(incomingName),
                aspect: 1,
                minVisibility: 0.6
            });

            fittyVoice.speak(`Ready for ${incomingName}. Position yourself in view.`);
        }
    }, [location]);

    // TTS Voice Assistant throttled to max 1 phrase per 2.5s
    const speakThrottled = useCallback((text) => {
        const now = performance.now();
        if (now - lastVoiceTime.current > 2500 && text) {
            lastVoiceTime.current = now;
            fittyVoice.speak(text);
        }
    }, []);

    // Frame evaluation callback
    const handleDetection = useCallback((results) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const session = sessionRef.current;
        if (!canvas || !video || !session || safetyAlert) return;

        const ctx = canvas.getContext("2d");
        if (video.videoWidth && canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            session.setAspect(video.videoWidth / video.videoHeight);
        }

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mirror canvas if front camera
        if (facingMode === "user") {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        const landmarks = results.poseLandmarks;
        if (landmarks && landmarks.length > 0) {
            const out = session.process(landmarks);
            setRepCount(out.reps);
            setRepPhase(out.phase);
            setAllVisible(out.allVisible);

            // Determine aggregate status
            const hasBad = out.rules.some(r => r.status === 'bad');
            const status = !out.allVisible ? "waiting" : hasBad ? "unsafe" : "correct";
            setPostureStatus(status);

            // Skeleton connector color
            const skeletonColor = !out.allVisible ? "#94a3b8" : hasBad ? "#ef4444" : "#22c55e";

            drawConnectors(ctx, landmarks, POSE_CONNECTIONS, {
                color: skeletonColor,
                lineWidth: deviceType === "mobile" ? 5 : 3,
            });
            drawLandmarks(ctx, landmarks.filter(l => (l.visibility || 0) > 0.6), {
                color: "#FFFFFF",
                lineWidth: 2,
                radius: 3
            });

            // Feedback message and Voice handling
            if (!out.allVisible) {
                setFeedback("Move back so your full body is visible");
            } else if (hasBad) {
                const badRule = out.rules.find(r => r.status === 'bad');
                const issueMsg = badRule?.message || "Check your form!";
                setFeedback(issueMsg);

                // Speak when a rule transitions to bad
                if (badRule && lastRuleStatuses.current[badRule.name] !== 'bad') {
                    speakThrottled(issueMsg);
                }

                // Safety timeout alert: pause if unsafe continuously for 4s
                if (!safetyStartTime.current) safetyStartTime.current = Date.now();
                else if (Date.now() - safetyStartTime.current > 4000) {
                    setSafetyAlert(true);
                    fittyVoice.speak("Unsafe form detected. Pausing session for your safety.");
                }
            } else {
                safetyStartTime.current = 0;
                setFeedback(out.phase === 'down' ? "Holding position... press up" : "Form looks good!");
            }

            // Save last statuses for transition detection
            out.rules.forEach(r => {
                lastRuleStatuses.current[r.name] = r.status;
            });

            // Rep Events Voice Feedback
            if (out.event === 'rep') {
                if (out.formOk) {
                    speakThrottled(`Good rep! ${out.reps}`);
                } else if (out.issues.length > 0) {
                    speakThrottled(`Rep counted. Watch form on ${out.issues[0]}`);
                }
            } else if (out.event === 'partial') {
                speakThrottled("Go lower for full range of motion");
            }

        } else {
            setPostureStatus("waiting");
            setFeedback("Point camera at your full body...");
        }

        ctx.restore();
    }, [facingMode, deviceType, safetyAlert, speakThrottled]);

    // Camera & Detection Loop Lifecycle
    useEffect(() => {
        if (!isStarted || !workout || !exercise) return;

        let stopLoop = null;
        let isCancelled = false;

        const initCameraAndModel = async () => {
            setModelLoading(true);
            setCameraError(null);
            try {
                // 1. Acquire Camera
                const videoEl = videoRef.current;
                if (!videoEl) return;
                const stream = await openCamera(videoEl, facingMode);
                streamRef.current = stream;

                // 2. Request Wake Lock to keep screen awake during workout
                const lock = await requestWakeLock();
                wakeLockRef.current = lock;

                // 3. Load / warm Pose model
                const pose = getCachedPose(deviceType === "mobile");
                pose.onResults(handleDetection);
                setModelLoading(false);

                // 4. Start frame loop with FPS cap and busy skipping
                stopLoop = startFrameLoop(
                    videoEl,
                    async (video) => {
                        if (isCancelled || !video) return;
                        await pose.send({ image: video });
                    },
                    { maxFps: deviceType === "mobile" ? 22 : 28 }
                );

            } catch (err) {
                console.error("Camera / Pose Init Error", err);
                setCameraError(describeCameraError(err));
                setModelLoading(false);
            }
        };

        initCameraAndModel();

        // Handle page visibility change (pause loop when tab hidden)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                if (stopLoop) stopLoop();
            } else {
                if (videoRef.current && !cameraError) {
                    const pose = getCachedPose(deviceType === "mobile");
                    stopLoop = startFrameLoop(
                        videoRef.current,
                        async (v) => { if (v) await pose.send({ image: v }); },
                        { maxFps: 22 }
                    );
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            isCancelled = true;
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (stopLoop) stopLoop();
            if (streamRef.current) stopCamera(streamRef.current);
            if (wakeLockRef.current) wakeLockRef.current.release();
        };
    }, [isStarted, workout, exercise, facingMode, deviceType, handleDetection, cameraError]);

    const workoutOptions = [
        { name: "Chest", exercises: ["Bench Press", "Push-ups", "Crossovers"] },
        { name: "Biceps", exercises: ["Bicep Curls", "Hammer Curls"] },
        { name: "Legs", exercises: ["Squats", "Lunges", "Leg Extensions"] },
        { name: "Shoulders", exercises: ["Shoulder Press", "Lateral Raises"] }
    ];

    if (!isLoggedIn) {
        return (
            <div className="posture-setup-container restricted">
                <h2>Login Required</h2>
                <p>Please log in to use the AI Posture Coach.</p>
                <button className="primary-btn mt-3" onClick={() => navigate('/login')}>Login</button>
            </div>
        );
    }

    if (safetyAlert) {
        return (
            <div className="safety-modal-container">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="safety-card">
                    <ShieldAlert size={64} color="#ef4444" />
                    <h1>Safety Alert</h1>
                    <p>Unsafe joint alignment detected repeatedly for <strong>{exercise}</strong>.</p>
                    <button className="primary-btn" onClick={() => { setSafetyAlert(false); setPostureStatus("waiting"); }}>
                        Resume Workout
                    </button>
                    <button className="secondary-btn mt-2" onClick={() => navigate('/workout')}>
                        Exit to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    if (!isStarted) {
        return (
            <div className="posture-setup-container">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="setup-card">
                    <div className="setup-header">
                        <Camera className="icon-main" />
                        <h1>Posture Analysis</h1>
                        <p className="setup-tip">Phone 2 to 3 m away, whole body in frame, good lighting.</p>
                    </div>

                    {!workout ? (
                        <div className="selection-grid">
                            <h2>Select Category</h2>
                            <div className="grid">
                                {workoutOptions.map(wo => (
                                    <button key={wo.name} onClick={() => setWorkout(wo.name)} className="wo-btn">
                                        {wo.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="selection-grid">
                            <button onClick={() => setWorkout(null)} className="back-btn">
                                <ArrowLeft size={16} /> Back
                            </button>
                            <h2>Select Exercise</h2>
                            <div className="grid">
                                {workoutOptions.find(w => w.name === workout)?.exercises.map(ex => (
                                    <button 
                                        key={ex} 
                                        onClick={() => { 
                                            setExercise(ex); 
                                            setExerciseId(normalizeExerciseId(ex));
                                            setIsStarted(true); 
                                        }} 
                                        className="ex-btn"
                                    >
                                        <Play size={16} /> {ex}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`posture-live-container ${deviceType}`}>
            {/* TOP OVERLAY */}
            <div className="header-overlay mobile-transparent">
                <div className="ex-info">
                    <button className="back-btn-mini" onClick={() => { setIsStarted(false); setExercise(null); }}>
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h3>{exercise}</h3>
                        <span className="live-badge"><Activity size={14} /> AI MONITORING</span>
                    </div>
                </div>

                <div className="header-controls">
                    {/* CAMERA SWITCH BUTTON */}
                    <button 
                        className="toggle-cam" 
                        title="Switch Camera"
                        onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* LIVE DETECTOR FRAME */}
            <div className="detector-frame">
                {modelLoading && (
                    <div className="model-loading-overlay">
                        <Loader2 className="spin" size={36} />
                        <p>Loading AI Pose Engine...</p>
                    </div>
                )}

                {cameraError ? (
                    <div className="camera-error-overlay">
                        <AlertTriangle size={48} color="#ef4444" />
                        <p>{cameraError}</p>
                        <button className="primary-btn mt-3" onClick={() => setCameraError(null)}>
                            Retry Camera
                        </button>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            playsInline
                            muted
                            autoPlay
                            className={`webcam-feed ${facingMode === 'user' ? 'mirrored' : ''}`}
                        />
                        <canvas ref={canvasRef} className="skeleton-canvas" />
                    </>
                )}

                {/* REP COUNTER BADGE */}
                <div className="rep-counter-pill">
                    <span className="rep-num">{repCount}</span>
                    <span className="rep-lbl">REPS ({repPhase.toUpperCase()})</span>
                </div>

                {/* SETUP TIP BANNER */}
                <div className="setup-tip-banner">
                    <Info size={14} />
                    <span>Phone 2 to 3 m away, whole body in frame, good light.</span>
                </div>

                {/* STATUS BAR WITH ARIA-LIVE */}
                <div className={`status-overlay ${postureStatus}`} aria-live="polite">
                    {postureStatus === "correct" && <CheckCircle2 size={24} />}
                    {postureStatus === "waiting" && <AlertTriangle size={24} />}
                    {postureStatus === "unsafe" && <XCircle size={24} />}
                    <span>{feedback}</span>
                </div>
            </div>
        </div>
    );
};

export default PostureDetector;
