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
                    unsafe: "Keep your chest up! Don't fold suitable.",
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
                    // Angle between arm and body (simplified)
                    // If we had 3D, we'd check flare. Here checking extension.
                    // This is a placeholder for 2D limitations.
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
                    unsafe: "Don't compress elbows too much.",
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
        instructions: "Plank position. Straight line from head to heels.",
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
                    unsafe: "Lift your hips! Core tight.",
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
        instructions: "Maintain good form and steady tempo.",
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
        const keypoints = config.keypoints ? JSON.parse(config.keypoints) : [];
        const rawRules = config.rules ? JSON.parse(config.rules) : [];

        const rules = rawRules.map(r => ({
            name: r.name,
            check: (angles) => {
                const val = angles[r.angle_name];
                if (val === undefined) return "correct"; // safe fallback
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
