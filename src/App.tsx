import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import NewProposal from './pages/NewProposal';
import ProposalDetail from './pages/ProposalDetail';
import UserManagement from './pages/UserManagement';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Deadlines from './pages/Deadlines';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard/proposals" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Proposals />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard/proposals/new" element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <DashboardLayout>
                  <NewProposal />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard/proposals/:proposalId" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProposalDetail />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard/messages" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Messages />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard/notifications" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Notifications />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard/deadlines" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Deadlines />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <UserManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
