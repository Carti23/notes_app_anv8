// src/pages/Auth/RegisterPage.js
import React from 'react';
import Register from '../../components/auth/Register';
import './AuthPages.css';

function RegisterPage() {
  return (
    <div className="auth-page-container">
      <div className="auth-page-content">
        <div className="auth-page-header">
          <h1>Create Your Account</h1>
          <p>Join us to organize your notes like never before</p>
        </div>
        
        <div className="auth-form-container">
          <Register />
        </div>
        
        <div className="auth-page-footer">
          <p>By signing up, you agree to our Terms and Privacy Policy</p>
        </div>
      </div>
      
      <div className="auth-page-background">
        <div className="auth-illustration">
          {/* SVG illustration could be added here */}
          <div className="illustration-placeholder">
            <i className="fas fa-user-plus"></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;