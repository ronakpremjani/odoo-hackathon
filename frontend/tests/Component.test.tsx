import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { BrowserRouter } from 'react-router-dom';

// Simple mock for apiClient
jest.mock('../api/apiClient', () => ({
  apiClient: {
    post: jest.fn(() => Promise.resolve({ data: { data: { token: 'jwt-token', user: { name: 'Admin', role: 'Admin' } } } })),
  },
}));

describe('Login Component UI Render', () => {
  it('should render email and password inputs and show validations', async () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    // Expect inputs to exist
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    // Click submit button
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    // Wait for inline validations (zod schemas trigger client-side)
    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
    });
  });
});
