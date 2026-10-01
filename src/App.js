import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, LayoutGroup } from 'framer-motion';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

/* =======================
   Global Components
======================= */
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
// import Chatbot from './components/common/Chatbot/Chatbot';
import WaterIntake from './components/WaterIntake/WaterIntake';
import { AuthProvider } from './context/AuthContext';

import { PublicRoute, ProtectedRoute, GymOwnerRoute, AdminRoute } from './components/RouteGuards';

/* =======================
   Pages / Screens
======================= */
import Home from './components/Home';
import Contact from './components/Contact';
import Auth from './components/AuthPage/Auth';
import ResetPassword from './components/AuthPage/ResetPassword';

// Updated Workout Components
import WorkoutDashboard from './components/SmartWorkout/WorkoutDashboard';
import WorkoutWizard from './components/SmartWorkout/WorkoutWizard';

import Posture from './components/Posture';
import Motivation from './components/Motivation';
// import SuccessStories from './components/SuccessStories';
// import Nutrition from './components/Nutrition';
import Diet from './components/Diet/DietSection'; // Updated to new DietSection
import FoodDetail from './components/Diet/FoodDetail';
// import HealthTracking from './components/HealthTracking';

import Profile from './components/Profile';
import VoiceAssistant from './components/VoiceAssistant'; // Keeping old one just in case
import FittyPage from './components/Fitty/FittyPage';

import Faq from './components/Faq';
import PrivacyPolicy from './components/PrivacyPolicy';
import Terms from './components/Terms';
import MissionControl from './components/MissionControl/MissionControl';
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
import ExerciseManagement from './components/Admin/ExerciseManagement';

/* =======================
   Gym Owner Section
======================= */
// import GymOwnerSignup from './components/GymOwner/GymOwnerSignup';
import GymDashboard from './components/GymOwner/GymDashboard';
import GymPlans from './components/GymOwner/GymPlans';
import GymSettings from './components/GymOwner/GymSettings';

// Import UserDashboard
import UserDashboard from './components/UserDashboard/UserDashboard';

import CallFab from "./components/CallFab";

/* =======================
   App Component
======================= */
/* =======================
   App Layout
======================= */
function AppLayout() {
  const location = useLocation(); // Hook usage requires being inside Router
  const hideFooter = location.pathname === '/fitty';

  const [showSplash, setShowSplash] = React.useState(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      sessionStorage.setItem('fittySplashIsPlaying', 'true');
      return true;
    }
    return false;
  });

  React.useEffect(() => {
    if (showSplash) {
      const t = setTimeout(() => {
        sessionStorage.removeItem('fittySplashIsPlaying');
        setShowSplash(false);
        window.dispatchEvent(new Event('splashFinished'));
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [showSplash]);

  // Wake up Render Free Tier Backend
  React.useEffect(() => {
    fetch('https://fitmitra-backend.onrender.com/api/health/')
      .then(() => console.log('Backend warmup initiated (Render Cold Start mitigated)'))
      .catch(() => console.log('Backend warmup log ignored'));
  }, []);

  return (
    <LayoutGroup>
      <div className="app">
        <AnimatePresence>
          {showSplash && <SplashScreen />}
        </AnimatePresence>

        {/* ===== Global Navbar ===== */}
        <Navbar showSplash={showSplash} />

      {/* ===== Main Content Area ===== */}
      <div className="main-content">
        <AnimatePresence mode="wait">
          <Routes>
            {/* ---------- Public Routes (Redirect if Logged In) ---------- */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
              <Route path="/login" element={<Navigate to="/auth?tab=login" replace />} />
              <Route path="/signup" element={<Navigate to="/auth?tab=signup" replace />} />

              {/* Gym Owner Signup integrated into AuthPage */}
              <Route path="/signup/gym-owner" element={<Navigate to="/auth?tab=signup" replace />} />
            </Route>

            {/* ---------- Protected Routes ---------- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<UserDashboard />} />

              {/* Updated Workout Routes */}
              <Route path="/workout" element={<WorkoutDashboard />} />
              <Route path="/workout/generate" element={<WorkoutWizard />} />

              <Route path="/posture" element={<Posture />} />
              <Route path="/diet" element={<Diet />} />
              <Route path="/diet/food/:id" element={<FoodDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:username/followers" element={<FollowList type="followers" />} />
              <Route path="/profile/:username/following" element={<FollowList type="following" />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/fitty" element={<FittyPage />} />
            </Route>

            {/* ---------- Gym Owner Routes ---------- */}
            <Route element={<GymOwnerRoute />}>
              <Route path="/gym-dashboard" element={<GymDashboard />} />
              <Route path="/gym-plans" element={<GymPlans />} />
              <Route path="/gym-settings" element={<GymSettings />} />
            </Route>

            {/* ---------- Admin Panel ---------- */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="" element={<AdminDashboard />} />
            </Route>

            {/* ---------- Publicly Accessible Pages (Always) ---------- */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/mission-control" element={<MissionControl />} />
            {/* <Route path="/profile/:username" element={<UserProfile />} /> */}
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
      {!hideFooter && <WaterIntake />}

      {/* Conditionally Render Footer */}
      {!hideFooter && <Footer />}
      {!hideFooter && <BottomNav />}

      {/* Floating call button: posture aur fitty page par mic/camera conflict se bachne ke liye hide */}
      {location.pathname !== '/fitty' &&
       location.pathname !== '/posture' &&
       location.pathname !== '/voice-assistant' && <CallFab />}

      {/* Hide Zoho on Fitty Page (Smart Toggle) */}
      {React.useEffect(() => {
        const updateZoho = (action) => {
          // 1. API Method
          if (window.$zoho?.salesiq?.floatwindow) {
            window.$zoho.salesiq.floatwindow.visible(action);
          }
          // 2. DOM Method
          const ids = ['zsiq_float', 'zsiq_widget', 'zsiq_mfloat'];
          ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
              el.style.display = action === 'hide' ? 'none' : 'block';
            }
          });
        };

        if (location.pathname === '/fitty') {
          // Fitty Page: Hide aggressively
          updateZoho('hide');
          const interval = setInterval(() => updateZoho('hide'), 1000);

          // Only restore when LEAVING Fitty page
          return () => {
            clearInterval(interval);
            updateZoho('show');
          };
        }
        // No else block needed - let Zoho maintain its state on other pages
      }, [location.pathname])}
      </div>
    </LayoutGroup>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
