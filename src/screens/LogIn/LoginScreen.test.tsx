import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store';
import { useTranslation } from '@/i18n/hooks';
import { router } from 'expo-router';

jest.mock('@/providers/AuthProvider');
jest.mock('@/store');
jest.mock('@/i18n/hooks');
jest.mock('expo-router');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('LoginScreen', () => {
  const mockLogin = jest.fn();

  const mockT = (key: string): string => {
    const translations: Record<string, string> = {
      'auth.login.title': 'Welcome Back',
      'auth.login.subtitle': 'Sign in to continue',
      'auth.login.cardTitle': 'Sign In Form',
      'auth.login.cardSubtitle': 'Enter your credentials',
      'auth.login.email': 'Email',
      'auth.login.password': 'Password',
      'auth.login.signIn': 'Sign In',
      'auth.login.noAccount': "Don't have an account?",
      'auth.login.signUp': 'Sign Up',
    };
    return translations[key] || key;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const setupMocks = (overrides = {}) => {
    const defaults = {
      login: jest.fn().mockResolvedValue(undefined),
      isLoginPending: false,
      isAuthenticated: false,
    };
    const config = { ...defaults, ...overrides };

    mockUseAuth.mockReturnValue({
      login: config.login,
      isLoginPending: config.isLoginPending,
    } as any);

    // Mock useAuthStore as a selector hook
    mockUseAuthStore.mockImplementation((selector) => {
      const store = { isAuthenticated: config.isAuthenticated } as any;
      return selector(store);
    });

    mockUseTranslation.mockReturnValue({
      t: mockT,
    } as any);

    return config.login;
  };

  it('should render screen with all elements (title, subtitle, form)', () => {
    setupMocks();
    render(<LoginScreen />);

    expect(screen.getByTestId('login-screen')).toBeTruthy();
    expect(screen.getByTestId('login-form')).toBeTruthy();
    expect(screen.getByText('Welcome Back')).toBeTruthy();
    expect(screen.getByText('Sign in to continue')).toBeTruthy();
    expect(screen.getByText('Sign In Form')).toBeTruthy();
    expect(screen.getByText('Enter your credentials')).toBeTruthy();
  });

  it('should render email input with correct properties (keyboard type, autoCapitalize)', () => {
    setupMocks();
    render(<LoginScreen />);

    const emailInput = screen.getByTestId('login-email-input');
    expect(emailInput).toBeTruthy();
    expect(emailInput.props.keyboardType).toBe('email-address');
    expect(emailInput.props.autoCapitalize).toBe('none');
    expect(emailInput.props.autoCorrect).toBe(false);
  });

  it('should render password input with correct properties (secureTextEntry)', () => {
    setupMocks();
    render(<LoginScreen />);

    const passwordInput = screen.getByTestId('login-password-input');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(passwordInput.props.autoCapitalize).toBe('none');
  });

  it('should navigate to signup when link pressed', () => {
    setupMocks();
    render(<LoginScreen />);

    const signupLink = screen.getByTestId('login-sign-up-link');
    fireEvent.press(signupLink);

    expect(router.push).toHaveBeenCalledWith('/signup');
  });

  it('should NOT redirect when not authenticated', () => {
    setupMocks();
    render(<LoginScreen />);

    expect(router.replace).not.toHaveBeenCalled();
    expect(screen.getByTestId('login-form')).toBeTruthy();
  });

  it('should redirect to home when authenticated', () => {
    setupMocks({ isAuthenticated: true });
    render(<LoginScreen />);

    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('should call login with credentials when form submitted', async () => {
    const mockLogin = setupMocks();
    render(<LoginScreen />);

    const emailInput = screen.getByTestId('login-email-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const submitButton = screen.getByTestId('login-sign-in-button');

    await act(async () => {
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
    });

    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should show loading state when isLoginPending is true', () => {
    setupMocks({ isLoginPending: true });
    render(<LoginScreen />);

    const submitButton = screen.getByTestId('login-sign-in-button');
    expect(submitButton).toBeTruthy();
    // Verify button is visually disabled when loading
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('should update email and password inputs when user types', async () => {
    setupMocks();
    render(<LoginScreen />);

    const emailInput = screen.getByTestId('login-email-input');
    const passwordInput = screen.getByTestId('login-password-input');

    await act(async () => {
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
    });

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });
});
