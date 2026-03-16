import React from 'react';
import './VoiceAssistant.css';

const VoiceOrb = ({ state }) => {
  return (
    <div className="voice-orb-container">
      {state === 'listening' && (
        <div className="voice-waves">
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
      )}
      <div className={`voice-orb ${state}`}></div>
    </div>
  );
};

export default VoiceOrb;
