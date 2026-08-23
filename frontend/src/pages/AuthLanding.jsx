import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLanding = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="auth-landing">
      <div className="auth-landing-backdrop"></div>
      <div className="auth-landing-card">
        <div className="auth-landing-logo">🛒</div>
        <h1 className="auth-landing-title">Mini D-Mart</h1>
        <p className="auth-landing-subtitle">
          Your favourite grocery store, now online.<br />
          Fresh products, great prices, delivered to your door.
        </p>
        <div className="auth-landing-actions">
          <Link to="/login" className="btn btn-primary auth-landing-btn" id="auth-login-btn">
            Login
          </Link>
          <Link to="/register" className="btn btn-outline auth-landing-btn" id="auth-register-btn">
            Create Account
          </Link>
        </div>
        <p className="auth-landing-footer">
          Shop smart. Shop Mini D-Mart.
        </p>
      </div>
    </div>
  );
};

export default AuthLanding;
