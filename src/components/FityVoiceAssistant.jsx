import React, { useEffect, useState } from "react";
import fittyVoice from "../utils/fittyVoice";

const FityVoiceAssistant = ({ onVoiceCommand }) => {
  const [isListening, setIsListening] = useState(false);

  const speakText = (text) => {
    fittyVoice.speak(text);
  };

  const fetchFityResponse = async (message) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/fity-response/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      console.log("📦 Fity Response:", data);

      if (data.response) {
        speakText(data.response.trim());
        if (typeof onVoiceCommand === "function") {
          onVoiceCommand(data.response.trim());
        }
      } else {
        speakText("माफ़ कीजिए, कोई जवाब नहीं मिला।");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      speakText("कुछ गलत हो गया।");
    }
  };

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("🎤 Listening...");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("🗣️ Input:", transcript);

      const keywords = ["fity", "kitty", "city", "pretty"];
      if (keywords.some((w) => transcript.includes(w))) {
        fetchFityResponse(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("⚠️ Speech Error:", event.error);
      setIsListening(false);
      setTimeout(() => recognition.start(), 1000);
    };

    recognition.onend = () => {
      console.log("🛑 Restarting recognition...");
      setIsListening(false);
      setTimeout(() => recognition.start(), 1000);
    };

    recognition.start();

    return () => {
      recognition.stop();
      console.log("🧹 Cleaned up recognition");
    };
  }, [onVoiceCommand]);

  return null;
};

export default FityVoiceAssistant;
