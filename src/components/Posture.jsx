import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import API from "./axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Play, ArrowLeft } from "lucide-react";
import "./Posture.css";

const PostureDetector = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [workout, setWorkout] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [deviceType, setDeviceType] = useState("desktop");
  const [facingMode, setFacingMode] = useState("environment"); // "user" or "environment" (back camera)
  const [feedback, setFeedback] = useState("Align yourself in the frame...");
  const [postureStatus, setPostureStatus] = useState("waiting"); // correct, improve, unsafe
  const [aiResponse, setAiResponse] = useState("");

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const feedbackTimer = useRef(null);
  const lastApiCall = useRef(0);

  // --- Device & Auth Detection ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setDeviceType(isMobile ? "mobile" : "desktop");
    if (isMobile) {
      setFacingMode("environment"); // Default to back camera for mobile
    }
  }, []);

  // --- Angle Calculation Utility ---
  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  // --- Posture Logic ---
  const analyzePose = useCallback((results) => {
    if (!results.poseLandmarks) return;

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
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    if (exercise === "Bicep Curls") {
      const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

      // Check if elbows are moving too much away from body
      const elbowDist = Math.abs(leftElbow.x - leftShoulder.x);
      if (elbowDist > 0.15) {
        status = "improve";
        issue = "Keep elbows tucked to your side.";
      }
    } else if (exercise === "Squats") {
      const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      const hipKneeAngle = calculateAngle(leftShoulder, leftHip, leftKnee);

      if (leftKneeAngle < 70) {
        status = "unsafe";
        issue = "Going too deep! Watch your knees.";
      } else if (hipKneeAngle > 100) {
        status = "improve";
        issue = "Lean back slightly, keep your heels down.";
      } else if (leftKneeAngle < 90) {
        status = "correct";
      }
    } else if (exercise === "Push-ups") {
      const bodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
      if (bodyAngle < 160) {
        status = "improve";
        issue = "Keep your core tight! Don't drop your hips.";
      } else if (bodyAngle > 190) {
        status = "improve";
        issue = "Lower your hips to keep a flat back.";
      }
    } else if (exercise === "Hammer Curls") {
      const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const elbowDist = Math.abs(leftElbow.x - leftShoulder.x);
      if (elbowDist > 0.12) {
        status = "improve";
        issue = "Keep elbows pinned to your side.";
      }
    } else if (exercise === "Lunges") {
      const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      if (kneeAngle < 80) {
        status = "unsafe";
        issue = "Front knee going past toes! Step back further.";
      }
    } else if (exercise === "Shoulder Press") {
      const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      if (leftArmAngle < 40) {
        status = "improve";
        issue = "Don't go too low on the press.";
      }
    }

    setPostureStatus(status);
    setFeedback(issue || "Form looks good!");

    // Send to backend for AI Coach feedback (Debounced)
    const now = Date.now();
    if (status !== "correct" && now - lastApiCall.current > 5000) {
      lastApiCall.current = now;
      fetchAiFeedback(status, issue);
    }
  }, [exercise]);

  const fetchAiFeedback = async (status, issue) => {
    try {
      const res = await API.post("/api/ai/posture-analysis/", {
        workout,
        exercise,
        posture_status: status,
        issue,
        device: deviceType
      });
      setAiResponse(res.data.feedback);
      speakFeedback(res.data.feedback);
    } catch (err) {
      console.error("AI FB Error:", err);
    }
  };

  const speakFeedback = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    synth.speak(utterance);
  };

  // --- Drawing ---
  const onResults = (results) => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const canvasCtx = canvasElement.getContext("2d");

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Pass the results to analysis logic
    analyzePose(results);

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
    return (
      <div className="posture-setup-container restricted">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="setup-card restricted-card"
        >
          <div className="lock-icon-large">🔒</div>
          <h2>Unlock Posture Detection</h2>
          <p>Please login to access real-time AI posture tracking and trainer feedback.</p>
          <button className="login-btn-glass" onClick={() => navigate('/auth?tab=login')}>
            Login Now
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="posture-setup-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="setup-card"
        >
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
                  <button key={wo.name} onClick={() => setWorkout(wo.name)} className="wo-btn">
                    {wo.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="selection-grid">
              <button onClick={() => setWorkout(null)} className="back-btn"><ArrowLeft size={16} /> Change Category</button>
              <h2>Choose exercise</h2>
              <div className="grid">
                {workoutOptions.find(w => w.name === workout).exercises.map(ex => (
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
            <p>{workout}</p>
          </div>
        </div>

        {deviceType === "mobile" && (
          <button className="toggle-cam" onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}>
            <RefreshCw /> Toggle Camera
          </button>
        )}
      </div>

      <div className="detector-frame">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: facingMode,
            width: 1280,
            height: 720
          }}
          className="webcam-feed"
        />
        <canvas ref={canvasRef} className="skeleton-canvas" />

        {/* Status Indicator */}
        <div className={`status-overlay ${postureStatus}`}>
          {postureStatus === "correct" && <CheckCircle2 size={32} />}
          {postureStatus === "improve" && <AlertTriangle size={32} />}
          {postureStatus === "unsafe" && <XCircle size={32} />}
          <span>{feedback}</span>
        </div>
      </div>

      <AnimatePresence>
        {aiResponse && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fitty-feedback-toast"
          >
            <div className="avatar">🤖</div>
            <div className="text">
              <strong>Fitty AI:</strong>
              <p>{aiResponse}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostureDetector;
