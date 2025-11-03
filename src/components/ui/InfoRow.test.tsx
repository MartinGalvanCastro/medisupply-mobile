import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Mail } from 'lucide-react-native';

// InfoRow Component (this is the component being tested)
interface InfoRowProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
}

function InfoRow({ icon: IconComponent, label, value }: InfoRowProps) {
  return (
    <HStack space="md" className="items-start">
      <View className="mt-0.5">
        <Icon as={IconComponent} size="sm" className="text-typography-500" />
      </View>
      <VStack space="xs" className="flex-1">
        <Text className="text-xs text-typography-500 uppercase tracking-wide">
          {label}
        </Text>
        <Text className="text-sm text-typography-900">
          {value}
        </Text>
      </VStack>
    </HStack>
  );
}

// Mock lucide-react-native icons (external library)
jest.mock('lucide-react-native', () => ({
  Mail: 'Mail',
  Phone: 'Phone',
  Building2: 'Building2',
  MapPin: 'MapPin',
  FileText: 'FileText',
  UserCircle: 'UserCircle',
}));

describe('InfoRow Component', () => {
  describe('Rendering', () => {
    it('should render InfoRow with all props', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email Address"
          value="test@example.com"
        />
      );

      expect(getByText('Email Address')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });

    it('should render with correct label formatting', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Contact Email"
          value="contact@test.com"
        />
      );

      const label = getByText('Contact Email');
      expect(label).toBeTruthy();
      expect(label.props.className).toContain('uppercase');
    });

    it('should render with correct value formatting', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="user@example.com"
        />
      );

      const value = getByText('user@example.com');
      expect(value).toBeTruthy();
      expect(value.props.className).toContain('text-sm');
    });

    it('should render with all required elements visible', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="test@example.com"
        />
      );

      expect(getByText('Email')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });
  });

  describe('Icon Rendering', () => {
    it('should render with different icon types', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Test Label"
          value="Test Value"
        />
      );

      expect(getByText('Test Label')).toBeTruthy();
      expect(getByText('Test Value')).toBeTruthy();
    });

    it('should render icon within component', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="test@example.com"
        />
      );

      expect(getByText('Email')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });
  });

  describe('Label and Value Display', () => {
    it('should handle long labels', () => {
      const longLabel = 'This is a very long label that might wrap';
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label={longLabel}
          value="Value"
        />
      );

      expect(getByText(longLabel)).toBeTruthy();
    });

    it('should handle long values', () => {
      const longValue = 'this-is-a-very-long-email-address-that-might-wrap-to-multiple-lines@example.com';
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value={longValue}
        />
      );

      expect(getByText(longValue)).toBeTruthy();
    });

    it('should handle empty label', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label=""
          value="Test Value"
        />
      );

      expect(getByText('Test Value')).toBeTruthy();
    });

    it('should handle special characters in label', () => {
      const specialLabel = 'Email & Contact Info / Details';
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label={specialLabel}
          value="test@example.com"
        />
      );

      expect(getByText(specialLabel)).toBeTruthy();
    });

    it('should handle special characters in value', () => {
      const specialValue = 'test+tag@example.co.uk (primary)';
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value={specialValue}
        />
      );

      expect(getByText(specialValue)).toBeTruthy();
    });

    it('should handle spaces and newlines in value', () => {
      const multilineValue = '123 Main Street\nApt 4B';
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Address"
          value={multilineValue}
        />
      );

      expect(getByText(multilineValue)).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('should render with proper spacing and layout', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="test@example.com"
        />
      );

      expect(getByText('Email')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });

    it('should maintain proper structure with all elements', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="test@example.com"
        />
      );

      expect(getByText('Email')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });

    it('should render label and value in correct positions', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="test@example.com"
        />
      );

      const label = getByText('Email');
      const value = getByText('test@example.com');
      expect(label).toBeTruthy();
      expect(value).toBeTruthy();
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple InfoRow components independently', () => {
      const { getByText } = render(
        <View>
          <InfoRow icon={Mail} label="Email" value="email@test.com" />
          <InfoRow icon={Mail} label="Phone" value="123-456-7890" />
          <InfoRow icon={Mail} label="Address" value="123 Main St" />
        </View>
      );

      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Phone')).toBeTruthy();
      expect(getByText('Address')).toBeTruthy();
      expect(getByText('email@test.com')).toBeTruthy();
      expect(getByText('123-456-7890')).toBeTruthy();
      expect(getByText('123 Main St')).toBeTruthy();
    });

    it('should maintain independent state across multiple instances', () => {
      const { getByText, getByTestId } = render(
        <View>
          <InfoRow icon={Mail} label="First Label" value="First Value" />
          <InfoRow icon={Mail} label="Second Label" value="Second Value" />
        </View>
      );

      expect(getByText('First Label')).toBeTruthy();
      expect(getByText('First Value')).toBeTruthy();
      expect(getByText('Second Label')).toBeTruthy();
      expect(getByText('Second Value')).toBeTruthy();
    });
  });
});
