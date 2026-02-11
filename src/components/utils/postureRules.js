export const POSTURE_RULES = {
    // --- SQUATS ---
    squat: {
        id: 'squat',
        displayName: 'Squat',
        keypoints: [23, 25, 27, 11, 23], // Hip, Knee, Ankle, Shoulder, Hip
        instructions: "Stand with feet shoulder-width apart. Keep your chest up.",
        rules: [
            {
                name: "Depth Check",
                check: (angles) => {
                    // Knee Angle < 90 is usually parallel or below
                    const kneeAngle = angles.knee;
                    if (kneeAngle < 70) return "unsafe"; // Ass to grass extreme
                    if (kneeAngle > 110) return "improve"; // Too shallow
                    return "correct";
                },
                message: {
                    unsafe: "Too deep! Watch your knees.",
                    improve: "Go lower! Hit parallel.",
                    correct: "Perfect depth!"
                }
            },
            {
                name: "Back Angle",
                check: (angles) => {
                    const hipAngle = angles.hip; // Trunk forward lean
                    if (hipAngle < 60) return "unsafe"; // Folding over
                    return "correct";
                },
                message: {
                    unsafe: "Keep your chest up!",
                    correct: "Good back alignment."
                }
            }
        ]
    },

    // --- BENCH PRESS ---
    bench_press: {
        id: 'bench_press',
        displayName: 'Bench Press',
        keypoints: [11, 13, 15], // Shoulder, Elbow, Wrist
        instructions: "Lie flat on the bench. Keep wrists straight.",
        rules: [
            {
                name: "Elbow Flare",
                check: (angles) => {
                    return "correct";
                },
                message: {
                    correct: "Control the bar."
                }
            },
            {
                name: "Range of Motion",
                check: (angles) => {
                    const elbowAngle = angles.elbow;
                    if (elbowAngle < 45) return "unsafe"; // Compression
                    if (elbowAngle > 160) return "improve"; // Lockout check
                    return "correct";
                },
                message: {
                    unsafe: "Don't compress elbows.",
                    improve: "Full extension at top.",
                    correct: "Good range."
                }
            }
        ]
    },

    // --- PUSH UPS ---
    push_up: {
        id: 'push_up',
        displayName: 'Push Up',
        keypoints: [11, 23, 25], // Shoulder, Hip, Knee
        instructions: "Plank position. Straight line.",
        rules: [
            {
                name: "Body Line",
                check: (angles) => {
                    const hipAngle = angles.hip_body; // Angle at hip
                    if (hipAngle < 160) return "improve"; // Hips too high (pike)
                    if (hipAngle > 200) return "unsafe"; // Sagging hips
                    return "correct";
                },
                message: {
                    improve: "Lower your hips!",
                    unsafe: "Lift your hips!",
                    correct: "Solid plank form."
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
    if (lower.includes('squat')) return 'squat';
    if (lower.includes('bench') || lower.includes('chest press')) return 'bench_press';
    if (lower.includes('push') && lower.includes('up')) return 'push_up';
    if (lower.includes('deadlift')) return 'deadlift';
    if (lower.includes('lunge')) return 'lunge';
    if (lower.includes('overhead') || lower.includes('shoulder')) return 'shoulder_press';
    if (lower.includes('curl')) return 'bicep_curl';
    return 'default';
};

export const parseBackendConfig = (config) => {
    if (!config) return null;

    try {
        // New Array Format from Backend
        if (Array.isArray(config)) {
            // If empty array, fallback to null so it uses default/normalized ID
            if (config.length === 0) return null;

            const rules = config.map(r => ({
                name: r.name,
                check: (angles) => {
                    // Try to guess angle type from name if not explicit
                    let val = 0;
                    const n = r.name.toLowerCase();

                    if (n.includes('knee')) val = angles.knee;
                    else if (n.includes('hip')) val = angles.hip; // could be hip or hip_body? Use hip (flexion) default
                    else if (n.includes('elbow')) val = angles.elbow;
                    else if (n.includes('shoulder')) val = angles.shoulder;
                    else if (n.includes('body') || n.includes('plank')) val = angles.hip_body;
                    else val = angles.elbow; // Default fallback to arm? risky.

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

        // Legacy Object Format (if used)
        const keypoints = config.keypoints ? JSON.parse(config.keypoints) : [];
        const rawRules = config.rules ? JSON.parse(config.rules) : [];

        const rules = rawRules.map(r => ({
            name: r.name,
            check: (angles) => {
                const val = angles[r.angle_name];
                if (val === undefined) return "correct";
                if (val < r.min) return r.min_result || "unsafe";
                if (val > r.max) return r.max_result || "improve";
                return "correct";
            },
            message: r.messages || { correct: "Good form" }
        }));

        return {
            id: 'custom',
            displayName: 'Custom AI Coach',
            keypoints,
            instructions: config.instructions || "Follow the AI guidance.",
            rules
        };
    } catch (e) {
        console.error("Failed to parse backend pose config", e);
        return null;
    }
};
