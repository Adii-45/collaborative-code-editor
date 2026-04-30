import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import AcceptInvite from './pages/AcceptInvite';
import GitHubCallback from './pages/GitHubCallback';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="w-screen h-screen flex flex-col bg-[#0d1117] text-white">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/:projectId"
              element={
                <ProtectedRoute>
                  <Room />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invite/:token"
              element={
                <ProtectedRoute>
                  <AcceptInvite />
                </ProtectedRoute>
              }
            />
            <Route
              path="/github/callback"
              element={<GitHubCallback />}
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>

        {/* Toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#161b22',
              color: '#e6edf3',
              border: '1px solid #30363d',
              fontSize: '14px',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
