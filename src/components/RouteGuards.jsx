import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleGuard from './RoleGuard'; // Repurpose existing RoleGuard for Payment check or rename it

export const PublicRoute = () => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return <div className="loading-screen">Loading...</div>;

    if (isAuthenticated) {
        if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (user?.role === 'GYM_OWNER') return <Navigate to="/gym-dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div className="loading-screen">Loading...</div>;

    return isAuthenticated ? <Outlet /> : <Navigate to="/auth?tab=login" replace />;
};

export const AdminRoute = () => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return <div className="loading-screen">Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/auth?tab=login" replace />;

    if (user?.role === 'ADMIN') return <Outlet />;

    return <Navigate to="/dashboard" replace />;
};

// This wraps RoleGuard to ensure payment check for Gym Owners
export const GymOwnerRoute = () => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return <div className="loading-screen">Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/auth?tab=login" replace />;

    if (user?.role !== 'GYM_OWNER') {
        return <Navigate to="/dashboard" replace />;
    }

    // RoleGuard component handles the payment lock logic - REMOVED to allow Free Plan
    return <Outlet />;
};
