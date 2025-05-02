import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Call register service through the context
      await register(username, email, password, confirmPassword);
      
      // Auto-login the user after successful registration
      await login(email, password);
      
      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Redirect to home page
      navigate('/');
      
    } catch (err) {
      // Handle different error formats from backend
      if (err.username) {
        setError(`Username: ${err.username.join(', ')}`);
      } else if (err.email) {
        setError(`Email: ${err.email.join(', ')}`);
      } else if (err.password) {
        setError(`Password: ${err.password.join(', ')}`);
      } else if (err.password2) {
        setError(`Confirm Password: ${err.password2.join(', ')}`);
      } else if (err.detail) {
        setError(err.detail);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-component">
      <h2>Create Account</h2>
      
      {error && <div className="form-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <div className="input-with-icon">
            <i className="fas fa-user"></i>
            <input
              type="text"
              id="register-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              placeholder="Choose a username"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-with-icon">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              id="register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your email"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-with-icon">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Create a password"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <div className="input-with-icon">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Confirm your password"
            />
          </div>
        </div>
        
        <div className="password-requirements">
          <p>Password must:</p>
          <ul>
            <li className={password.length >= 8 ? 'met' : ''}>
              <i className={password.length >= 8 ? 'fas fa-check' : 'fas fa-times'}></i>
              Be at least 8 characters
            </li>
            <li className={/[A-Z]/.test(password) ? 'met' : ''}>
              <i className={/[A-Z]/.test(password) ? 'fas fa-check' : 'fas fa-times'}></i>
              Include at least one uppercase letter
            </li>
            <li className={/[0-9]/.test(password) ? 'met' : ''}>
              <i className={/[0-9]/.test(password) ? 'fas fa-check' : 'fas fa-times'}></i>
              Include at least one number
            </li>
          </ul>
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="btn-register" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i> Register
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="auth-redirect">
        Already have an account? <Link to="/login">Login here</Link>
      </div>
    </div>
  );
}

export default Register;