import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

/* =======================
   Global Components
======================= */
import Navbar from './components/Navbar';
import Footer from './components/Footer';
// import Chatbot from './components/common/Chatbot/Chatbot';
import WaterIntake from './components/WaterIntake/WaterIntake';
import { AuthProvider } from './context/AuthContext';

import { PublicRoute, ProtectedRoute, GymOwnerRoute, AdminRoute } from './components/RouteGuards';

/* =======================
   Pages / Screens
======================= */
import Home from './components/Home';
import Contact from './components/Contact';
// import Auth from './components/Auth';
import AuthPage from './components/AuthPage/AuthPage';

import Workout from './components/Workout';
import Posture from './components/Posture';
import Motivation from './components/Motivation';
// import SuccessStories from './components/SuccessStories';
// import Nutrition from './components/Nutrition';
import Diet from './components/Diet/DietSection'; // Updated to new DietSection
// import HealthTracking from './components/HealthTracking';

import Profile from './components/Profile';
import VoiceAssistant from './components/VoiceAssistant'; // Keeping old one just in case
import FittyPage from './components/Fitty/FittyPage';

import Faq from './components/Faq';
import PrivacyPolicy from './components/PrivacyPolicy';
import Terms from './components/Terms';
import Explore from './components/Explore/Explore';
import UserProfile from './components/Social/UserProfile';
import FollowList from './components/Social/FollowList';
import Messages from './components/Social/Messages';


/* =======================
   Admin Panel
======================= */
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import GymManagement from './components/Admin/GymManagement';
import ActivityLogs from './components/Admin/ActivityLogs';

/* =======================
   Gym Owner Section
======================= */
// import GymOwnerSignup from './components/GymOwner/GymOwnerSignup';
import GymDashboard from './components/GymOwner/GymDashboard';
import GymPlans from './components/GymOwner/GymPlans';

// Import UserDashboard
import UserDashboard from './components/UserDashboard/UserDashboard';

/* =======================
   App Component
======================= */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">

          {/* ===== Global Navbar ===== */}
          <Navbar />

          {/* ===== Main Content Area ===== */}
          <div className="main-content">
            <AnimatePresence mode="wait">
              <Routes>

                {/* ---------- Public Routes (Redirect if Logged In) ---------- */}
                <Route element={<PublicRoute />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/login" element={<Navigate to="/auth?tab=login" replace />} />
                  <Route path="/signup" element={<Navigate to="/auth?tab=signup" replace />} />

                  {/* Gym Owner Signup integrated into AuthPage */}
                  <Route path="/signup/gym-owner" element={<Navigate to="/auth?tab=signup" replace />} />
                </Route>

                {/* ---------- Protected Routes ---------- */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/workout" element={<Workout />} />
                  <Route path="/posture" element={<Posture />} />
                  <Route path="/diet" element={<Diet />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:username" element={<UserProfile />} />
                  <Route path="/profile/:username/followers" element={<FollowList type="followers" />} />
                  <Route path="/profile/:username/following" element={<FollowList type="following" />} />
                  <Route path="/profile/:username/following" element={<FollowList type="following" />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/fitty" element={<FittyPage />} />
                </Route>

                {/* ---------- Gym Owner Routes ---------- */}
                <Route element={<GymOwnerRoute />}>
                  <Route path="/gym-dashboard" element={<GymDashboard />} />
                  <Route path="/gym-plans" element={<GymPlans />} />
                </Route>

                {/* ---------- Admin Panel ---------- */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route path="" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="gyms" element={<GymManagement />} />
                    <Route path="logs" element={<ActivityLogs />} />
                  </Route>
                </Route>

                {/* ---------- Publicly Accessible Pages (Always) ---------- */}
                <Route path="/contact" element={<Contact />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/motivation" element={<Motivation />} />
                {/* <Route path="/success-stories" element={<SuccessStories />} /> */}
                {/* <Route path="/nutrition" element={<Nutrition />} /> */}
                {/* <Route path="/health-tracking" element={<HealthTracking />} /> */}
                <Route path="/voice-assistant" element={<VoiceAssistant />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />


                {/* ---------- 404 Fallback ---------- */}
                <Route path="*" element={<Home />} />

              </Routes>
            </AnimatePresence>
          </div>

          {/* ===== Global Utilities ===== */}
          <WaterIntake />
          <Footer />


        </div >
      </Router >
    </AuthProvider >
  );
}

export default App;
