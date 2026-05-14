import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home/Home';
import CompanyHome from './pages/Home/CompanyHome';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import JobSeekerDashboard from './pages/Dashboard/JobSeekerDashboard';
import AppliedJobs from './pages/Dashboard/Seeker/AppliedJobs';
import CompanyDashboard from './pages/Dashboard/CompanyDashboard';
import Applicants from './pages/Dashboard/Company/Applicants';
import MyJobs from './pages/Dashboard/Company/MyJobs';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ManageUsers from './pages/Dashboard/Admin/ManageUsers';
import ManageJobs from './pages/Dashboard/Admin/ManageJobs';
import ManageCompanies from './pages/Dashboard/Admin/ManageCompanies';
import PlatformSettings from './pages/Dashboard/Admin/PlatformSettings';
import JobListings from './pages/Jobs/JobListings';
import JobDetails from './pages/Jobs/JobDetails';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/Profile/EditProfile';
import Notifications from './pages/Notifications';
import ResumeBuilder from './pages/Resume/ResumeBuilder';
import JobPost from './pages/Jobs/JobPost';
import Companies from './pages/Companies/Companies';
import CompanyProfileView from './pages/Companies/CompanyProfileView';
import Candidates from './pages/Candidates';
import Settings from './pages/Settings/Settings';
import ResumeView from './pages/Resume/ResumeView';
import AboutUs from './pages/Support/AboutUs';
import ContactUs from './pages/Support/ContactUs';
import CandidateProfile from './pages/Profile/CandidateProfile';
import FAQ from './pages/Support/FAQ';
import PrivacyPolicy from './pages/Support/PrivacyPolicy';
import TermsOfService from './pages/Support/TermsOfService';
import Chatbot from './pages/Support/Chatbot';
import JobMatching from './pages/JobMatching/JobMatching';
import FraudCheck from './pages/CVAnalyzer/FraudCheck';
import HiringReport from './pages/CVAnalyzer/HiringReport';
import Departments from './pages/Dashboard/Company/Departments';
import Interview from './pages/Interview/Interview';
import AICandidateInsights from './pages/Dashboard/Company/AICandidateInsights';
import ContactMessages from './pages/Dashboard/Admin/ContactMessages';
import Messages from './pages/Messages/Messages';
import SuspendedPage from './pages/SuspendedPage';
import Spinner from './components/ui/Spinner';

const ConditionalHome = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  if (user && role === 'company') {
    return <CompanyHome />;
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
const CompanyRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role?.toLowerCase();
  if (role !== 'company') return <Navigate to="/" replace />;
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
                  <Route path="/company-home" element={<CompanyHome />} />

                  {/* Auth */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Dashboards */}
                  <Route path="/dashboard/seeker" element={<JobSeekerDashboard />} />
                  <Route path="/dashboard/seeker/applications" element={<AppliedJobs />} />
                  <Route path="/dashboard/company" element={<CompanyDashboard />} />
                  <Route path="/dashboard/company/applicants" element={<Applicants />} />
                  <Route path="/dashboard/company/jobs" element={<MyJobs />} />
                  <Route path="/dashboard/company/insights" element={<AICandidateInsights />} />
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
                  <Route path="/cv-fraud-check"   element={<CompanyRoute><FraudCheck /></CompanyRoute>} />
                  <Route path="/cv-hiring-report" element={<CompanyRoute><HiringReport /></CompanyRoute>} />
                  <Route path="/departments"      element={<CompanyRoute><Departments /></CompanyRoute>} />
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
