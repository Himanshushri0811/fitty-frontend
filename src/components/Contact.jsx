import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import API from './axiosConfig';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.message) setStatus({ type: '', message: '' });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await API.post('/api/support/contact/', formData);
      if (response.status === 201) {
        setStatus({ type: 'success', message: response.data.success || 'Message sent successfully! We will get back to you soon.' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMsg = error.response?.data?.message || 'Failed to send message. Please try again later.';
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="contact-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="contact-header">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Get In Touch
        </motion.h1>
        <p>Have questions about plans, gyms, or AI coaching? Our team is always here to help you on your fitness journey.</p>
      </div>

      <div className="contact-wrapper">
        {/* Information Section */}
        <div className="contact-info-section">
          <motion.div
            className="info-card"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="info-icon-wrapper">
              <FaPhoneAlt />
            </div>
            <div>
              <h3>Call Us</h3>
              <p>+91 6389687238</p>
            </div>
          </motion.div>

          <motion.div
            className="info-card"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="info-icon-wrapper">
              <FaEnvelope />
            </div>
            <div>
              <h3>Email Us</h3>
              <p>fitmitra11@gmail.com</p>
            </div>
          </motion.div>

          <motion.div
            className="info-card"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="info-icon-wrapper">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h3>Visit Us</h3>
              <p>Noida, Uttar Pradesh, India</p>
            </div>
          </motion.div>
        </div>

        {/* Form Section */}
        <motion.div
          className="contact-form-card"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <form onSubmit={handleSubmit}>
            <div className="contact-form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                className="input-field"
                placeholder="How can we help?"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                className="input-field"
                rows="5"
                placeholder="Type your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-send" disabled={loading}>
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <FaPaperPlane /> Send Message
                </>
              )}
            </button>

            {status.message && (
              <div className={`msg-status ${status.type === 'success' ? 'msg-success' : 'msg-error'}`}>
                {status.message}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;
