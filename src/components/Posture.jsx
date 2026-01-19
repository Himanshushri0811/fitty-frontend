import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import API from "./axiosConfig";
import fittyVoice from "../utils/fittyVoice";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Play, ArrowLeft, ShieldAlert, Activity } from "lucide-react";
import "./Posture.css";

import { POSTURE_RULES, normalizeExerciseId } from "./utils/postureRules";

const PostureDetector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [workout, setWorkout] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [exerciseId, setExerciseId] = useState('default');
  const [isStarted, setIsStarted] = useState(false);
  const [deviceType, setDeviceType] = useState("desktop");
  const [facingMode, setFacingMode] = useState("environment");
  const [feedback, setFeedback] = useState("Align yourself in the frame...");
  const [postureStatus, setPostureStatus] = useState("waiting"); // correct, improve, unsafe
  const [aiResponse, setAiResponse] = useState("");
  const [safetyAlert, setSafetyAlert] = useState(false);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const lastApiCall = useRef(0);
  const unsafeTimer = useRef(null);
  const safetyStartTime = useRef(0);

  // --- Device & Auth Detection ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setDeviceType(isMobile ? "mobile" : "desktop");
    if (isMobile) {
      setFacingMode("environment");
    }

    // Auto-Select from Navigation
    if (location.state?.exercises && location.state?.exercises.length > 0) {
      const incomingName = location.state.exercises[0];
      // Use passed ID or fallback to normalization
      const currentId = location.state.exerciseId || normalizeExerciseId(incomingName);

      setWorkout("Auto-Selected");
      setExercise(incomingName);
      setExerciseId(currentId);
      setIsStarted(true);

      const instructions = POSTURE_RULES[currentId]?.instructions || "Get ready to workout.";
      fittyVoice.speak(`Ready for ${incomingName}. ${instructions}`);
    }
  }, [location]);

  // --- Angle Calculation Utility ---
  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  // --- Posture Logic ---
  const analyzePose = useCallback((results) => {
    if (!results.poseLandmarks || safetyAlert) return;

    const landmarks = results.poseLandmarks;
    let status = "correct";
    let issue = "";

    // Common joints
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];

    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    // --- LOGIC PER EXERCISE ---
    // --- LOGIC PER EXERCISE ---
    // Get rules for current exercise or default
    const currentRules = POSTURE_RULES[exerciseId] || POSTURE_RULES['default'];

    // Calculate required angles first (optimization: can be done on demand inside rule but this is cleaner)
    const angles = {
      knee: calculateAngle(leftHip, leftKnee, leftAnkle),
      hip: calculateAngle(leftShoulder, leftHip, leftKnee),
      elbow: calculateAngle(leftShoulder, leftElbow, leftWrist),
      shoulder: calculateAngle(leftHip, leftShoulder, leftElbow),
      hip_body: calculateAngle(leftShoulder, leftHip, leftKnee)
    };

    // Run all rules
    if (currentRules.rules) {
      for (const rule of currentRules.rules) {
        const result = rule.check(angles);
        if (result !== "correct") {
          status = result; // 'unsafe' overrides 'improve' usually, but simple overwrite here
          issue = rule.message[result];
          if (status === "unsafe") break; // Stop on first unsafe
        }
      }
    }

    setPostureStatus(status);
    setFeedback(issue || "Form looks good!");

    // --- SAFETY LOGIC ---
    if (status === "unsafe") {
      if (!safetyStartTime.current) safetyStartTime.current = Date.now();
      else if (Date.now() - safetyStartTime.current > 4000) { // 4 seconds of unsafe
        setSafetyAlert(true);
        fittyVoice.speak("Stopping session. Unsafe form detected repeatedly. Please reset.");
      }
    } else {
      safetyStartTime.current = 0;
    }

    // --- AI COACH FEEDBACK ---
    // Debounce: Only send if bad status persists or changes, not every frame
    const now = Date.now();
    if (status !== "correct" && now - lastApiCall.current > 6000 && !safetyAlert) {
      lastApiCall.current = now;
      // Mocking fetch locally to save latency or calling actual API
      // fetchAiFeedback(status, issue);
      if (issue) fittyVoice.speak(issue); // Immediate local feedback
    }
  }, [exercise, exerciseId, safetyAlert]);


  // --- Drawing ---
  const onResults = (results) => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const canvasCtx = canvasElement.getContext("2d");

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (!safetyAlert) {
      analyzePose(results);
    }

    // Draw skeleton
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: postureStatus === "correct" ? "#00FF00" : postureStatus === "improve" ? "#FFFF00" : "#FF0000",
      lineWidth: 4,
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#FFFFFF",
      lineWidth: 2,
    });
    canvasCtx.restore();
  };

  useEffect(() => {
    if (isStarted && workout && exercise) {
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);

      if (webcamRef.current && webcamRef.current.video) {
        const camera = new cam.Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (webcamRef.current && webcamRef.current.video) {
              await pose.send({ image: webcamRef.current.video });
            }
          },
          width: 1280,
          height: 720,
        });
        camera.start();
      }
    }
  }, [isStarted, workout, exercise, facingMode]);

  const workoutOptions = [
    { name: "Chest", exercises: ["Bench Press", "Push-ups", "Crossovers"] },
    { name: "Biceps", exercises: ["Bicep Curls", "Hammer Curls"] },
    { name: "Legs", exercises: ["Squats", "Lunges", "Leg Extensions"] },
    { name: "Shoulders", exercises: ["Shoulder Press", "Lateral Raises"] }
  ];

  if (!isLoggedIn) {
    return <div className="posture-setup-container restricted"><h2>Login Required</h2></div>;
  }

  // --- SAFETY ALERT MODAL ---
  if (safetyAlert) {
    return (
      <div className="safety-modal-container">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="safety-card">
          <ShieldAlert size={64} color="#ef4444" />
          <h1>Safety Alert Detected</h1>
          <p>We detected persistent unsafe form for <strong>{exercise}</strong>.</p>
          <p>To prevent injury, we have paused the session. Please review the technique guide or lower the weight.</p>
          <button onClick={() => { setSafetyAlert(false); setPostureStatus("waiting"); }}>I Understand, Resume</button>
          <button className="secondary" onClick={() => navigate('/workout')}>Return to Plan</button>
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
            <h1>Fitty Posture Detector</h1>
            <p className="device-tag">Mode: {deviceType.toUpperCase()}</p>
          </div>

          {!workout ? (
            <div className="selection-grid">
              <h2>Select your workout category</h2>
              <div className="grid">
                {workoutOptions.map(wo => (
                  <button key={wo.name} onClick={() => setWorkout(wo.name)} className="wo-btn">{wo.name}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="selection-grid">
              <button onClick={() => setWorkout(null)} className="back-btn"><ArrowLeft size={16} /> Back</button>
              <h2>Choose exercise</h2>
              <div className="grid">
                {workoutOptions.find(w => w.name === workout)?.exercises.map(ex => (
                  <button key={ex} onClick={() => { setExercise(ex); setIsStarted(true); }} className="ex-btn">
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
    <div className="posture-live-container">
      <div className="header-overlay">
        <div className="ex-info">
          <button className="back-btn-mini" onClick={() => { setIsStarted(false); setExercise(null); }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3>{exercise}</h3>
            <span className="live-badge"><Activity size={14} /> LIVE AI MONITORING</span>
          </div>
        </div>

        {deviceType === "mobile" && (
          <button className="toggle-cam" onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}>
            <RefreshCw />
          </button>
        )}
      </div>

      <div className="detector-frame">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: facingMode, width: 1280, height: 720 }}
          className="webcam-feed"
        />
        <canvas ref={canvasRef} className="skeleton-canvas" />

        <div className={`status-overlay ${postureStatus}`}>
          {postureStatus === "correct" && <CheckCircle2 size={32} />}
          {postureStatus === "improve" && <AlertTriangle size={32} />}
          {postureStatus === "unsafe" && <XCircle size={32} />}
          <span>{feedback}</span>
        </div>
      </div>
    </div>
  );
};

export default PostureDetector;
