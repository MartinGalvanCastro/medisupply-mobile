import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store';
import { router } from 'expo-router';
import { useTranslation } from '@/i18n/hooks';

// Mock dependencies
jest.mock('@/providers/AuthProvider');
jest.mock('@/store');
jest.mock('@/i18n/hooks');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSegments: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

const mockLogin = jest.fn();

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoginPending: false,
    });

    // Mock useAuthStore properly - it's a function that takes a selector and calls it
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isAuthenticated: false })
    );

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });
  });

  it('should render login screen correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByText('auth.login.cardTitle')).toBeTruthy();
    expect(getByPlaceholderText('auth.login.email')).toBeTruthy();
    expect(getByPlaceholderText('auth.login.password')).toBeTruthy();
    expect(getByText('auth.login.signIn')).toBeTruthy();
  });

  it('should redirect if user is already authenticated', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isAuthenticated: true })
    );

    render(<LoginScreen />);

    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('should disable submit button when form is empty', () => {
    const { getByTestId } = render(<LoginScreen />);
    const submitButton = getByTestId('submit-button');

    // Button should be disabled when form is empty
    expect(submitButton.props.accessibilityState.disabled).toBe(true);
  });

  it('should show validation errors for invalid email', async () => {
    const { getByTestId } = render(<LoginScreen />);

    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(emailInput, 'blur');

    await waitFor(() => {
      expect(getByTestId('email-input-error')).toBeTruthy();
    });
  });

  it('should show validation error for empty password', async () => {
    const { getByTestId } = render(<LoginScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    // Enter valid email
    fireEvent.changeText(emailInput, 'test@example.com');

    // Enter password then clear it to trigger validation error
    fireEvent.changeText(passwordInput, 'test');
    fireEvent.changeText(passwordInput, '');
    fireEvent(passwordInput, 'blur');

    await waitFor(() => {
      // Should show password required error
      expect(getByTestId('password-input-error')).toBeTruthy();
    });

    await waitFor(() => {
      const submitButton = getByTestId('submit-button');
      // Button should be disabled when password is empty
      expect(submitButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  it('should call login function with correct credentials', async () => {
    const { getByTestId } = render(<LoginScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    // Wait for validation to complete
    await waitFor(() => {
      const submitButton = getByTestId('submit-button');
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    // Find and press the button
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should redirect after successful login', async () => {
    const { getByTestId, rerender } = render(<LoginScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const submitButton = getByTestId('submit-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    await waitFor(() => {
      fireEvent.press(submitButton);
    });

    // Simulate successful login by changing auth state
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isAuthenticated: true })
    );
    rerender(<LoginScreen />);

    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('should call login with form data when submitted', async () => {
    const { getByTestId } = render(<LoginScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'user@test.com');
    fireEvent.changeText(passwordInput, 'mypassword');

    // Wait for validation to complete
    await waitFor(() => {
      const submitButton = getByTestId('submit-button');
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    // Verify login was called with the correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'mypassword');
    });
  });

  it('should show loading state during login', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoginPending: true,
    });

    const { getByTestId } = render(<LoginScreen />);
    const submitButton = getByTestId('submit-button');

    // Button should be disabled during loading
    expect(submitButton.props.accessibilityState.disabled).toBe(true);
  });

  it('should show both email and password errors simultaneously', async () => {
    const { getByTestId } = render(<LoginScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    // Enter invalid email
    fireEvent.changeText(emailInput, 'not-an-email');
    fireEvent(emailInput, 'blur');

    // Enter password then clear it
    fireEvent.changeText(passwordInput, 'test');
    fireEvent.changeText(passwordInput, '');
    fireEvent(passwordInput, 'blur');

    // Both errors should be visible
    await waitFor(() => {
      expect(getByTestId('email-input-error')).toBeTruthy();
      expect(getByTestId('password-input-error')).toBeTruthy();
    });
  });

  it('should enable button when form becomes valid', async () => {
    const { getByTestId } = render(<LoginScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    // Initially button is disabled
    let submitButton = getByTestId('submit-button');
    expect(submitButton.props.accessibilityState.disabled).toBe(true);

    // Make form valid
    fireEvent.changeText(emailInput, 'valid@email.com');
    fireEvent.changeText(passwordInput, 'validpassword');

    // Button should become enabled
    await waitFor(() => {
      submitButton = getByTestId('submit-button');
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });
  });

  it('should navigate to signup when signup link is pressed', () => {
    const { getByTestId } = render(<LoginScreen />);

    const signupLink = getByTestId('signup-link');
    fireEvent.press(signupLink);

    expect(router.push).toHaveBeenCalledWith('/signup');
  });

  it('should render signup link text', () => {
    const { getByText } = render(<LoginScreen />);

    expect(getByText('auth.login.noAccount')).toBeTruthy();
    expect(getByText('auth.login.signUp')).toBeTruthy();
  });

});
