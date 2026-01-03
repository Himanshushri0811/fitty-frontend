import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaFire, FaTrophy, FaQuoteRight, FaRegHeart } from 'react-icons/fa';
import './Motivation.css';

const MotivationSection = () => {
  const [activeTab, setActiveTab] = useState('quotes');
  const [motivationalQuote, setMotivationalQuote] = useState('');
  
  // Motivational Data
  const gymQuotes = [
    {
      text: "जब तक आप अपनी सीमाएँ तोड़ने को तैयार नहीं होते, तब तक आपकी सीमाएँ बढ़ नहीं सकतीं!",
      author: "Arnold Schwarzenegger",
      category: "Bodybuilding"
    },
    {
      text: "दर्द अस्थायी है, गर्व स्थायी! एक बार छोड़ देने पर वह हमेशा के लिए रह जाता है",
      author: "Usain Bolt",
      category: "Athletics"
    },
    {
      text: "जीतने का राज़? हारने से कभी नहीं डरना",
      author: "Muhammad Ali",
      category: "Boxing"
    }
  ];

  const milestones = [
    { title: "पहला 5km रन", date: "15 June", completed: true },
    { title: "100kg बेंच प्रेस", date: "In Progress", completed: false },
    { title: "30 दिन लगातार जिम", date: "Next Goal", completed: false }
  ];

  // Progress Data
  const progressData = {
    strength: 75,
    endurance: 60,
    consistency: 85,
    nutrition: 45
  };

  useEffect(() => {
    // Random quote generator
    const randomQuote = gymQuotes[Math.floor(Math.random() * gymQuotes.length)];
    setMotivationalQuote(randomQuote);
  }, []);

  return (
    <div className="motivation-section">
      {/* Daily Motivation Header */}
      <div className="daily-motivation-card">
        <div className="quote-container">
          <FaQuoteRight className="quote-icon" />
          <h2>आज का मंत्र</h2>
          <p className="quote-text">"{motivationalQuote.text}"</p>
          <p className="quote-author">- {motivationalQuote.author}</p>
          <div className="quote-category">{motivationalQuote.category}</div>
        </div>
        <div className="progress-sparkline">
          <div className="sparkline-item">
            <h3>स्ट्रेंथ</h3>
            <div className="sparkline-bar">
              <div 
                className="fill" 
                style={{ width: `${progressData.strength}%` }}
              ></div>
            </div>
          </div>
          {/* Repeat for other progress items */}
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="milestone-tracker">
        <h2 className="section-title">आपकी फिटनेस यात्रा</h2>
        <div className="timeline">
          {milestones.map((milestone, index) => (
            <div key={index} className="timeline-item">
              <div className={`timeline-marker ${milestone.completed ? 'completed' : ''}`}>
                {milestone.completed ? '✓' : index+1}
              </div>
              <div className="timeline-content">
                <h3>{milestone.title}</h3>
                <p>{milestone.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="badges-section">
        <h2 className="section-title">अर्जित पदक</h2>
        <div className="badges-grid">
          <div className="badge-card gold">
            <FaTrophy className="badge-icon" />
            <h3>लौह पुरुष</h3>
            <p>1 महीने तक रोजाना जिम</p>
          </div>
          <div className="badge-card silver locked">
            <FaFire className="badge-icon" />
            <h3>कैलोरी किंग</h3>
            <p>10,000 कैलोरी बर्न करें</p>
            <div className="lock-overlay">🔒</div>
          </div>
        </div>
      </div>

      {/* Motivational Video Grid */}
      <div className="video-motivation">
        <h2 className="section-title">पल भर में प्रेरणा</h2>
        <div className="video-grid">
          <div className="video-card">
            <video autoPlay muted loop className="video-background">
              <source src="/videoplayback.mp4" type="video/mp4" />
            </video>
            <div className="video-overlay">
              <h3>"असंभव सिर्फ एक राय है"</h3>
              <button className="cta-button">
                <FaRegHeart /> प्रेरित हुए?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="progress-radar">
        <h2 className="section-title">आपकी प्रगति</h2>
        <div className="radar-chart">
          {/* Add radar chart implementation here */}
          <div className="radar-metric strength">
            <FaDumbbell /> स्ट्रेंथ
          </div>
          <div className="radar-metric endurance">
            <FaFire /> सहनशक्ति
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationSection;