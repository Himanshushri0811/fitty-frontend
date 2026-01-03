import React, { useState } from "react";
import Chatbot from "./Chatbot";
import "./ChatbotIcon.css";

const ChatbotIcon = () => {
  const [isOpen, setIsOpen] = useState(false);  // ✅ Toggle chatbot window

  const toggleChatbot = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div>
      {/* Chatbot Icon */}
      <div id="chatbot-icon" onClick={toggleChatbot}>
        <div className="face">
          <div className="eye-container">
            <div className="eye left-eye"></div>
            <div className="eye right-eye"></div>
          </div>
          <div className="mouth"></div>
        </div>
      </div>

      {/* Chatbot Window */}
      {isOpen && <Chatbot />}
    </div>
  );
};

export default ChatbotIcon;
