import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMicrophone } from 'react-icons/fa';
import VoiceOrb from './VoiceOrb';
import './VoiceAssistant.css';

const VoiceOverlay = ({ 
  isOpen, 
  onClose, 
  state, 
  transcript, 
  response,
  onMicClick
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fitty-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button className="close-assist-btn" onClick={onClose} title="Close Assistant">
          <FaTimes />
        </button>

        <div className="state-text">
          {state === 'listening' ? 'Listening...' : 
           state === 'thinking' ? 'Thinking...' : 
           state === 'speaking' ? 'Speaking...' : 'Ready'}
        </div>

        <VoiceOrb state={state} />

        <div className="assistant-info">
          {/* Text areas hidden as per user request for voice-only experience */}
          {/* 
          <div className="transcript-area">
            {transcript || (state === 'listening' ? 'How can I help?' : '')}
          </div>
          */}

          {state === 'idle' && (
            <motion.button 
              className="manual-mic-btn"
              onClick={onMicClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaMicrophone />
            </motion.button>
          )}

          {/* 
          <AnimatePresence>
            {response && (
              <motion.div 
                className="response-area"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ReactMarkdown>{response}</ReactMarkdown>
              </motion.div>
            )}
          </AnimatePresence>
          */}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceOverlay;
