import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

/* =======================
   Global Components
======================= */
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

/* =======================
   Pages / Screens
======================= */
import Home from './components/Home';
import Contact from './components/Contact';
import Auth from './components/Auth';

import Workout from './components/Workout';
import Posture from './components/Posture';
import Motivation from './components/Motivation';
import SuccessStories from './components/SuccessStories';

import Nutrition from './components/Nutrition';
import Diet from './components/Diet/DietSection'; // Updated to new DietSection
import HealthTracking from './components/HealthTracking';

import Profile from './components/Profile';
import VoiceAssistant from './components/VoiceAssistant';

import Faq from './components/Faq';
import PrivacyPolicy from './components/PrivacyPolicy';
import Terms from './components/Terms';

/* =======================
   App Component
======================= */
function App() {
  return (
    <Router>
      <div className="app">

        {/* ===== Global Navbar ===== */}
        <Navbar />

        {/* ===== Main Content Area ===== */}
        <div className="main-content">
          <AnimatePresence mode="wait">
            <Routes>

              {/* ---------- Public Pages ---------- */}
              <Route path="/" element={<Home />} />
              <Route path="/contact" element={<Contact />} />

              {/* ---------- Authentication ---------- */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth initialTab="login" />} />
              <Route path="/signup" element={<Auth initialTab="signup" />} />

              {/* ---------- Fitness Core ---------- */}
              <Route path="/workout" element={<Workout />} />
              <Route path="/posture" element={<Posture />} />
              <Route path="/motivation" element={<Motivation />} />
              <Route path="/success-stories" element={<SuccessStories />} />

              {/* ---------- Health & Nutrition ---------- */}
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/diet" element={<Diet />} />
              <Route path="/health-tracking" element={<HealthTracking />} />

              {/* ---------- User ---------- */}
              <Route path="/profile" element={<Profile />} />

              {/* ---------- AI / Assistant ---------- */}
              <Route path="/voice-assistant" element={<VoiceAssistant />} />

              {/* ---------- Support ---------- */}
              <Route path="/faq" element={<Faq />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />

              {/* ---------- 404 Fallback ---------- */}
              <Route path="*" element={<Home />} />

            </Routes>
          </AnimatePresence>
        </div>

        {/* ===== Global Utilities ===== */}
        <Chatbot />
        <Footer />

      </div>
    </Router>
  );
}

export default App;
