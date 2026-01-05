// Root App component
// Handles routing, authentication state, and global app context

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ReceiptProvider } from './context/ReceiptContext';
import PrivateRoute from './components/PrivateRoute';
import WhatsAppButton from './components/WhatsAppButton';
import Navigation from './components/Navigation';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import AISuggestions from './pages/AISuggestions';
import Reports from './pages/Reports';
import AuditMode from './pages/AuditMode';
import Settings from './pages/Settings';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

function App() {
  return (
    <AuthProvider>
      <ReceiptProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <PrivateRoute>
                    <Upload />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ai-suggestions"
                element={
                  <PrivateRoute>
                    <AISuggestions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/audit"
                element={
                  <PrivateRoute>
                    <AuditMode />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment/success"
                element={
                  <PrivateRoute>
                    <PaymentSuccess />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment/cancel"
                element={
                  <PrivateRoute>
                    <PaymentCancel />
                  </PrivateRoute>
                }
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            
            {/* WhatsApp contact button - shown on all pages */}
            <WhatsAppButton />
          </div>
        </Router>
      </ReceiptProvider>
    </AuthProvider>
  );
}

export default App;
