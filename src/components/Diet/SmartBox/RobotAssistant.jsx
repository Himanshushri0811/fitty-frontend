import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';

// We need a free robot lottie. LottieFiles has many free ones.
// Using a placeholder URL for a "Bot" character.
// You can download a JSON and replace this URL with a local import if needed.
// Using local robot file from public folder
const ROBOT_ANIMATION_URL = "/Robot-assistant-Online-manager.json";

const RobotAssistant = ({ isSpeaking }) => {
    const lottieRef = useRef();

    useEffect(() => {
        if (lottieRef.current) {
            if (isSpeaking) {
                lottieRef.current.setSpeed(1.5); // Talk fast
            } else {
                lottieRef.current.setSpeed(0.5); // Idle slow
            }
        }
    }, [isSpeaking]);

    return (
        <div className="robot-wrapper">
            <Lottie
                lottieRef={lottieRef}
                path={ROBOT_ANIMATION_URL} // Loading from URL (Production ready if URL stable)
                loop={true}
                autoplay={true}
                style={{ height: '100%', width: '100%' }}
            />

            {isSpeaking && (
                <div className="voice-bubble">
                    <div className="dot-flashing"></div>
                </div>
            )}
        </div>
    );
};

export default RobotAssistant;
