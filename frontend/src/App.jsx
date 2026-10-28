import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar.jsx";

import Skills from "./pages/Skills.jsx";
import Resume from "./pages/Resume.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import CareerProfile from "./pages/CareerProfile.jsx";
import SkillGap from "./pages/SkillGap.jsx";
import CompanyFit from "./pages/CompanyFit.jsx";
import CareerRoadmap from "./pages/CareerRoadmap";
import ResumeImprovement from "./pages/ResumeImprovement.jsx";
import PlacementPreparation from "./pages/PlacementPreparation.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { logActivity } from "./utils/userStorage.js";

function RouteActivityTracker() {
  const location = useLocation();
  const { token, isAuthenticated } = useAuth();
  React.useEffect(() => {
    if (isAuthenticated && token) logActivity(token, "page_view", location.pathname);
  }, [location.pathname, token, isAuthenticated]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteActivityTracker />
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={<Landing />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/skills"
            element={<Skills />}
          />

          <Route
            path="/resume"
            element={<Resume />}
          />

          <Route
            path="/resume-analyzer"
            element={<ResumeAnalyzer />}
          />

          <Route
            path="/career-profile"
            element={<CareerProfile />}
          />

          <Route
            path="/skill-gap"
            element={<SkillGap />}
          />

          <Route
            path="/company-fit"
            element={<CompanyFit />}
          />

          <Route
            path="/resume-improvement"
            element={<ResumeImprovement />}
          />

          <Route
            path="/career-roadmap"
            element={<CareerRoadmap />}
          />

          <Route
            path="/placement-preparation"
            element={
              <PlacementPreparation />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;