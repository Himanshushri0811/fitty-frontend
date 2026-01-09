import React from 'react';
import { motion } from 'framer-motion';
import { FaGavel, FaUserCheck, FaBan, FaSyncAlt } from 'react-icons/fa';
import './Terms.css';

const Terms = () => {
  const sections = [
    {
      icon: <FaUserCheck />,
      title: "1. Acceptance of Terms",
      content: "By accessing and using FitMitra, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree to these terms, please do not use our services."
    },
    {
      icon: <FaSyncAlt />,
      title: "2. User Responsibilities",
      content: "You are responsible for providing accurate information and maintaining the security of your account. You agree not to share your login credentials with third parties."
    },
    {
      icon: <FaBan />,
      title: "3. Prohibited Conduct",
      content: "Users are prohibited from using FitMitra for any illegal purposes, attempting to reverse engineer the AI models, or distributing harmful content through our social features."
    },
    {
      icon: <FaGavel />,
      title: "4. Modifications to Service",
      content: "FitMitra reserves the right to modify, suspend, or discontinue any part of the service at any time. We will notify users of significant changes to these terms via email or site announcements."
    }
  ];

  return (
    <div className="legal-page">
      <div className="legal-container">
        <motion.div
          className="legal-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="legal-icon-wrapper">
            <FaGavel className="main-legal-icon" />
          </div>
          <h1>Terms of <span className="accent-text">Service</span></h1>
          <p className="last-updated">Effective Date: January 2024</p>
        </motion.div>

        <div className="legal-content">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              className="legal-section-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="section-header">
                <span className="section-icon">{section.icon}</span>
                <h2>{section.title}</h2>
              </div>
              <p>{section.content}</p>
            </motion.div>
          ))}

          <motion.div
            className="legal-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3>Agreement</h3>
            <p>By clicking 'Accept' or continuing to use our platform, you agree to these Terms and Conditions in their entirety.</p>
            <p className="copyright">&copy; 2024 FitMitra. All Rights Reserved.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
