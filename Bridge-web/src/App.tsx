import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Public
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1008075603633-eud1gr3tia94jf5uu4tbuft5rokd6j9t.apps.googleusercontent.com';

// Seeker
import SeekerQuestionnaire from './pages/seeker/SeekerQuestionnaire';
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import JobDetail from './pages/seeker/JobDetail';
import MyApplications from './pages/seeker/MyApplications';
import SeekerProfile from './pages/seeker/SeekerProfile';

// Recruiter
import RecruiterQuestionnaire from './pages/recruiter/RecruiterQuestionnaire';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJob from './pages/recruiter/PostJob';
import MyJobPosts from './pages/recruiter/MyJobPosts';
import JobApplicants from './pages/recruiter/JobApplicants';
import CVReview from './pages/recruiter/CVReview';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import PaymentValidation from './pages/admin/PaymentValidation';
import JobPostManagement from './pages/admin/JobPostManagement';
import CVAccessControl from './pages/admin/CVAccessControl';
import Reports from './pages/admin/Reports';
import SystemSettings from './pages/admin/SystemSettings';

// Public layout wrapper (Navbar + Footer)
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />

          {/* Seeker routes */}
          <Route path="/seeker/questionnaire" element={<SeekerQuestionnaire />} />
          <Route element={<DashboardLayout role="seeker" />}>
            <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
            <Route path="/seeker/jobs" element={<SeekerDashboard />} />
            <Route path="/seeker/jobs/:id" element={<JobDetail />} />
            <Route path="/seeker/applications" element={<MyApplications />} />
            <Route path="/seeker/profile" element={<SeekerProfile />} />
          </Route>

          {/* Recruiter routes */}
          <Route path="/recruiter/questionnaire" element={<RecruiterQuestionnaire />} />
          <Route element={<DashboardLayout role="recruiter" />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/post-job" element={<PostJob />} />
            <Route path="/recruiter/my-posts" element={<MyJobPosts />} />
            <Route path="/recruiter/my-posts/:id/applicants" element={<JobApplicants />} />
            <Route path="/recruiter/cv-review" element={<CVReview />} />
            <Route path="/recruiter/profile" element={<RecruiterProfile />} />
          </Route>

          {/* Admin routes */}
          <Route element={<DashboardLayout role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/payments" element={<PaymentValidation />} />
            <Route path="/admin/job-posts" element={<JobPostManagement />} />
            <Route path="/admin/cv-access" element={<CVAccessControl />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
          </Route>

          {/* Legacy / redirect */}
          <Route path="/dashboard" element={<Navigate to="/seeker/dashboard" replace />} />
          <Route path="/job/:id" element={<Navigate to="/seeker/jobs/1" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}