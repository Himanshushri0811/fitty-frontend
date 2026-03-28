/**
 * Exponential Moving Average (EMA) for landmark smoothing
 * @param {Array} prev - Previous smoothed landmarks 
 * @param {Array} current - Current raw landmarks from MediaPipe
 * @param {number} alpha - Smoothing factor (0 to 1). Lower = smoother but more lag.
 * @returns {Array} Smoothed landmarks
 */
export const smoothLandmarks = (prev, current, alpha = 0.4) => {
    if (!prev) return current;
    if (!current) return prev;

    return current.map((landmark, i) => {
        const p = prev[i];
        if (!p) return landmark;
        
        // Only smooth if visibility is decent, otherwise trust previous or current
        const vAlpha = landmark.visibility > 0.5 ? alpha : 0.1;

        return {
            x: p.x * (1 - vAlpha) + landmark.x * vAlpha,
            y: p.y * (1 - vAlpha) + landmark.y * vAlpha,
            z: p.z * (1 - vAlpha) + landmark.z * vAlpha,
            visibility: landmark.visibility
        };
    });
};

/**
 * Coordinate mapping to handle mirrored/flipped camera views
 */
export const mirrorMapping = (landmarks) => {
    if (!landmarks) return null;
    return landmarks.map(lm => ({
        ...lm,
        x: 1 - lm.x // Flip X coordinate
    }));
};
