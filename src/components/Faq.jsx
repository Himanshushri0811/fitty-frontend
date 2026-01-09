import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';
import './faq.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is FitMitra?",
      answer: "FitMitra is your personal AI-powered fitness companion designed to help you achieve your health and wellness goals with customised workouts, diet plans, and real-time posture detection."
    },
    {
      question: "How can I track my progress?",
      answer: "You can track your progress by logging into your account and visiting the 'Dashboard' or 'Profile' sections. We provide detailed activity logs, strength metrics, and health trends."
    },
    {
      question: "Are the diet plans truly personalised?",
      answer: "Yes! Our AI adapts diet plans based on your specific goals (Fat Loss, Muscle Gain, Maintenance), dietary preferences (Veg, Non-Veg), and individual needs."
    },
    {
      question: "Is Posture Detection safe?",
      answer: "Absolutely. Our posture detector uses real-time computer vision to ensure you're performing exercises correctly, helping you avoid injuries and maximize efficiency."
    },
    {
      question: "Is FitMitra accessible on mobile?",
      answer: "Currently, FitMitra is a fully responsive web application, which means you can use it seamlessly on any smartphone or tablet browser."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-header">
        <motion.div
          className="faq-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FaQuestionCircle /> Support Center
        </motion.div>
        <motion.h1
          className="faq-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Frequently Asked <span className="accent-text">Questions</span>
        </motion.h1>
        <motion.p
          className="faq-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Everything you need to know about FitMitra. Can't find an answer?
          <a href="/contact"> Contact our support team.</a>
        </motion.p>
      </div>

      <div className="faq-container">
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span>{faq.question}</span>
                <FaChevronDown className={`faq-chevron ${openIndex === index ? 'rotate' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    className="faq-answer-wrapper"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="faq-answer">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
