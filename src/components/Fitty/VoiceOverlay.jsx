import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic } from 'lucide-react';
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
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <button className="close-assist-btn" onClick={onClose} title="Close Assistant">
          <X size={24} />
        </button>

        <div className="voice-visualizer-section">
            <VoiceOrb state={state} />
        </div>

        <div className="assistant-info">
          <div className="state-text">
            {state === 'listening' ? 'Listening...' : 
             state === 'thinking' ? 'Thinking...' : 
             state === 'speaking' ? 'Speaking...' : 'Ready'}
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={transcript || state}
              className="transcript-area"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {transcript || (state === 'listening' ? 'I am listening...' : 'Tap mic to start')}
            </motion.div>
          </AnimatePresence>

          {state === 'idle' && (
            <motion.button 
              className="manual-mic-btn"
              onClick={onMicClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic size={28} />
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceOverlay;
