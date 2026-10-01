import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaLock, FaUserSecret, FaRegFileAlt } from 'react-icons/fa';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: <FaLock />,
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, update your profile, or use our fitness tracking features. This includes your name, email, height, weight, and fitness goals."
    },
    {
      icon: <FaShieldAlt />,
      title: "How We Use Your Data",
      content: "Your data is primarily used to provide personalised fitness and nutrition plans. We also use it to improve our AI models, enhance user experience, and provide support."
    },
    {
      icon: <FaUserSecret />,
      title: "Data Protection",
      content: "We implement industry-standard security measures to protect your personal information from unauthorised access, disclosure, or destruction. Your health data is encrypted and stored securely."
    },
    {
      icon: <FaRegFileAlt />,
      title: "Your Privacy Rights",
      content: "You have the right to access, update, or delete your personal information at any time through your account settings. You can also request a copy of your data."
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
            <FaShieldAlt className="main-legal-icon" />
          </div>
          <h1>Privacy <span className="accent-text">Policy</span></h1>
          <p className="last-updated">Last Updated: January 2024</p>
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
            <h3>Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please reach out to us at <a href="mailto:privacy@fitty.com">privacy@fitty.com</a></p>
            <p className="copyright">&copy; 2024 Fitty. All Rights Reserved.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
