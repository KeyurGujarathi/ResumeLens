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
import Footer from "./components/Footer.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";

import { logActivity } from "./utils/userStorage.js";


/* ---------------------------------------------------------
   PROTECTED ROUTE
--------------------------------------------------------- */

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>

          <p className="mt-4 text-sm text-slate-500">
            Verifying your session...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}


/* ---------------------------------------------------------
   ROUTE ACTIVITY TRACKER
--------------------------------------------------------- */

function RouteActivityTracker() {
  const location = useLocation();

  const { token, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && token) {
      logActivity(
        token,
        "page_view",
        location.pathname
      );
    }
  }, [location.pathname, token, isAuthenticated]);

  return null;
}


/* ---------------------------------------------------------
   MAIN APPLICATION
--------------------------------------------------------- */

function AppRoutes() {
  return (
    <>
      <RouteActivityTracker />

      <Navbar />

      <Routes>

        {/* PUBLIC PAGES */}

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


        {/* PROTECTED PAGES */}

        <Route
  path="/dashboard"
  element={<Dashboard />}
/>

        <Route
          path="/skills"
          element={
            <ProtectedRoute>
              <Skills />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <Resume />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume-analyzer"
          element={
            <ProtectedRoute>
              <ResumeAnalyzer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/career-profile"
          element={
            <ProtectedRoute>
              <CareerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skill-gap"
          element={
            <ProtectedRoute>
              <SkillGap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company-fit"
          element={
            <ProtectedRoute>
              <CompanyFit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume-improvement"
          element={
            <ProtectedRoute>
              <ResumeImprovement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/career-roadmap"
          element={
            <ProtectedRoute>
              <CareerRoadmap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/placement-preparation"
          element={
            <ProtectedRoute>
              <PlacementPreparation />
            </ProtectedRoute>
          }
        />


        {/* ADMIN PAGE */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* UNKNOWN ROUTES */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
<Route
  path="/privacy-policy"
  element={<PrivacyPolicy />}
/>

<Route
  path="/terms-and-conditions"
  element={<TermsAndConditions />}
/>
      </Routes>
      <Footer />
    </>
  );
}


/* ---------------------------------------------------------
   ROOT APP
--------------------------------------------------------- */

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;