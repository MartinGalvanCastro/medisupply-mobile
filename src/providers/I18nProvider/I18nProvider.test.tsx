import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { I18nProvider } from './I18nProvider';
import i18n from '../../i18n/config/i18n.config';

// Mock i18n
jest.mock('../../i18n/config/i18n.config', () => ({
  __esModule: true,
  default: {
    isInitialized: true,
    init: jest.fn(),
    use: jest.fn(() => ({
      init: jest.fn(),
    })),
  },
}));

describe('I18nProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <I18nProvider>
        <Text>Test Child</Text>
      </I18nProvider>
    );

    expect(getByText('Test Child')).toBeTruthy();
  });

  it('should wrap children with I18nextProvider', () => {
    const TestComponent = () => <Text>Test Component</Text>;

    const { getByText } = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(getByText('Test Component')).toBeTruthy();
  });

  it('should not initialize i18n if already initialized', () => {
    render(
      <I18nProvider>
        <Text>Child</Text>
      </I18nProvider>
    );

    expect(i18n.init).not.toHaveBeenCalled();
  });

  it('should initialize i18n if not initialized', () => {
    const mockI18n = i18n as any;
    mockI18n.isInitialized = false;

    render(
      <I18nProvider>
        <Text>Child</Text>
      </I18nProvider>
    );

    expect(i18n.init).toHaveBeenCalled();
    mockI18n.isInitialized = true;
  });

  it('should render multiple children', () => {
    const { getByText } = render(
      <I18nProvider>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </I18nProvider>
    );

    expect(getByText('First Child')).toBeTruthy();
    expect(getByText('Second Child')).toBeTruthy();
  });
});
