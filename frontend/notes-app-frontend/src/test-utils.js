import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from './contexts/AuthContext';

// Mock navigate function
const mockNavigate = jest.fn();

// Mock location object
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null
};

// Mock React Router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  BrowserRouter: ({ children }) => <div>{children}</div>
}));

const defaultAuthContext = {
  isAuthenticated: false,
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
};

const AllTheProviders = ({ children, authContextValue = defaultAuthContext }) => {
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

const customRender = (
  ui,
  {
    authContextValue = defaultAuthContext,
    ...renderOptions
  } = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        authContextValue={authContextValue}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// re-export everything
export * from '@testing-library/react';

// override render method and export mocks
export {
  customRender as render,
  mockNavigate,
  mockLocation,
  defaultAuthContext,
}; 