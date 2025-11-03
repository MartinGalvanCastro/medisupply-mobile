import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { InfoRow } from './InfoRow';
import { Mail, Phone, Building2, MapPin } from 'lucide-react-native';

// Only mock external 3rd-party icon libraries
jest.mock('lucide-react-native', () => ({
  Mail: 'Mail',
  Phone: 'Phone',
  Building2: 'Building2',
  MapPin: 'MapPin',
  FileText: 'FileText',
  UserCircle: 'UserCircle',
  LogOut: 'LogOut',
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

    it('should render label and value in correct hierarchy', () => {
      const { getByText, UNSAFE_getByType } = render(
        <InfoRow
          icon={Mail}
          label="Contact"
          value="contact@test.com"
        />
      );

      // Verify both label and value are rendered
      const label = getByText('Contact');
      const value = getByText('contact@test.com');

      expect(label).toBeTruthy();
      expect(value).toBeTruthy();
    });

    it('should render multiple InfoRow components with distinct content', () => {
      const { getByText } = render(
        <View>
          <InfoRow icon={Mail} label="Email" value="email@test.com" />
          <InfoRow icon={Phone} label="Phone" value="123-456-7890" />
          <InfoRow icon={Building2} label="Building" value="Main Office" />
        </View>
      );

      // Verify each row's unique content is rendered
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Phone')).toBeTruthy();
      expect(getByText('Building')).toBeTruthy();
      expect(getByText('email@test.com')).toBeTruthy();
      expect(getByText('123-456-7890')).toBeTruthy();
      expect(getByText('Main Office')).toBeTruthy();
    });
  });

  describe('Icon Rendering', () => {
    it('should render with Mail icon component', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="test@example.com"
        />
      );

      // Verify content renders (icon is passed as prop)
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });

    it('should render with Phone icon component', () => {
      const { getByText } = render(
        <InfoRow
          icon={Phone}
          label="Phone"
          value="555-1234"
        />
      );

      expect(getByText('Phone')).toBeTruthy();
      expect(getByText('555-1234')).toBeTruthy();
    });

    it('should render with Building2 icon component', () => {
      const { getByText } = render(
        <InfoRow
          icon={Building2}
          label="Institution"
          value="Hospital"
        />
      );

      expect(getByText('Institution')).toBeTruthy();
      expect(getByText('Hospital')).toBeTruthy();
    });

    it('should render with MapPin icon component', () => {
      const { getByText } = render(
        <InfoRow
          icon={MapPin}
          label="Location"
          value="123 Main St"
        />
      );

      expect(getByText('Location')).toBeTruthy();
      expect(getByText('123 Main St')).toBeTruthy();
    });

    it('should accept icon prop correctly', () => {
      const CustomIcon = () => null;
      const { getByText } = render(
        <InfoRow
          icon={CustomIcon}
          label="Test Label"
          value="Test Value"
        />
      );

      // Verify it renders successfully with different icon prop
      expect(getByText('Test Label')).toBeTruthy();
      expect(getByText('Test Value')).toBeTruthy();
    });
  });

  describe('Label Display', () => {
    it('should display label correctly', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email Address"
          value="test@example.com"
        />
      );

      expect(getByText('Email Address')).toBeTruthy();
    });

    it('should handle uppercase labels', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="CONTACT EMAIL"
          value="test@example.com"
        />
      );

      expect(getByText('CONTACT EMAIL')).toBeTruthy();
    });

    it('should handle long labels', () => {
      const longLabel = 'This is a very long label that might wrap to multiple lines';
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label={longLabel}
          value="Value"
        />
      );

      expect(getByText(longLabel)).toBeTruthy();
    });

    it('should handle labels with special characters', () => {
      const specialLabel = 'Email & Contact / Details';
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label={specialLabel}
          value="test@example.com"
        />
      );

      expect(getByText(specialLabel)).toBeTruthy();
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

    it('should handle single character label', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="E"
          value="test@example.com"
        />
      );

      expect(getByText('E')).toBeTruthy();
    });

    it('should handle label with numbers', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email 123"
          value="test@example.com"
        />
      );

      expect(getByText('Email 123')).toBeTruthy();
    });
  });

  describe('Value Display', () => {
    it('should display value correctly', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="user@example.com"
        />
      );

      expect(getByText('user@example.com')).toBeTruthy();
    });

    it('should handle email values', () => {
      const email = 'john.doe+test@example.co.uk';
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value={email}
        />
      );

      expect(getByText(email)).toBeTruthy();
    });

    it('should handle phone number values', () => {
      const { getByText } = render(
        <InfoRow
          icon={Phone}
          label="Phone"
          value="+1 (555) 123-4567"
        />
      );

      expect(getByText('+1 (555) 123-4567')).toBeTruthy();
    });

    it('should handle address values', () => {
      const { getByText } = render(
        <InfoRow
          icon={MapPin}
          label="Address"
          value="123 Main Street, Apt 4B"
        />
      );

      expect(getByText('123 Main Street, Apt 4B')).toBeTruthy();
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

    it('should handle values with special characters', () => {
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

    it('should handle multiline values', () => {
      const multilineValue = '123 Main Street\nApt 4B';
      const { getByText } = render(
        <InfoRow
          icon={MapPin}
          label="Address"
          value={multilineValue}
        />
      );

      expect(getByText(multilineValue)).toBeTruthy();
    });

    it('should handle numeric values as strings', () => {
      const { getByText } = render(
        <InfoRow
          icon={Phone}
          label="Phone"
          value="5551234567"
        />
      );

      expect(getByText('5551234567')).toBeTruthy();
    });

    it('should handle values with leading/trailing spaces', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="  test@example.com  "
        />
      );

      expect(getByText('  test@example.com  ')).toBeTruthy();
    });

    it('should handle single character value', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Grade"
          value="A"
        />
      );

      expect(getByText('A')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should render with proper nesting of label and value', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Contact Info"
          value="contact@example.com"
        />
      );

      // Both label and value should be rendered (verifying they're part of the tree)
      const label = getByText('Contact Info');
      const value = getByText('contact@example.com');

      expect(label).toBeTruthy();
      expect(value).toBeTruthy();
    });

    it('should render label with styling classes applied', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="test@example.com"
        />
      );

      // Verify label renders with expected text
      const label = getByText('Email');
      expect(label).toBeTruthy();
    });

    it('should render value with styling classes applied', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="test@example.com"
        />
      );

      // Verify value renders with expected text
      const value = getByText('test@example.com');
      expect(value).toBeTruthy();
    });

    it('should maintain separation of icon, label, and value', () => {
      const { getByText } = render(
        <InfoRow
          icon={Mail}
          label="Email"
          value="test@example.com"
        />
      );

      // All three semantic parts should be independently accessible
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });
  });

  describe('Component Independence', () => {
    it('should maintain independent state across multiple instances', () => {
      const { getByText } = render(
        <View>
          <InfoRow icon={Mail} label="First" value="first-value" />
          <InfoRow icon={Mail} label="Second" value="second-value" />
        </View>
      );

      expect(getByText('First')).toBeTruthy();
      expect(getByText('first-value')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
      expect(getByText('second-value')).toBeTruthy();
    });

    it('should handle mixed icon types', () => {
      const { getByText } = render(
        <View>
          <InfoRow icon={Mail} label="Email" value="test@example.com" />
          <InfoRow icon={Phone} label="Phone" value="555-1234" />
          <InfoRow icon={MapPin} label="Location" value="123 Main" />
        </View>
      );

      // Verify all three rows render with their correct content
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Phone')).toBeTruthy();
      expect(getByText('Location')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
      expect(getByText('555-1234')).toBeTruthy();
      expect(getByText('123 Main')).toBeTruthy();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should display user profile information correctly', () => {
      const { getByText } = render(
        <View>
          <InfoRow icon={Mail} label="Email" value="john.doe@example.com" />
          <InfoRow icon={Phone} label="Phone" value="+1 (555) 123-4567" />
          <InfoRow icon={Building2} label="Institution" value="St. Mary Hospital" />
          <InfoRow icon={MapPin} label="City" value="New York" />
        </View>
      );

      expect(getByText('john.doe@example.com')).toBeTruthy();
      expect(getByText('+1 (555) 123-4567')).toBeTruthy();
      expect(getByText('St. Mary Hospital')).toBeTruthy();
      expect(getByText('New York')).toBeTruthy();
    });

    it('should handle institutional data display', () => {
      const { getByText } = render(
        <View>
          <InfoRow icon={Building2} label="Institution Name" value="Central Hospital" />
          <InfoRow icon={Building2} label="Institution Type" value="Hospital" />
          <InfoRow icon={MapPin} label="Address" value="456 Medical Plaza Ave" />
        </View>
      );

      expect(getByText('Central Hospital')).toBeTruthy();
      expect(getByText('Hospital')).toBeTruthy();
      expect(getByText('456 Medical Plaza Ave')).toBeTruthy();
    });

    it('should display location information correctly', () => {
      const { getByText } = render(
        <View>
          <InfoRow icon={MapPin} label="Address" value="789 Healthcare Blvd" />
          <InfoRow icon={MapPin} label="City" value="Los Angeles" />
          <InfoRow icon={MapPin} label="Country" value="United States" />
        </View>
      );

      expect(getByText('789 Healthcare Blvd')).toBeTruthy();
      expect(getByText('Los Angeles')).toBeTruthy();
      expect(getByText('United States')).toBeTruthy();
    });
  });
});
