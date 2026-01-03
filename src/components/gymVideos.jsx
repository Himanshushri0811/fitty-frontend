import React, { useState, useEffect } from "react";
import "./WorkoutSection.css";

const allVideos = [
  { url: "https://www.youtube.com/embed/1KmXZX5utnQ", title: "Chest Workout", category: "chest" },
  { url: "https://www.youtube.com/embed/1Q7aH8GkBGE", title: "Biceps Workout", category: "arms" },
  { url: "https://www.youtube.com/embed/dZ3t4UQtduA", title: "Leg Workout", category: "legs" },
  { url: "https://www.youtube.com/embed/PlXz7D7d3C0", title: "Shoulder Workout", category: "shoulders" },
  { url: "https://www.youtube.com/embed/Ij4v_hy2Ypg", title: "Back Workout", category: "back" },
  { url: "https://www.youtube.com/embed/8QlKFYmHdmg", title: "Abs Workout", category: "abs" }
];

const GymVideos = () => {
  const [selectedPart, setSelectedPart] = useState("mix");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "hi-IN";

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Heard:", transcript);

      if (transcript.includes("chest")) setSelectedPart("chest");
      else if (transcript.includes("arms") || transcript.includes("biceps")) setSelectedPart("arms");
      else if (transcript.includes("legs")) setSelectedPart("legs");
      else if (transcript.includes("back")) setSelectedPart("back");
      else if (transcript.includes("shoulder")) setSelectedPart("shoulders");
      else if (transcript.includes("abs")) setSelectedPart("abs");
      else if (transcript.includes("mix")) setSelectedPart("mix");
    };

    recognition.onerror = (err) => console.error("Recognition error:", err);

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, []);

  const handleSelection = (e) => {
    setSelectedPart(e.target.value);
  };

  const filteredVideos =
    selectedPart === "mix"
      ? allVideos
      : allVideos.filter((video) => video.category === selectedPart);

  return (
    <section>
      <h2 className="section-title">🎧 बोलो: “Fity, मुझे chest workout दिखाओ”</h2>

      <div className="selector">
        <label>Select Body Part:</label>
        <select onChange={handleSelection} value={selectedPart}>
          <option value="mix">Mix (All Body Parts)</option>
          <option value="chest">Chest</option>
          <option value="arms">Arms</option>
          <option value="legs">Legs</option>
          <option value="back">Back</option>
          <option value="shoulders">Shoulders</option>
          <option value="abs">Abs</option>
        </select>
      </div>

      <div className="horizontal-videos">
        {filteredVideos.map((video, index) => (
          <div key={index} className="video-card">
            <iframe
              src={video.url}
              title={video.title}
              allowFullScreen
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default GymVideos;
