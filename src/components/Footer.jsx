import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import "./Footer.css";

const Footer = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-about">
            <h3>FitMitra 🤖</h3>
            <p>
              Your AI-powered fitness coach guiding you towards a healthier and stronger lifestyle.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/workout">Workouts</Link></li>
              <li><Link to="/diet">Diet Plans</Link></li>
              <li><Link to="/motivation">Motivation</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Use</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="footer-social">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#"><FontAwesomeIcon icon={faFacebookF} /></a>
              <a href="#"><FontAwesomeIcon icon={faTwitter} /></a>
              <a href="https://www.instagram.com/anshufighter_/"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="https://www.youtube.com/@Tech_ke_sath"><FontAwesomeIcon icon={faYoutube} /></a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p>© 2025 FitMitra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
