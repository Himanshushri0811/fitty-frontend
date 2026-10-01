import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  return (
    <motion.div
      className="splash-screen-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, backgroundColor: 'rgba(2, 6, 23, 0)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#020617', // Match dark navy theme
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}
    >
      <motion.img 
        layoutId="fitty-brand-icon"
        src="/fitty-icon.svg" 
        alt="Fitty Logo"
        initial={{ scale: 0.8, opacity: 0, filter: 'brightness(1)' }}
        animate={{ scale: 1, opacity: 1, filter: 'brightness(1.1) drop-shadow(0px 0px 20px rgba(168, 85, 247, 0.4))' }}
        transition={{ 
          duration: 0.6, 
          ease: [0.22, 1, 0.36, 1] 
        }}
        style={{ width: '100px', height: '100px' }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginTop: '24px' }}
      >
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '2.5rem',
          fontWeight: 800,
          fontStyle: 'italic',
          color: '#ffffff',
          letterSpacing: '-0.04em'
        }}>
          Fitty
        </span>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
