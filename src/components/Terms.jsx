import React from 'react';
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-container">
      <div className="terms-card">
        <h1 className="terms-title">Terms & Conditions</h1>

        <div className="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By using FitMitra, you agree to comply with and be bound by these terms. If you disagree, please refrain from using the platform.</p>
        </div>

        <div className="terms-section">
          <h2>2. User Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account information and all activities that occur under your account.</p>
        </div>

        <div className="terms-section">
          <h2>3. Prohibited Activities</h2>
          <p>Unauthorized use, modification, or distribution of content is strictly prohibited. Any misuse may lead to termination of your account.</p>
        </div>

        <div className="terms-section">
          <h2>4. Modifications</h2>
          <p>We reserve the right to modify or update the terms at any time. Continued use of the platform constitutes your agreement to the revised terms.</p>
        </div>

        <div className="terms-footer">
          <p>© 2025 FitMitra. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
