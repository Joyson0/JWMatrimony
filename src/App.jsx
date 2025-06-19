import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';

// Pages
import LoginRegister from './pages/LoginRegister';
import Home from './pages/Home';
import OAuthCallback from './pages/OAuthCallback';
import ProfileSetupPage from './pages/ProfileSetupPage';
import DashboardPage from './pages/DashboardPage';

/**
 * Main App Component
 * 
 * Defines the application routing structure with authentication protection.
 * Routes are organized by access level: public, auth-protected, and auth-redirected.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            
            {/* Auth Route - Redirects authenticated users to dashboard */}
            <Route 
              path="/auth" 
              element={
                <AuthRedirect>
                  <LoginRegister />
                </AuthRedirect>
              } 
            />
            
            {/* Protected Routes - Require authentication */}
            <Route 
              path="/profile-setup" 
              element={
                <ProtectedRoute>
                  <ProfileSetupPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;