import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DonorLogin } from './pages/DonorLogin';
import { DonorSignup } from './pages/DonorSignup';
import { VetSignup } from './pages/VetSignup';
import { DonorFeed } from './pages/DonorFeed';
import { CaseDetail } from './pages/CaseDetail';
import { VetDashboard } from './pages/VetDashboard';
import { CreateCase } from './pages/CreateCase';
import { EditCase } from './pages/EditCase';
import { RecoveryFeed } from './pages/RecoveryFeed';
import { RecoveryUpload } from './pages/RecoveryUpload';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminRecoveryApprovals } from './pages/AdminRecoveryApprovals';
import { AdminCaseManagement } from './pages/AdminCaseManagement';
import { AdminUserManagement } from './pages/AdminUserManagement';
import { AdminVetApplications } from './pages/AdminVetApplications';
import { DonorProfile } from './pages/DonorProfile';
import { VetProfile } from './pages/VetProfile';
import { VetLogin } from './pages/VetLogin';
import { VetApplicationForm } from './pages/VetApplicationForm';
import { DonationAmount } from './pages/DonationAmount';
import { DonationPayment } from './pages/DonationPayment';
import { DonationSuccess } from './pages/DonationSuccess';
import { ForgotPassword } from './pages/ForgotPassword';
import { AdminLogin } from './pages/AdminLogin';

import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-4xl">CV</span>
        </div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-4">This page doesn't exist yet.</p>
        <a href="/" className="text-emerald-600 font-semibold hover:text-emerald-700">← Go Home</a>
      </div>
    </div>
  );
}

function DashboardRedirect() {
  const { role } = useAuth();

  if (role === 'donor') {
    return <Navigate to="/profile" replace />;
  }

  if (role === 'vet' || role === 'clinic') {
    return <Navigate to="/vet/dashboard" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
}

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <DonorLogin /> },
  { path: '/signup', element: <DonorSignup /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/vet/login', element: <VetLogin /> },
  { path: '/vet/signup', element: <VetSignup /> },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/dashboard', element: <DashboardRedirect /> },
  { path: '/browse', element: <DonorFeed /> },
  { path: '/case/:id', element: <CaseDetail /> },
  { path: '/donate/:id', element: <DonationAmount /> },
  { path: '/donate/:id/payment', element: <DonationPayment /> },
  { path: '/donate/success', element: <DonationSuccess /> },
  { path: '/profile', element: <ProtectedRoute><DonorProfile /></ProtectedRoute> },
  { path: '/recovery-feed', element: <RecoveryFeed /> },
  { path: '/vet/recovery-upload', element: <ProtectedRoute allowedRoles={['vet', 'clinic']}><RecoveryUpload /></ProtectedRoute> },

  // Vet routes
  { path: '/vet/dashboard', element: <ProtectedRoute allowedRoles={['vet', 'clinic']}><VetDashboard /></ProtectedRoute> },
  { path: '/vet/create-case', element: <ProtectedRoute allowedRoles={['vet', 'clinic']}><CreateCase /></ProtectedRoute> },
  { path: '/vet/edit-case/:id', element: <ProtectedRoute allowedRoles={['vet', 'clinic']}><EditCase /></ProtectedRoute> },
  { path: '/vet/profile', element: <ProtectedRoute allowedRoles={['vet', 'clinic']}><VetProfile /></ProtectedRoute> },
  { path: '/vet/apply', element: <ProtectedRoute allowedRoles={['donor']}><VetApplicationForm /></ProtectedRoute> },

  // Admin routes
  { path: '/admin/dashboard', element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute> },
  { path: '/admin/recovery-approvals', element: <ProtectedRoute allowedRoles={['admin']}><AdminRecoveryApprovals /></ProtectedRoute> },
  { path: '/admin/case-management', element: <ProtectedRoute allowedRoles={['admin']}><AdminCaseManagement /></ProtectedRoute> },
  { path: '/admin/user-management', element: <ProtectedRoute allowedRoles={['admin']}><AdminUserManagement /></ProtectedRoute> },
  { path: '/admin/vet-applications', element: <ProtectedRoute allowedRoles={['admin']}><AdminVetApplications /></ProtectedRoute> },

  // Catch-all
  { path: '*', element: <NotFound /> },
]);