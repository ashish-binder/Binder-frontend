// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import EssentialsViewPage from './pages/EssentialsViewPage';
import Profile from './pages/Profile';
import CompanyProfile from './pages/CompanyProfile';
import Onboarding from './pages/Onboarding';
import RegisterCompany from './pages/RegisterCompany';
import SetPassword from './pages/SetPassword';
import Chatbot from './components/Chatbot';
import Status from './pages/Status';

const LoadingScreen = () => (
  <div className="loading-screen">
    <div>Loading...</div>
  </div>
);

// Global chatbot — only shown when user is authenticated
const GlobalChatbot = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading || !isAuthenticated) return null;
  return <Chatbot />;
};

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AuthAwareRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

const Unauthorized = () => (
  <div className="unauthorized-screen">
    <h1>Unauthorized</h1>
    <p>You don't have permission to access this page.</p>
    <a href="/login" className="unauthorized-login-link">Go to Login</a>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <LoadingProvider>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register-company" element={<PublicOnlyRoute><RegisterCompany /></PublicOnlyRoute>} />
          <Route path="/set-password" element={<PublicOnlyRoute><SetPassword /></PublicOnlyRoute>} />
          <Route path="/unauthorized" element={<ProtectedRoute><Unauthorized /></ProtectedRoute>} />
          <Route path="/essentials/view/:token" element={<ProtectedRoute><EssentialsViewPage /></ProtectedRoute>} />
          <Route path="/status" element={<ProtectedRoute><Status /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/company-profile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          
          {/* Community Route - Add this */}
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            }
          />
          
          {/* All dashboard routes lead to the same Dashboard component */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:section"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/:section"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/dashboard/:section"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tenant/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/dashboard/:section"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Default Route */}
          <Route path="/" element={<AuthAwareRedirect />} />
          <Route path="*" element={<AuthAwareRedirect />} />
        </Routes>
        <GlobalChatbot />
        <GlobalLoadingOverlay />
        </LoadingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
