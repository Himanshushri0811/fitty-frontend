import React, { useState } from 'react';
import './faq.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is FitMitra?",
      answer: "FitMitra is your personal fitness companion designed to help you achieve your health and wellness goals with customized workouts, diet plans, and motivation."
    },
    {
      question: "How can I track my progress?",
      answer: "You can track your progress by logging into your account and visiting the 'Workout' section where you can see your activity history and progress metrics."
    },
    {
      question: "Are the diet plans customizable?",
      answer: "Yes! You can customize your diet plans based on your fitness goals like gaining, losing, or maintaining weight."
    },
    {
      question: "Can I share my progress with friends?",
      answer: "Yes, you can share your fitness progress and achievements through social media directly from the platform."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Currently, FitMitra is a web platform, but we are planning to launch a mobile app soon!"
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">
              {faq.question}
              <span className="faq-icon">{openIndex === index ? '-' : '+'}</span>
            </div>
            <div className={`faq-answer ${openIndex === index ? 'show' : ''}`}>
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
