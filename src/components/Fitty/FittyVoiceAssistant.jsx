import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../../services/chatbotService';
import fittyVoice from '../../utils/fittyVoice';
import VoiceOverlay from './VoiceOverlay';

/**
 * FittyVoiceAssistant - Main Controller for the modern voice experience.
 */
const FittyVoiceAssistant = ({ isOpen, onClose }) => {
  const [state, setState] = useState('idle'); // idle, listening, thinking, speaking
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  
  const recognitionRef = useRef(null);
  const stateRef = useRef('idle');
  const transcriptRef = useRef('');

  // Sync refs with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Initialize Speech Recognition ONCE
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      console.log("🎙️ Initializing Speech Recognition...");
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        console.log("🎤 Mic is Active");
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const currentText = finalTranscript || interimTranscript;
        console.log("🗣️ Transcript update:", currentText);
        setTranscript(currentText);
      };

      recognition.onend = () => {
        console.log("🛑 Recognition ended. Current State:", stateRef.current);
        if (stateRef.current === 'listening') {
          if (transcriptRef.current.trim()) {
            console.log("🚀 Processing transcript:", transcriptRef.current);
            handleAIQuery(transcriptRef.current);
          } else {
            console.warn("💨 No speech detected, returning to idle");
            setState('idle');
            // Auto-restart listening after a small delay if nothing was heard
            setTimeout(() => {
              if (stateRef.current === 'idle' && isOpen) startListening();
            }, 1500);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error("❌ Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          alert("Microphone access is blocked. Please allow it in browser settings.");
        }
        setState('idle');
      };

      recognitionRef.current = recognition;
    }
  }, [isOpen]); // Re-init on open is safer

  // Handle Open/Close
  useEffect(() => {
    if (isOpen) {
      console.log("✨ Fitty Assistant Opened");
      handleInitialGreeting();
    } else {
      console.log("👋 Fitty Assistant Closed");
      stopEverything();
    }
  }, [isOpen]);

  const handleInitialGreeting = () => {
    const greetings = [
      "Hey Champ! I'm Fitty. How can I help you today?",
      "Hello Buddy! Fitty here. What's our fitness goal today?",
      "Namaste! Fitty is ready. Kya workout plan hai aaj ka?"
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    setResponse("");
    setTranscript("");
    setState('speaking');
    
    console.log("🔊 Fitty greeting:", greeting);
    // Slight delay for visual transition
    setTimeout(() => {
      fittyVoice.speak(greeting, () => {
        console.log("✅ Greeting finished, starts listening...");
        startListening();
      });
    }, 500);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      console.log("🎧 Starting listening...");
      setTranscript("");
      setResponse("");
      setState('listening');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("⚠️ Recognition start error (might be already running):", e);
      }
    } else {
      console.error("❌ Recognition not initialized");
    }
  };

  const handleAIQuery = async (query) => {
    setState('thinking');
    console.log("🧠 Thinking... query:", query);
    try {
      const result = await chatbotService.sendAgentMessage(query);
      
      // Basic check for error field in successful response
      if (result.error && (result.error.includes("quota") || result.error.includes("429"))) {
        throw new Error("QUOTA_EXCEEDED");
      }

      const reply = result.reply || result.response || result.output || "Sorry, I couldn't understand that.";
      
      console.log("📥 AI Response received:", reply);
      setResponse(reply);
      setState('speaking');
      
      // Explicitly stop recognition before speaking to prevent feedback
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      
      fittyVoice.speak(reply, () => {
        console.log("✅ Speaking finished, returning to listening loop...");
        // Use a longer delay to ensure echo is cleared
        setTimeout(() => {
          if (stateRef.current === 'speaking' || stateRef.current === 'idle') {
            startListening();
          }
        }, 1200);
      });
    } catch (error) {
      console.error("❌ Fitty AI Error:", error);
      setState('idle');
      
      let errorMsg = "Something went wrong, Champ. Let me try that again.";
      if (error.message === "QUOTA_EXCEEDED" || (error.response && error.response.status === 429)) {
        errorMsg = "Champ, I'm a bit exhausted from all the talking! My Gemini API limit is reached. Please wait a minute or check your API key.";
      }
      
      fittyVoice.speak(errorMsg);
      setResponse(errorMsg);
      // Don't auto-restart if it's a quota error to avoid spamming
      if (error.message !== "QUOTA_EXCEEDED") {
          setTimeout(() => startListening(), 3000);
      }
    }
  };

  const stopEverything = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    fittyVoice.stop();
    setState('idle');
    setTranscript('');
    setResponse('');
  };

  return (
    <VoiceOverlay 
      isOpen={isOpen}
      onClose={onClose}
      state={state}
      transcript={transcript}
      response={response}
      onMicClick={startListening}
    />
  );
};

export default FittyVoiceAssistant;
