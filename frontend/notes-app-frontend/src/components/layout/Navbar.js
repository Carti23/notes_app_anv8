import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <i className="fas fa-sticky-note"></i>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1>Notes App</h1>
          </Link>
        </div>
        <div className="navbar-actions">
          {user ? (
            <>
              <span className="user-greeting">
                <i className="fas fa-user"></i> Hi, {user.username}
              </span>
              <button 
                className="auth-btn logout-btn" 
                onClick={logout}
                type="button"
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-btn login-btn">
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
              <Link to="/register" className="auth-btn register-btn">
                <i className="fas fa-user-plus"></i> Register
              </Link>
            </>
          )}
          <button className="theme-toggle" onClick={toggleDarkMode}>
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;