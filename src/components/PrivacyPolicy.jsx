import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-wrapper">
      <div className="privacy-card">
        <h1 className="privacy-title">Privacy Policy</h1>

        <div className="privacy-item">
          <h2>Information We Collect</h2>
          <p>We collect data you provide, including name, email, and fitness goals, to offer personalized services.</p>
        </div>

        <div className="privacy-item">
          <h2>How We Use It</h2>
          <p>Your data is used for workout tracking, goal management, and to recommend relevant fitness plans.</p>
        </div>

        <div className="privacy-item">
          <h2>Data Security</h2>
          <p>We implement strict security measures to safeguard your personal information.</p>
        </div>

        <div className="privacy-item">
          <h2>Your Rights</h2>
          <p>You can access, update, or delete your data anytime by contacting us.</p>
        </div>

        <p className="privacy-footer">© 2025 FitMitra. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
