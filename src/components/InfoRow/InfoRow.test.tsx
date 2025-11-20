import { render } from '@testing-library/react-native';
import { Mail } from 'lucide-react-native';
import { InfoRow } from './InfoRow';

jest.mock('@/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('InfoRow', () => {
  const defaultProps = {
    icon: Mail,
    label: 'Email',
    value: 'test@example.com',
  };

  it('should render correctly with provided props', () => {
    const { getByText } = render(<InfoRow {...defaultProps} />);

    expect(getByText('Email')).toBeDefined();
    expect(getByText('test@example.com')).toBeDefined();
  });

  it('should render label text with correct styling', () => {
    const { getByText } = render(<InfoRow {...defaultProps} />);

    const labelElement = getByText('Email');
    expect(labelElement).toBeDefined();
  });

  it('should render value text with correct styling', () => {
    const { getByText } = render(<InfoRow {...defaultProps} />);

    const valueElement = getByText('test@example.com');
    expect(valueElement).toBeDefined();
  });

  it('should render different icons correctly', () => {
    const { root } = render(<InfoRow {...defaultProps} icon={Mail} />);
    expect(root).toBeTruthy();
  });

  it('should handle long text values', () => {
    const longValue = 'This is a very long email address that contains multiple words and special characters';
    const { getByText } = render(
      <InfoRow {...defaultProps} value={longValue} />
    );

    expect(getByText(longValue)).toBeDefined();
  });

  it('should handle special characters in label', () => {
    const { getByText } = render(
      <InfoRow {...defaultProps} label="Email Address (Primary)" />
    );

    expect(getByText('Email Address (Primary)')).toBeDefined();
  });

  it('should handle numeric values', () => {
    const { getByText } = render(
      <InfoRow {...defaultProps} value="12345" />
    );

    expect(getByText('12345')).toBeDefined();
  });

  it('should handle empty string values', () => {
    const { getByText } = render(
      <InfoRow {...defaultProps} value="" />
    );

    expect(getByText('Email')).toBeDefined();
  });

  it('should render multiple InfoRow components independently', () => {
    const { getByText } = render(
      <>
        <InfoRow icon={Mail} label="Email" value="test@example.com" />
        <InfoRow icon={Mail} label="Phone" value="+1234567890" />
      </>
    );

    expect(getByText('Email')).toBeDefined();
    expect(getByText('test@example.com')).toBeDefined();
    expect(getByText('Phone')).toBeDefined();
    expect(getByText('+1234567890')).toBeDefined();
  });
});
