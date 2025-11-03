import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SignUpScreen } from './SignUpScreen';
import { useAuth } from '@/providers/AuthProvider';
import { router } from 'expo-router';
import { useTranslation } from '@/i18n/hooks';

// Mock dependencies
jest.mock('@/providers/AuthProvider');
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

const mockSignup = jest.fn();

const fillAllFields = ({ getByTestId, getByText }: any, overrides = {}) => {
  const defaults = {
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    name: 'John Doe',
    telefono: '+1234567890',
    nombreInstitucion: 'Test Hospital',
    tipoInstitucion: 'hospital',
    nit: '123456789',
    direccion: '123 Main St',
    ciudad: 'Test City',
    pais: 'Colombia',
    representante: 'John Doe',
  };

  const values = { ...defaults, ...overrides };

  fireEvent.changeText(getByTestId('email-input'), values.email);
  fireEvent.changeText(getByTestId('password-input'), values.password);
  fireEvent.changeText(getByTestId('confirm-password-input'), values.confirmPassword);
  fireEvent.changeText(getByTestId('telefono-input'), values.telefono);
  fireEvent.changeText(getByTestId('nombre-institucion-input'), values.nombreInstitucion);

  // For tipo_institucion dropdown
  const tipoDropdownPlaceholder = getByText('auth.signup.tipo_institucion_placeholder');
  const tipoDropdownParent = tipoDropdownPlaceholder.parent?.parent;
  if (tipoDropdownParent) {
    fireEvent(tipoDropdownParent, 'onChange', { value: values.tipoInstitucion, label: 'Hospital' });
  }

  fireEvent.changeText(getByTestId('nit-input'), values.nit);
  fireEvent.changeText(getByTestId('direccion-input'), values.direccion);

  // For pais dropdown
  const paisDropdownPlaceholder = getByText('auth.signup.pais');
  const paisDropdownParent = paisDropdownPlaceholder.parent?.parent;
  if (paisDropdownParent) {
    fireEvent(paisDropdownParent, 'onChange', { value: values.pais, label: values.pais });
  }

  // For ciudad dropdown
  const ciudadDropdownPlaceholder = getByText('auth.signup.ciudad');
  const ciudadDropdownParent = ciudadDropdownPlaceholder.parent?.parent;
  if (ciudadDropdownParent) {
    fireEvent(ciudadDropdownParent, 'onChange', { value: values.ciudad, label: values.ciudad });
  }

  fireEvent.changeText(getByTestId('representante-input'), values.representante);

  return values;
};

describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      signup: mockSignup,
      isSignupPending: false,
    });

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });
  });

  it('should render signup screen correctly', () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    expect(getByText('auth.signup.cardTitle')).toBeTruthy();
    expect(getByPlaceholderText('auth.signup.email')).toBeTruthy();
    expect(getByPlaceholderText('auth.signup.password')).toBeTruthy();
    expect(getByPlaceholderText('auth.signup.confirmPassword')).toBeTruthy();
    expect(getByText('auth.signup.signUp')).toBeTruthy();
  });

  it('should disable submit button when form is empty', () => {
    const { getByTestId } = render(<SignUpScreen />);
    const submitButton = getByTestId('submit-button');

    expect(submitButton.props.accessibilityState.disabled).toBe(true);
  });

  it('should show validation errors for invalid email', async () => {
    const { getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(emailInput, 'blur');

    await waitFor(() => {
      expect(getByTestId('email-input-error')).toBeTruthy();
    });
  });

  it('should show validation error for password less than 8 characters', async () => {
    const { getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'short');
    fireEvent(passwordInput, 'blur');

    await waitFor(() => {
      expect(getByTestId('password-input-error')).toBeTruthy();
    });
  });

  it('should show validation error when passwords do not match', async () => {
    const { getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const confirmPasswordInput = getByTestId('confirm-password-input');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'different123');
    fireEvent(confirmPasswordInput, 'blur');

    await waitFor(() => {
      expect(getByTestId('confirm-password-input-error')).toBeTruthy();
    });
  });

  it('should show validation error for empty confirm password', async () => {
    const { getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const confirmPasswordInput = getByTestId('confirm-password-input');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'test');
    fireEvent.changeText(confirmPasswordInput, '');
    fireEvent(confirmPasswordInput, 'blur');

    await waitFor(() => {
      expect(getByTestId('confirm-password-input-error')).toBeTruthy();
    });

    await waitFor(() => {
      const submitButton = getByTestId('submit-button');
      expect(submitButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  it('should call signup function with correct credentials', async () => {
    mockSignup.mockResolvedValue({});

    const renderResult = render(<SignUpScreen />);
    const { getByTestId } = renderResult;

    const values = fillAllFields(renderResult);

    await waitFor(() => {
      const submitButton = getByTestId('submit-button');
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        values.email,
        values.password,
        values.representante,
        values.telefono,
        values.nombreInstitucion,
        values.tipoInstitucion,
        values.nit,
        values.direccion,
        values.ciudad,
        values.pais,
        values.representante
      );
    });
  });

  it('should redirect to login after successful signup', async () => {
    mockSignup.mockResolvedValue({});

    const renderResult = render(<SignUpScreen />);
    const { getByTestId } = renderResult;

    fillAllFields(renderResult, { email: 'newuser@example.com' });

    await waitFor(() => {
      const submitButton = getByTestId('submit-button');
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/login');
    });
  });

  it('should show loading state during signup', () => {
    (useAuth as jest.Mock).mockReturnValue({
      signup: mockSignup,
      isSignupPending: true,
    });

    const { getByTestId } = render(<SignUpScreen />);
    const submitButton = getByTestId('submit-button');

    expect(submitButton.props.accessibilityState.disabled).toBe(true);
  });

  it('should enable button when form becomes valid', async () => {
    const renderResult = render(<SignUpScreen />);
    const { getByTestId } = renderResult;

    // Initially button is disabled
    let submitButton = getByTestId('submit-button');
    expect(submitButton.props.accessibilityState.disabled).toBe(true);

    // Make form valid
    fillAllFields(renderResult, { email: 'valid@email.com' });

    // Button should become enabled
    await waitFor(() => {
      submitButton = getByTestId('submit-button');
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });
  });

  it('should show all errors simultaneously when all fields are invalid', async () => {
    const { getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const confirmPasswordInput = getByTestId('confirm-password-input');

    // Enter invalid email
    fireEvent.changeText(emailInput, 'not-an-email');
    fireEvent(emailInput, 'blur');

    // Enter short password
    fireEvent.changeText(passwordInput, 'short');
    fireEvent(passwordInput, 'blur');

    // Enter non-matching confirm password
    fireEvent.changeText(confirmPasswordInput, 'different');
    fireEvent(confirmPasswordInput, 'blur');

    // All errors should be visible
    await waitFor(() => {
      expect(getByTestId('email-input-error')).toBeTruthy();
      expect(getByTestId('password-input-error')).toBeTruthy();
      expect(getByTestId('confirm-password-input-error')).toBeTruthy();
    });
  });

  it('should disable button when only email is filled', async () => {
    const { getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'test@example.com');

    await waitFor(() => {
      const submitButton = getByTestId('submit-button');
      expect(submitButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  it('should disable button when email and password are filled but not confirmPassword', async () => {
    const { getByTestId } = render(<SignUpScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    await waitFor(() => {
      const submitButton = getByTestId('submit-button');
      expect(submitButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  it('should handle signup with exactly 8 character password', async () => {
    mockSignup.mockResolvedValue({});

    const renderResult = render(<SignUpScreen />);
    const { getByTestId } = renderResult;

    const values = fillAllFields(renderResult, {
      password: 'pass1234',
      confirmPassword: 'pass1234',
    });

    await waitFor(() => {
      const submitButton = getByTestId('submit-button');
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        values.email,
        'pass1234',
        values.representante,
        values.telefono,
        values.nombreInstitucion,
        values.tipoInstitucion,
        values.nit,
        values.direccion,
        values.ciudad,
        values.pais,
        values.representante
      );
    });
  });

  it('should navigate to login when signin link is pressed', () => {
    const { getByTestId } = render(<SignUpScreen />);

    const signinLink = getByTestId('signin-link');
    fireEvent.press(signinLink);

    expect(router.push).toHaveBeenCalledWith('/login');
  });

  it('should render signin link text', () => {
    const { getByText } = render(<SignUpScreen />);

    expect(getByText('auth.signup.haveAccount')).toBeTruthy();
    expect(getByText('auth.signup.signIn')).toBeTruthy();
  });
});
