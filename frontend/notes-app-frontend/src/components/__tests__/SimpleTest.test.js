import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SimpleTest from '../SimpleTest';

// Mock the alert function
window.alert = jest.fn();

describe('SimpleTest Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders with default message', () => {
    render(<SimpleTest />);
    
    // Check if the default message is rendered
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<SimpleTest message="Custom Message" />);
    
    // Check if the custom message is rendered
    expect(screen.getByText('Custom Message')).toBeInTheDocument();
  });

  it('shows alert when button is clicked', () => {
    render(<SimpleTest />);
    
    // Find the button and click it
    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    
    // Check if alert was called
    expect(window.alert).toHaveBeenCalledWith('Button clicked!');
  });
}); 