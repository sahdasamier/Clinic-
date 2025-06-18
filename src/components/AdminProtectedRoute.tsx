import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthContext } from '../app/AuthProvider';
import { isSuperAdmin } from '../utils/adminConfig';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f8fafc',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // If user is not authenticated, redirect to admin login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but not a super admin, redirect to regular dashboard
  if (!isSuperAdmin(user.email || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated super admin, render children
  return <>{children}</>;
};

export default AdminProtectedRoute; 