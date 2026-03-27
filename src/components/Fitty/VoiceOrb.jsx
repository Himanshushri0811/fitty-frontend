import React from 'react';
import './VoiceAssistant.css';

const VoiceOrb = ({ state }) => {
  return (
    <div className={`siri-orb-wrapper ${state}`}>
      <div className="siri-glow"></div>
      <div className="siri-core">
        <div className="siri-blob blob-1"></div>
        <div className="siri-blob blob-2"></div>
        <div className="siri-blob blob-3"></div>
        <div className="siri-blob blob-4"></div>
      </div>
    </div>
  );
};

export default VoiceOrb;
