export const checkVisibility = (landmarks, indices, threshold = 0.8) => {
    if (!landmarks) return false;
    for (let i of indices) {
        if (!landmarks[i] || landmarks[i].visibility < threshold) {
            return false;
        }
    }
    return true;
};

// Temporal Smoother and Phase Tracker
const stateTracker = {
    history: {},
    phase: {}, // "up", "down", "hold"

    // Add raw angle to history and return smoothed average of last 10 frames
    getSmoothedAngle: (exerciseId, angleName, currentAngle) => {
        const key = `${exerciseId}_${angleName}`;
        if (!stateTracker.history[key]) stateTracker.history[key] = [];

        stateTracker.history[key].push(currentAngle);
        if (stateTracker.history[key].length > 10) {
            stateTracker.history[key].shift();
        }

        const sum = stateTracker.history[key].reduce((a, b) => a + b, 0);
        return sum / stateTracker.history[key].length;
    },

    setPhase: (exerciseId, newPhase) => {
        stateTracker.phase[exerciseId] = newPhase;
    },

    getPhase: (exerciseId) => {
        return stateTracker.phase[exerciseId] || "hold";
    }
};

const calculateCustomAngle = (a, b, c) => {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
};

export const POSTURE_RULES = {

    // --- CHEST EXERCISES ---

    dumbbell_bench_press: {
        id: 'dumbbell_bench_press',
        displayName: 'Dumbbell Bench Press',
        keypoints: [11, 13, 15], // Shoulder, Elbow, Wrist
        instructions: "Lie flat. Lower dumbbells with control.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 13, 15]) ? "correct" : "improve",
                message: { improve: "Position yourself so arms are fully visible." }
            },
            {
                name: "Elbow Angle",
                check: (angles) => {
                    const elbow = stateTracker.getSmoothedAngle('dumbbell_bench_press', 'elbow', angles.elbow);
                    if (elbow < 45) return "unsafe"; // Extreme elbow flexion, bad on joints
                    if (elbow > 175) return "improve"; // Hyperextension lockout
                    return "correct";
                },
                message: {
                    unsafe: "Don't drop elbows too deep past chest!",
                    improve: "Don't lock out elbows harshly.",
                    correct: "Good elbow control."
                }
            }
        ]
    },

    push_up: {
        id: 'push_up',
        displayName: 'Push Up',
        keypoints: [11, 23, 25, 13, 15], // Shoulder, Hip, Knee, Elbow, Wrist
        instructions: "Plank position. Keep body straight.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 23, 25]) ? "correct" : "improve",
                message: { improve: "Adjust camera to see your full back and legs." }
            },
            {
                name: "Body Sag",
                check: (angles) => {
                    const bodyAngle = stateTracker.getSmoothedAngle('push_up', 'hip_body', angles.hip_body);
                    if (bodyAngle < 155) return "improve"; // Ass too high
                    if (bodyAngle > 195) return "unsafe"; // Hips sagging, bad for lumbar
                    return "correct";
                },
                message: {
                    improve: "Lower your hips to form a straight line.",
                    unsafe: "Don't let your hips sag! Keep core tight.",
                    correct: "Perfect plank."
                }
            },
            {
                name: "Depth",
                check: (angles) => {
                    const elbow = stateTracker.getSmoothedAngle('push_up', 'elbow', angles.elbow);
                    if (elbow > 100 && elbow < 140) return "improve"; // Half reps
                    return "correct";
                },
                message: {
                    improve: "Go lower on your reps.",
                    correct: "Good depth."
                }
            }
        ]
    },

    chest_fly: {
        id: 'chest_fly',
        displayName: 'Chest Fly',
        keypoints: [11, 13, 15], // Shoulder, Elbow, Wrist
        instructions: "Slight bend in elbows. Hug a wide barrel.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 13, 15]) ? "correct" : "improve",
                message: { improve: "Keep arms in camera view." }
            },
            {
                name: "Arm Straightness",
                check: (angles) => {
                    const elbow = stateTracker.getSmoothedAngle('chest_fly', 'elbow', angles.elbow);
                    if (elbow < 110) return "improve"; // Turning into a press
                    if (elbow > 175) return "unsafe"; // Arms too straight, bicep tear risk
                    return "correct";
                },
                message: {
                    improve: "Keep elbows slightly open, don't press.",
                    unsafe: "Don't completely straighten arms!",
                    correct: "Great fly angle."
                }
            }
        ]
    },

    incline_dumbbell_bench_press: {
        id: 'incline_dumbbell_bench_press',
        displayName: 'Incline DB Bench Press',
        keypoints: [11, 13, 15, 23], // Shoulder, elbow, wrist, hip
        instructions: "Press up over your upper chest.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 13, 15]) ? "correct" : "improve",
                message: { improve: "Align camera to see chest and arms." }
            },
            {
                name: "Press Angle",
                check: (angles, landmarks) => {
                    const elbow = stateTracker.getSmoothedAngle('incline_db', 'elbow', angles.elbow);
                    if (elbow < 45) return "unsafe";
                    return "correct";
                },
                message: {
                    unsafe: "Control the stretch, don't drop too deep.",
                    correct: "Good incline motion."
                }
            }
        ]
    },

    decline_push_up: {
        id: 'decline_push_up',
        displayName: 'Decline Push Up',
        keypoints: [11, 23, 25, 13],
        instructions: "Feet elevated, keep core tight.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 23, 25]) ? "correct" : "improve",
                message: { improve: "Camera must capture full body line." }
            },
            {
                name: "Spine Alignment",
                check: (angles) => {
                    const bodyAngle = stateTracker.getSmoothedAngle('decline_push_up', 'hip_body', angles.hip_body);
                    if (bodyAngle > 200) return "unsafe"; // High pressure on lumbar from decline
                    if (bodyAngle < 150) return "improve"; // Hips piked
                    return "correct";
                },
                message: {
                    unsafe: "Hips sagging! Dangerous for lower back.",
                    improve: "Lower hips slightly.",
                    correct: "Good flat spine."
                }
            }
        ]
    },

    shoulder_taps: {
        id: 'shoulder_taps',
        displayName: 'Shoulder Taps',
        keypoints: [11, 12, 23, 24],
        instructions: "Keep hips still while tapping opposite shoulder.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 12, 23, 24]) ? "correct" : "improve",
                message: { improve: "Ensure shoulders and hips are visible." }
            },
            {
                name: "Hip Sway",
                check: (angles, landmarks) => {
                    if (!landmarks || !landmarks[23] || !landmarks[24]) return "correct";
                    // Simplistic check for shoulder-hip shift vertically
                    const hipDiff = Math.abs(landmarks[23].y - landmarks[24].y);
                    if (hipDiff > 0.08) return "improve"; // Excessive sway
                    return "correct";
                },
                message: {
                    improve: "Keep your hips level, don't twist!",
                    correct: "Excellent core stability."
                }
            }
        ]
    },

    banded_chest_press: {
        id: 'banded_chest_press',
        displayName: 'Banded Chest Press',
        keypoints: [11, 13, 15],
        instructions: "Press bands forward symmetrically.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 13, 15]) ? "correct" : "improve",
                message: { improve: "Need to see both arms clearly." }
            },
            {
                name: "Lockout",
                check: (angles) => {
                    const elbow = stateTracker.getSmoothedAngle('banded_chest_press', 'elbow', angles.elbow);
                    if (elbow > 170) return "improve"; // Band tension drops if locked aggressively
                    return "correct";
                },
                message: {
                    improve: "Keep slight tension, avoid harsh lockout.",
                    correct: "Good tension control."
                }
            }
        ]
    },

    isometric_wall_press: {
        id: 'isometric_wall_press',
        displayName: 'Isometric Wall Press',
        keypoints: [11, 13, 15, 23, 25],
        instructions: "Hold strong against the wall.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [13, 15, 25]) ? "correct" : "improve",
                message: { improve: "Camera should capture legs and arms." }
            },
            {
                name: "Hold Stability",
                check: (angles) => {
                    // Check if elbow stays static indicating a hold
                    const elbowHist = stateTracker.history['isometric_wall_press_elbow'];
                    if (elbowHist && elbowHist.length === 10) {
                        const variance = Math.max(...elbowHist) - Math.min(...elbowHist);
                        if (variance > 10) return "improve";
                    }
                    return "correct";
                },
                message: {
                    improve: "Hold still! Don't bounce.",
                    correct: "Solid isometric hold."
                }
            }
        ]
    },

    // --- TRICEPS EXERCISES ---

    bench_dips: {
        id: 'bench_dips',
        displayName: 'Bench Dips',
        keypoints: [11, 13, 15, 23], // Shoulder, elbow, wrist, hip
        instructions: "Keep back close to bench. Dip until 90 degrees.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 13, 15, 23]) ? "correct" : "improve",
                message: { improve: "Ensure arms and hips are in view." }
            },
            {
                name: "Shoulder Strain",
                check: (angles) => {
                    const elbow = stateTracker.getSmoothedAngle('bench_dips', 'elbow', angles.elbow);
                    if (elbow < 75) return "unsafe"; // Dipping too low, extreme front delt strain
                    return "correct";
                },
                message: {
                    unsafe: "Stop! You are dipping too low, risking shoulder injury.",
                    correct: "Safe depth."
                }
            }
        ]
    },

    dumbbell_triceps_extension: {
        id: 'dumbbell_triceps_extension',
        displayName: 'Dumbbell Triceps Ext.',
        keypoints: [11, 13, 15],
        instructions: "Keep elbows pointed up and stationary.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 13, 15]) ? "correct" : "improve",
                message: { improve: "We need full view of your arms above head." }
            },
            {
                name: "Elbow Movement",
                check: (angles, landmarks) => {
                    // Tricep extension: shoulder angle (arm to torso) should stay relatively static near 180 degrees
                    const shoulder = stateTracker.getSmoothedAngle('db_triceps', 'shoulder', angles.shoulder);
                    if (shoulder < 130) return "improve"; // Elbows drifting forward heavily
                    return "correct";
                },
                message: {
                    improve: "Keep elbows pointed up, don't drop them forward.",
                    correct: "Elbows are stable."
                }
            }
        ]
    },

    reverse_grip_bench_press: {
        id: 'reverse_grip_bench_press',
        displayName: 'Reverse Grip Bench',
        keypoints: [11, 13, 15],
        instructions: "Supinated grip. Keep elbows tucked.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 13, 15]) ? "correct" : "improve",
                message: { improve: "Needs side view of arms." }
            },
            {
                name: "Elbow Angle",
                check: (angles) => {
                    const elbow = stateTracker.getSmoothedAngle('reverse_grip_bench', 'elbow', angles.elbow);
                    if (elbow < 50) return "unsafe"; // Dropping bar too low with reverse grip
                    return "correct";
                },
                message: {
                    unsafe: "Control the bar path on the way down.",
                    correct: "Good control."
                }
            }
        ]
    },

    reverse_grip_triceps_pushdown: {
        id: 'reverse_grip_triceps_pushdown',
        displayName: 'Reverse Tricep Pushdown',
        keypoints: [11, 13, 15, 23],
        instructions: "Underhand grip. Pin elbows to sides.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 13, 15]) ? "correct" : "improve",
                message: { improve: "Ensure we can see your arm extensions." }
            },
            {
                name: "Elbow Pin",
                check: (angles) => {
                    const shoulder = stateTracker.getSmoothedAngle('rev_pushdown_sh', 'shoulder', angles.shoulder);
                    if (shoulder > 40) return "improve"; // Elbow drifting forward
                    return "correct";
                },
                message: {
                    improve: "Keep elbows pinned to your ribs.",
                    correct: "Good elbow lock."
                }
            }
        ]
    },

    skull_crushers: {
        id: 'skull_crushers',
        displayName: 'Skull Crushers',
        keypoints: [11, 13, 15],
        instructions: "Lower bar to forehead. Elbows point to ceiling.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 13, 15]) ? "correct" : "improve",
                message: { improve: "Ensure arms are fully visible." }
            },
            {
                name: "Elbow Drift",
                check: (angles) => {
                    // Arm should be ~90 degrees to torso (shoulder angle ~90)
                    const shoulder = stateTracker.getSmoothedAngle('skull_crushers', 'shoulder', angles.shoulder);
                    if (shoulder < 70) return "improve"; // Drifting toward chest
                    if (shoulder > 130) return "unsafe"; // Shoulders over-rotated backwards 
                    return "correct";
                },
                message: {
                    improve: "Don't bring elbows forward to chest.",
                    unsafe: "Arms drifting too far back! Protect shoulders.",
                    correct: "Excellent stabilization."
                }
            }
        ]
    },

    tricep_rope_pushdown: {
        id: 'tricep_rope_pushdown',
        displayName: 'Rope Pushdown',
        keypoints: [11, 13, 15],
        instructions: "Spread rope at the bottom. Pin elbows.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 13, 15]) ? "correct" : "improve",
                message: { improve: "Stand where arms are visible." }
            },
            {
                name: "Elbow Travel",
                check: (angles) => {
                    const shoulder = stateTracker.getSmoothedAngle('rope_pushdown', 'shoulder', angles.shoulder);
                    if (shoulder > 35) return "improve"; // Momentum usage
                    return "correct";
                },
                message: {
                    improve: "No momentum! Pin elbows and use pure triceps.",
                    correct: "Good strict form."
                }
            }
        ]
    },

    tricep_press_machine: {
        id: 'tricep_press_machine',
        displayName: 'Tricep Press Machine',
        keypoints: [11, 13, 15],
        instructions: "Sit upright. Press handles down fully.",
        rules: [
            {
                name: "Visibility",
                check: (angles, landmarks) => checkVisibility(landmarks, [11, 13, 15]) ? "correct" : "improve",
                message: { improve: "Side view required for machine press." }
            },
            {
                name: "Full Extension",
                check: (angles) => {
                    const elbow = stateTracker.getSmoothedAngle('machine_press', 'elbow', angles.elbow);
                    // Phase check logic (only flag if they never hit full extension)
                    // We can just flag if they reverse direction before hitting 160
                    if (elbow < 140 && angles.elbow < stateTracker.history['machine_press_elbow']?.[0] - 2) {
                        return "improve";
                    }
                    return "correct";
                },
                message: {
                    improve: "Get a full extension at the bottom.",
                    correct: "Solid reps."
                }
            }
        ]
    },

    // --- GENERIC ---
    default: {
        id: 'default',
        displayName: 'General Exercise',
        keypoints: [],
        instructions: "Maintain good form.",
        rules: []
    }
};

export const normalizeExerciseId = (name) => {
    if (!name) return 'default';
    const lower = name.toLowerCase();

    // Chest Mapping
    if (lower.includes('dumbbell bench press') || lower.includes('db bench')) return 'dumbbell_bench_press';
    if (lower.includes('incline dumbbell')) return 'incline_dumbbell_bench_press';
    if (lower.includes('decline push')) return 'decline_push_up';
    if (lower.includes('push') && lower.includes('up')) return 'push_up';
    if (lower.includes('chest fly')) return 'chest_fly';
    if (lower.includes('shoulder tap')) return 'shoulder_taps';
    if (lower.includes('banded chest')) return 'banded_chest_press';
    if (lower.includes('isometric wall')) return 'isometric_wall_press';

    // Triceps Mapping
    if (lower.includes('bench dip')) return 'bench_dips';
    if (lower.includes('triceps extension') || lower.includes('tricep extension')) return 'dumbbell_triceps_extension';
    if (lower.includes('reverse grip bench')) return 'reverse_grip_bench_press';
    if (lower.includes('reverse') && lower.includes('pushdown')) return 'reverse_grip_triceps_pushdown';
    if (lower.includes('skull crusher')) return 'skull_crushers';
    if (lower.includes('rope pushdown')) return 'tricep_rope_pushdown';
    if (lower.includes('tricep press')) return 'tricep_press_machine';

    // Legacy mapping support
    if (lower.includes('bench') || lower.includes('chest press')) return 'dumbbell_bench_press';
    if (lower.includes('squat')) return 'default';
    if (lower.includes('deadlift')) return 'default';
    if (lower.includes('lunge')) return 'default';
    if (lower.includes('overhead') || lower.includes('shoulder')) return 'default';
    if (lower.includes('curl')) return 'default';
    return 'default';
};

export const parseBackendConfig = (config) => {
    if (!config) return null;

    try {
        if (Array.isArray(config)) {
            if (config.length === 0) return null;

            const rules = config.map(r => ({
                name: r.name,
                check: (angles, landmarks) => {
                    let val = 0;
                    const n = r.name.toLowerCase();

                    if (n.includes('knee')) val = angles.knee;
                    else if (n.includes('hip')) val = angles.hip;
                    else if (n.includes('elbow')) val = angles.elbow;
                    else if (n.includes('shoulder')) val = angles.shoulder;
                    else if (n.includes('body') || n.includes('plank')) val = angles.hip_body;
                    else val = angles.elbow;

                    if (!val) return "correct";

                    if (val < r.min) return "unsafe";
                    if (val > r.max) return "improve";
                    return "correct";
                },
                message: r.message || {
                    correct: "Good form",
                    unsafe: `Watch your ${r.name}`,
                    improve: `Adjust range (${r.name})`
                }
            }));

            return {
                id: 'custom_ai',
                displayName: 'AI Coach',
                keypoints: config[0].keypoints || [],
                instructions: "Follow AI guidance.",
                rules: rules
            };
        }
        return null;
    } catch (e) {
        console.error("Failed to parse backend pose config", e);
        return null;
    }
};
