import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);     // ✅ Loading state
  const [success, setSuccess] = useState('');        // ✅ Success message
  const [error, setError] = useState('');            // ✅ Error message

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/send-email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        setSuccess('✅ Email sent successfully!');
        setFormData({ name: '', email: '', message: '' });  // ✅ Clear form
      } else {
        const errorData = await response.json();
        setError(`❌ Failed: ${errorData.error || 'Email not sent!'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('❌ Server connection failed!');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="contact-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container py-5">
        <motion.h1
          className="text-center mb-5"
          variants={itemVariants}
        >
          Get in Touch
        </motion.h1>

        <div className="row">
          <motion.div
            className="col-md-6 mb-4"
            variants={itemVariants}
          >
            <div className="contact-info">
              <div className="info-item">
                <FontAwesomeIcon icon={faPhone} className="info-icon" />
                <div>
                  <h3>Phone</h3>
                  <p>+1 234 567 8900</p>
                </div>
              </div>
              <div className="info-item">
                <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                <div>
                  <h3>Email</h3>
                  <p>fitmitrahelps@gmail.com</p>
                </div>
              </div>
              <div className="info-item">
                <FontAwesomeIcon icon={faLocationDot} className="info-icon" />
                <div>
                  <h3>Location</h3>
                  <p>123 Fitness Street, Wellness City</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="col-md-6"
            variants={itemVariants}
          >
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </motion.button>

              {success && <p className="text-success mt-3">{success}</p>}
              {error && <p className="text-danger mt-3">{error}</p>}
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
