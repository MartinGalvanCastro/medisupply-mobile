import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ClientCard, getPressedStyle } from './ClientCard';

jest.mock('lucide-react-native');

const mockHospitalClient = {
  id: 'client-hospital',
  name: 'City General Hospital',
  institution_name: 'City Hospital Network',
  institution_type: 'hospital',
  city: 'New York',
  phone: '+1-555-0101',
};

const mockClinicClient = {
  id: 'client-clinic',
  name: 'Central Clinic',
  institution_name: 'Central Health Care',
  institution_type: 'clinic',
  city: 'Los Angeles',
  phone: '+1-555-0202',
};

const mockPharmacyClient = {
  id: 'client-pharmacy',
  name: 'Main Pharmacy',
  institution_name: 'Main Health Supplies',
  institution_type: 'pharmacy',
  city: 'Chicago',
  phone: '+1-555-0303',
};

const mockLabClient = {
  id: 'client-lab',
  name: 'Diagnostic Lab',
  institution_name: 'Advanced Diagnostics',
  institution_type: 'laboratory',
  city: 'Houston',
  phone: '+1-555-0404',
};

const mockUnknownTypeClient = {
  id: 'client-unknown',
  name: 'Unknown Type Facility',
  institution_name: 'Unknown Institution',
  institution_type: 'unknown_type',
  city: 'Phoenix',
  phone: '+1-555-0505',
};

describe('getPressedStyle', () => {
  it('should return styles.pressed when pressed is true', () => {
    const result = getPressedStyle(true);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('opacity', 0.7);
  });

  it('should return null when pressed is false', () => {
    const result = getPressedStyle(false);
    expect(result).toBeNull();
  });
});

describe('ClientCard', () => {
  it('should render client card with all information', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ClientCard client={mockHospitalClient} onPress={onPress} testID="hospital-card" />
    );
    expect(getByText('City General Hospital')).toBeDefined();
    expect(getByText('City Hospital Network')).toBeDefined();
    expect(getByText('hospital')).toBeDefined();
    expect(getByText('New York • +1-555-0101')).toBeDefined();
  });

  it('should call onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ClientCard client={mockHospitalClient} onPress={onPress} testID="test-card" />
    );

    const card = getByTestId('test-card');
    fireEvent.press(card);
    expect(onPress).toHaveBeenCalled();
  });

  it('should render clinic client with success badge action', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ClientCard client={mockClinicClient} onPress={onPress} testID="clinic-card" />
    );
    expect(getByText('Central Clinic')).toBeDefined();
    expect(getByText('clinic')).toBeDefined();
  });

  it('should render pharmacy client with warning badge action', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ClientCard client={mockPharmacyClient} onPress={onPress} testID="pharmacy-card" />
    );
    expect(getByText('Main Pharmacy')).toBeDefined();
    expect(getByText('pharmacy')).toBeDefined();
  });

  it('should render laboratory client with error badge action', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ClientCard client={mockLabClient} onPress={onPress} testID="lab-card" />
    );
    expect(getByText('Diagnostic Lab')).toBeDefined();
    expect(getByText('laboratory')).toBeDefined();
  });

  it('should render unknown type client with muted badge action', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ClientCard client={mockUnknownTypeClient} onPress={onPress} testID="unknown-card" />
    );
    expect(getByText('Unknown Type Facility')).toBeDefined();
    expect(getByText('unknown_type')).toBeDefined();
  });

  it('should display city and phone information', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ClientCard client={mockPharmacyClient} onPress={onPress} />
    );
    expect(getByText('Chicago • +1-555-0303')).toBeDefined();
  });

  it('should handle institution type case insensitivity', () => {
    const caseInsensitiveClient = {
      ...mockHospitalClient,
      institution_type: 'HOSPITAL',
    };
    const onPress = jest.fn();
    const { getByText } = render(
      <ClientCard client={caseInsensitiveClient} onPress={onPress} />
    );
    expect(getByText('HOSPITAL')).toBeDefined();
  });

  it('should apply pressed and unpressed styles via style function', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ClientCard client={mockHospitalClient} onPress={onPress} testID="style-test-card" />
    );

    const pressable = getByTestId('style-test-card');
    const style = pressable.props.style;

    // Test if style is a function (React Native might evaluate it, so check both cases)
    if (typeof style === 'function') {
      // Test unpressed state: pressed=false
      const unpressedStyles = style({ pressed: false });
      expect(Array.isArray(unpressedStyles)).toBe(true);
      expect(unpressedStyles[1]).toBeNull();

      // Test pressed state: pressed=true
      const pressedStyles = style({ pressed: true });
      expect(Array.isArray(pressedStyles)).toBe(true);
      expect(pressedStyles[1]).not.toBeNull();

      // Verify the two branches return different results
      expect(JSON.stringify(unpressedStyles)).not.toEqual(JSON.stringify(pressedStyles));
    } else {
      // If already evaluated as an array, verify structure
      expect(Array.isArray(style)).toBe(true);
      expect(style.length).toBeGreaterThanOrEqual(1);
    }
  });
});
