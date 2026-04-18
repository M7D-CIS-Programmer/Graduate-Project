import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import EmployerHome from './pages/EmployerHome';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import JobSeekerDashboard from './pages/Dashboard/JobSeekerDashboard';
import AppliedJobs from './pages/Dashboard/AppliedJobs';
import EmployerDashboard from './pages/Dashboard/EmployerDashboard';
import Applicants from './pages/Dashboard/Applicants';
import MyJobs from './pages/Dashboard/MyJobs';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ManageUsers from './pages/Dashboard/ManageUsers';
import ManageJobs from './pages/Dashboard/ManageJobs';
import ManageCompanies from './pages/Dashboard/ManageCompanies';
import PlatformSettings from './pages/Dashboard/PlatformSettings';
import JobListings from './pages/Jobs/JobListings';
import JobDetails from './pages/Jobs/JobDetails';
import SavedJobs from './pages/SavedJobs';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import ResumeBuilder from './pages/ResumeBuilder';
import JobPost from './pages/JobPost';
import Companies from './pages/Companies/Companies';
import Candidates from './pages/Candidates';
import Settings from './pages/Settings/Settings';

const ConditionalHome = () => {
  const { user } = useAuth();

  if (user && user.role === 'Employer') {
    return <EmployerHome />;
  }

  return <Home />;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <MainLayout>
              <Routes>
                {/* Home */}
                <Route path="/" element={<ConditionalHome />} />
                <Route path="/employer-home" element={<EmployerHome />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Dashboards */}
                <Route path="/dashboard/seeker" element={<JobSeekerDashboard />} />
                <Route path="/dashboard/seeker/applications" element={<AppliedJobs />} />
                <Route path="/dashboard/employer" element={<EmployerDashboard />} />
                <Route path="/dashboard/employer/applicants" element={<Applicants />} />
                <Route path="/dashboard/employer/jobs" element={<MyJobs />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/admin/users" element={<ManageUsers />} />
                <Route path="/dashboard/admin/jobs" element={<ManageJobs />} />
                <Route path="/dashboard/admin/companies" element={<ManageCompanies />} />
                <Route path="/dashboard/admin/settings" element={<PlatformSettings />} />

                {/* Job Management */}
                <Route path="/jobs" element={<JobListings />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/jobs/post" element={<JobPost />} />
                <Route path="/saved-jobs" element={<SavedJobs />} />

                {/* User Features */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/resume-builder" element={<ResumeBuilder />} />

                {/* Other Routes */}
                <Route path="/companies" element={<Companies />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/settings" element={<Settings />} />

                {/* Fallback */}
                <Route path="*" element={
                  <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>404 - Not Found</h2>
                    <p style={{ color: 'var(--text-muted)' }}>The page you are looking for doesn't exist.</p>
                  </div>
                } />
              </Routes>
            </MainLayout>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
  );
}

export default App;
