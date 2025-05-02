import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import AuthContext from '../../../contexts/AuthContext';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  // Mock the login function from AuthContext
  const mockLogin = jest.fn();
  
  // Default props for the AuthContext provider
  const defaultContextValue = {
    login: mockLogin,
    currentUser: null,
    logout: jest.fn()
  };
  
  // Helper function to render the component with the necessary providers
  const renderLogin = (contextValue = defaultContextValue) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={contextValue}>
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders login form correctly', () => {
    renderLogin();
    
    // Check if the main elements are rendered
    expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });
  
  it('shows error when submitting empty form', async () => {
    renderLogin();
    
    // Submit the form without filling in any fields
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    // Check if error message is displayed
    expect(screen.getByText('Please enter both email and password')).toBeInTheDocument();
    
    // Verify that login function was not called
    expect(mockLogin).not.toHaveBeenCalled();
  });
  
  it('calls login function with correct credentials', async () => {
    renderLogin();
    
    // Fill in the form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    // Check if login function was called with correct parameters
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
  
  it('shows loading state while logging in', async () => {
    // Mock a delayed login function
    const delayedLogin = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    renderLogin({
      ...defaultContextValue,
      login: delayedLogin
    });
    
    // Fill in the form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    // Check if loading state is displayed
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    
    // Wait for the login function to complete
    await waitFor(() => {
      expect(delayedLogin).toHaveBeenCalled();
    });
  });
  
  it('displays error message when login fails', async () => {
    // Mock a login function that throws an error
    const failingLogin = jest.fn().mockRejectedValue({ 
      detail: 'Invalid email or password' 
    });
    
    renderLogin({
      ...defaultContextValue,
      login: failingLogin
    });
    
    // Fill in the form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
  
  it('navigates to home page after successful login', async () => {
    // Mock a successful login
    const successfulLogin = jest.fn().mockResolvedValue({ success: true });
    
    renderLogin({
      ...defaultContextValue,
      login: successfulLogin
    });
    
    // Fill in the form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    // Check if navigate was called with the correct path
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
}); 