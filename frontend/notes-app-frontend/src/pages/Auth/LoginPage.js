// src/pages/Auth/LoginPage.js
import React from 'react';
import Login from '../../components/auth/Login';
import './AuthPages.css';

function LoginPage() {
  return (
    <div className="auth-page-container">
      <div className="auth-page-content">
        <div className="auth-page-header">
          <h1>Welcome Back!</h1>
          <p>Sign in to access your notes</p>
        </div>
        
        <div className="auth-form-container">
          <Login />
        </div>
        
        <div className="auth-page-footer">
          <p>Need assistance? Contact support</p>
        </div>
      </div>
      
      <div className="auth-page-background">
        <div className="auth-illustration">
          {/* SVG illustration could be added here */}
          <div className="illustration-placeholder">
            <i className="fas fa-sticky-note"></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;