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
import { smoothLandmarks } from "../utils/smoothing";
import "./Posture.css";

import { POSTURE_RULES, normalizeExerciseId, parseBackendConfig } from "./utils/postureRules";

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
  const [feedback, setFeedback] = useState("Align yourself in the frame...");
  const [postureStatus, setPostureStatus] = useState("waiting");
  const [safetyAlert, setSafetyAlert] = useState(false);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const lastApiCall = useRef(0);
  const safetyStartTime = useRef(0);
  const smoothedLandmarks = useRef(null);

  const [activeRules, setActiveRules] = useState(null);

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

      if (location.state.poseConfig) {
        const dynamicRules = parseBackendConfig(location.state.poseConfig);
        if (dynamicRules) {
          setActiveRules(dynamicRules);
          fittyVoice.speak(`Ready for ${incomingName}. ${dynamicRules.instructions}`);
          return;
        }
      }

      const instructions = POSTURE_RULES[currentId]?.instructions || "Get ready to workout.";
      fittyVoice.speak(`Ready for ${incomingName}. ${instructions}`);
      setActiveRules(POSTURE_RULES[currentId] || POSTURE_RULES['default']);
    }
  }, [location]);

  const calculateAngle = (a, b, c) => {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  const analyzePose = useCallback((landmarks) => {
    if (!landmarks || safetyAlert) return;

    const requiredIndices = [11, 12, 13, 14, 23, 24, 25, 26];
    const lowConfidence = requiredIndices.some(i => !landmarks[i] || landmarks[i].visibility < 0.6);
    
    if (lowConfidence) {
      setFeedback("Partial visibility. Move back!");
      setPostureStatus("waiting");
      return;
    }

    let status = "correct";
    let issue = "";

    const currentRules = activeRules || POSTURE_RULES[exerciseId] || POSTURE_RULES['default'];
    
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];

    const angles = {
      knee: calculateAngle(leftHip, leftKnee, leftAnkle),
      hip: calculateAngle(leftShoulder, leftHip, leftKnee),
      elbow: calculateAngle(leftShoulder, leftElbow, leftWrist),
      shoulder: calculateAngle(leftHip, leftShoulder, leftElbow),
      hip_body: calculateAngle(leftShoulder, leftHip, leftKnee)
    };

    if (currentRules.rules) {
      for (const rule of currentRules.rules) {
        const result = rule.check(angles, landmarks);
        if (result !== "correct") {
          status = result;
          issue = rule.message[result];
          if (status === "unsafe") break;
        }
      }
    }

    setPostureStatus(status);
    setFeedback(issue || "Form looks good!");

    if (status === "unsafe") {
      if (!safetyStartTime.current) safetyStartTime.current = Date.now();
      else if (Date.now() - safetyStartTime.current > 4000) {
        setSafetyAlert(true);
        fittyVoice.speak("Unsafe form detected. Pausing session.");
      }
    } else {
      safetyStartTime.current = 0;
    }

    const now = Date.now();
    if (status !== "correct" && now - lastApiCall.current > 6000 && issue) {
      lastApiCall.current = now;
      fittyVoice.speak(issue);
    }
  }, [activeRules, exerciseId, safetyAlert]);

  const onResults = useCallback((results) => {
    const canvasElement = canvasRef.current;
    const videoElement = webcamRef.current?.video;
    if (!canvasElement || !videoElement) return;

    const canvasCtx = canvasElement.getContext("2d");

    if (videoElement.videoWidth && canvasElement.width !== videoElement.videoWidth) {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (facingMode === "user") {
      canvasCtx.translate(canvasElement.width, 0);
      canvasCtx.scale(-1, 1);
    }

    if (results.poseLandmarks) {
      smoothedLandmarks.current = smoothLandmarks(
        smoothedLandmarks.current, 
        results.poseLandmarks, 
        deviceType === "mobile" ? 0.35 : 0.6
      );

      analyzePose(smoothedLandmarks.current);

      drawConnectors(canvasCtx, smoothedLandmarks.current, POSE_CONNECTIONS, {
        color: postureStatus === "correct" ? "#00FF00" : postureStatus === "improve" ? "#FFFF00" : "#FF0000",
        lineWidth: deviceType === "mobile" ? 6 : 4,
      });
      drawLandmarks(canvasCtx, smoothedLandmarks.current.filter(l => l.visibility > 0.6), {
        color: "#FFFFFF",
        lineWidth: 2,
        radius: 3
      });
    } else {
      setPostureStatus("waiting");
      setFeedback("Point camera at full body...");
    }

    canvasCtx.restore();
  }, [analyzePose, facingMode, postureStatus, deviceType]);

  useEffect(() => {
    if (isStarted && workout && exercise) {
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: deviceType === "mobile" ? 0 : 1, 
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);

      let camera = null;
      if (webcamRef.current && webcamRef.current.video) {
        camera = new cam.Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (webcamRef.current?.video) {
              await pose.send({ image: webcamRef.current.video });
            }
          },
          width: deviceType === "mobile" ? 720 : 1280,
          height: deviceType === "mobile" ? 1280 : 720,
        });
        camera.start();
      }

      return () => {
        if (camera) camera.stop();
        if (pose) pose.close();
      };
    }
  }, [isStarted, workout, exercise, facingMode, deviceType]);

  const workoutOptions = [
    { name: "Chest", exercises: ["Bench Press", "Push-ups", "Crossovers"] },
    { name: "Biceps", exercises: ["Bicep Curls", "Hammer Curls"] },
    { name: "Legs", exercises: ["Squats", "Lunges", "Leg Extensions"] },
    { name: "Shoulders", exercises: ["Shoulder Press", "Lateral Raises"] }
  ];

  if (!isLoggedIn) {
     return <div className="posture-setup-container restricted"><h2>Login Required</h2></div>;
  }

  if (safetyAlert) {
    return (
      <div className="safety-modal-container">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="safety-card">
          <ShieldAlert size={64} color="#ef4444" />
          <h1>Safety Alert</h1>
          <p>Unsafe form detected for <strong>{exercise}</strong>.</p>
          <button onClick={() => { setSafetyAlert(false); setPostureStatus("waiting"); }}>Resume</button>
          <button className="secondary" onClick={() => navigate('/workout')}>Exit</button>
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
            {deviceType === "mobile" && <p className="mobile-tip">Keep camera at chest height</p>}
          </div>

          {!workout ? (
            <div className="selection-grid">
              <h2>Category</h2>
              <div className="grid">
                {workoutOptions.map(wo => (
                  <button key={wo.name} onClick={() => setWorkout(wo.name)} className="wo-btn">{wo.name}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="selection-grid">
              <button onClick={() => setWorkout(null)} className="back-btn"><ArrowLeft size={16} /> Back</button>
              <h2>Select Exercise</h2>
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
    <div className={`posture-live-container ${deviceType}`}>
      <div className="header-overlay mobile-transparent">
        <div className="ex-info">
          <button className="back-btn-mini" onClick={() => { setIsStarted(false); setExercise(null); }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h3>{exercise}</h3>
            <span className="live-badge"><Activity size={14} /> AI MONITORING</span>
          </div>
        </div>

        {deviceType === "mobile" && (
          <button className="toggle-cam" onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}>
            <RefreshCw size={24} />
          </button>
        )}
      </div>

      <div className="detector-frame">
        <Webcam
          audio={false}
          ref={webcamRef}
          mirrored={facingMode === "user"}
          screenshotFormat="image/jpeg"
          videoConstraints={{ 
            facingMode, 
            width: { ideal: deviceType === "mobile" ? 720 : 1280 }, 
            height: { ideal: deviceType === "mobile" ? 1280 : 720 },
            aspectRatio: deviceType === "mobile" ? 0.5625 : 1.7777
          }}
          className="webcam-feed"
        />
        <canvas ref={canvasRef} className="skeleton-canvas" />

        <div className="guide-hint">
            {feedback === "Align yourself in the frame..." ? "Stand sideways for squats" : feedback}
        </div>

        <div className={`status-overlay ${postureStatus}`}>
          {postureStatus === "correct" && <CheckCircle2 size={24} />}
          {postureStatus === "improve" && <AlertTriangle size={24} />}
          {postureStatus === "unsafe" && <XCircle size={24} />}
          <span>{feedback}</span>
        </div>
      </div>
    </div>
  );
};

export default PostureDetector;
