// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#d97706' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  // Check if admin-only route
  if (adminOnly) {
    const isAdmin = user?.email?.includes('admin') || user?.email?.includes('asruka');
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;