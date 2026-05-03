import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
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
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Notifications from './pages/Notifications';
import ResumeBuilder from './pages/ResumeBuilder';
import JobPost from './pages/JobPost';
import Companies from './pages/Companies/Companies';
import CompanyProfileView from './pages/Companies/CompanyProfileView';
import Candidates from './pages/Candidates';
import Settings from './pages/Settings/Settings';
import ResumeView from './pages/Dashboard/ResumeView';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import CandidateProfile from './pages/CandidateProfile';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Chatbot from './pages/Chatbot';
import JobMatching from './pages/JobMatching/JobMatching';
import FraudCheck from './pages/CVAnalyzer/FraudCheck';
import HiringReport from './pages/CVAnalyzer/HiringReport';
import Departments from './pages/Dashboard/Departments';
import Interview from './pages/Interview/Interview';
import AICandidateInsights from './pages/Dashboard/AICandidateInsights';
import ContactMessages from './pages/Dashboard/ContactMessages';
import Messages from './pages/Messages/Messages';
import SuspendedPage from './pages/SuspendedPage';
import Spinner from './components/ui/Spinner';

const ConditionalHome = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  if (user && (role === 'employer' || role === 'company')) {
    return <EmployerHome />;
  }

  return <Home />;
};

const ChatRedirect = () => {
  const { applicationId } = useParams();
  return <Navigate to={`/messages?applicationId=${applicationId}`} replace />;
};

const AuthInitializer = ({ children }) => {
  const { loading, isSuspended, handleSuspension } = useAuth();
  const location = useLocation();

  // Listen for the global 'accountSuspended' event dispatched by api.js
  // whenever any request gets a 403 ACCOUNT_SUSPENDED response.
  useEffect(() => {
    window.addEventListener('accountSuspended', handleSuspension);
    return () => window.removeEventListener('accountSuspended', handleSuspension);
  }, [handleSuspension]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)'
      }}>
        <Spinner />
      </div>
    );
  }

  // Suspended users can still reach /contact so they can submit a support request.
  // Every other route shows the suspension screen.
  if (isSuspended && location.pathname !== '/contact') return <SuspendedPage />;

  return children;
};

// Restricts a route to employer / company accounts only.
// Unauthenticated users go to /login; everyone else goes to /.
const EmployerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role?.toLowerCase();
  if (role !== 'employer' && role !== 'company') return <Navigate to="/" replace />;
  return children;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              <Router>
                <AuthInitializer>
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
                  <Route path="/dashboard/employer/insights" element={<AICandidateInsights />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                  <Route path="/dashboard/admin/users" element={<ManageUsers />} />
                  <Route path="/dashboard/admin/jobs" element={<ManageJobs />} />
                  <Route path="/dashboard/admin/companies" element={<ManageCompanies />} />
                  <Route path="/dashboard/admin/settings" element={<PlatformSettings />} />
                  <Route path="/dashboard/admin/contact-messages" element={<ContactMessages />} />

                  {/* Job Management */}
                  <Route path="/jobs" element={<JobListings />} />
                  <Route path="/jobs/:id" element={<JobDetails />} />
                  <Route path="/jobs/post" element={<JobPost />} />

                  {/* User Features */}
                  <Route path="/profile/:id?" element={<Profile />} />
                  <Route path="/profile/edit" element={<EditProfile />} />
                  <Route path="/candidate/:id" element={<CandidateProfile />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/chat/:applicationId" element={<ChatRedirect />} />
                  <Route path="/resume-builder" element={<ResumeBuilder />} />
                  <Route path="/resume/:userId" element={<ResumeView />} />

                  {/* Other Routes */}
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/companies/:id" element={<CompanyProfileView />} />
                  <Route path="/candidates" element={<Candidates />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/chatbot" element={<Chatbot />} />
                  <Route path="/support" element={<Chatbot />} />
                  {/* Unified AI Job Matching — replaces cv-analyzer + cv-semantic */}
                  <Route path="/job-matching"     element={<JobMatching />} />
                  {/* Legacy redirects — keep old bookmarks working */}
                  <Route path="/cv-analyzer"      element={<Navigate to="/job-matching" replace />} />
                  <Route path="/cv-semantic"      element={<Navigate to="/job-matching" replace />} />
                  {/* Specialist tools — accessible by direct URL, not shown in sidebar */}
                  <Route path="/cv-fraud-check"   element={<EmployerRoute><FraudCheck /></EmployerRoute>} />
                  <Route path="/cv-hiring-report" element={<EmployerRoute><HiringReport /></EmployerRoute>} />
                  <Route path="/departments"      element={<EmployerRoute><Departments /></EmployerRoute>} />
                  <Route path="/interview"        element={<Interview />} />

                  {/* Fallback */}
                  <Route path="*" element={
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>404 - Not Found</h2>
                      <p style={{ color: 'var(--text-muted)' }}>The page you are looking for doesn't exist.</p>
                    </div>
                  } />
                </Routes>
              </MainLayout>
            </AuthInitializer>
            </Router>
          </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
  </QueryClientProvider>
  );
}

export default App;
