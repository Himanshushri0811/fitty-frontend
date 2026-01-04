import { useEffect, useState } from "react";
import { PorcupineWorker } from "@picovoice/porcupine-web";
import fittyVoice from "../utils/fittyVoice";

const VoiceAssistant = () => {
  const [wakeWordDetected, setWakeWordDetected] = useState(false);

  useEffect(() => {
    const initWakeWord = async () => {
      try {
        console.log("🔧 Initializing wake word detection...");

        const porcupineWorker = await PorcupineWorker.create(
          [
            {
              publicPath: "/fity.ppn", // ✅ Make sure path is correct
              sensitivity: 0.7,
            },
          ],
          () => {
            console.log("🎉 Wake word 'Fity' detected!");
            setWakeWordDetected(true);
            startRecognition();
          }
        );

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("🎙️ Microphone access granted.");

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(512, 1, 1);

        processor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          porcupineWorker.postMessage({ inputFrame: inputData });
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
        console.log("✅ Audio pipeline setup complete.");
      } catch (error) {
        console.error("❌ Error initializing wake word:", error);
      }
    };

    initWakeWord();
  }, []);

  const startRecognition = () => {
    console.log("🎧 Starting voice recognition...");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("❌ SpeechRecognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🗣️ You said:", transcript);
      await handleQuery(transcript);
    };

    recognition.onerror = (event) => {
      console.error("❌ Speech recognition error:", event.error);
    };
  };

  const handleQuery = async (query) => {
    try {
      console.log("📤 Sending query to Gemini backend:", query);

      const response = await fetch("http://localhost:8000/voice_assistant/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      console.log("📥 Gemini response:", data);

      if (data.response) {
        speak(data.response); // ✅ Directly speak the Gemini response
      } else {
        speak("Sorry, I didn't understand that.");
      }
    } catch (error) {
      console.error("❌ Error while fetching Gemini response:", error);
      speak("Something went wrong. Please try again.");
    }
  };

  const speak = (text) => {
    console.log("🔊 Speaking:", text);
    fittyVoice.speak(text);
  };

  // Use a trick to make sure the browser allows speech synthesis (auto interaction)
  useEffect(() => {
    const fakeInput = document.createElement("input");
    fakeInput.style.position = "absolute";
    fakeInput.style.opacity = 0;
    document.body.appendChild(fakeInput);
    fakeInput.focus(); // triggers "user interaction"
    document.body.removeChild(fakeInput);

    fittyVoice.speak("Hi! Say Fity to start");
  }, []);

  return (
    <div className="text-white text-center mt-4">
      <h2 className="text-xl font-semibold">
        {wakeWordDetected ? "🎧 Listening for command..." : '🕵️ Say "Fity" to activate'}
      </h2>
    </div>
  );
};

export default VoiceAssistant;
