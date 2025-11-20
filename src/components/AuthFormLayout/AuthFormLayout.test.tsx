import React from 'react';
import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';
import { AuthFormLayout } from './AuthFormLayout';
import { Text } from '@/components/ui/text';

describe('AuthFormLayout', () => {
  it('should render correctly with required props', () => {
    const { getByTestId, getByText } = render(
      <AuthFormLayout title="Login">
        <Text>Login Form</Text>
      </AuthFormLayout>
    );

    expect(getByTestId('auth-form-layout')).toBeDefined();
    expect(getByTestId('auth-form-layout-header')).toBeDefined();
    expect(getByTestId('auth-form-layout-title')).toBeDefined();
    expect(getByText('Login')).toBeDefined();
    expect(getByTestId('auth-form-layout-content')).toBeDefined();
    expect(getByText('Login Form')).toBeDefined();
  });

  it('should render with custom testID', () => {
    const { getByTestId } = render(
      <AuthFormLayout title="Sign Up" testID="custom-layout">
        <Text>Form</Text>
      </AuthFormLayout>
    );

    expect(getByTestId('custom-layout')).toBeDefined();
    expect(getByTestId('custom-layout-header')).toBeDefined();
    expect(getByTestId('custom-layout-title')).toBeDefined();
    expect(getByTestId('custom-layout-content')).toBeDefined();
    expect(getByTestId('custom-layout-scroll-view')).toBeDefined();
  });

  it('should render subtitle when provided', () => {
    const { getByTestId, getByText } = render(
      <AuthFormLayout title="Login" subtitle="Enter your credentials">
        <Text>Form</Text>
      </AuthFormLayout>
    );

    expect(getByTestId('auth-form-layout-subtitle')).toBeDefined();
    expect(getByText('Enter your credentials')).toBeDefined();
  });

  it('should not render subtitle when not provided', () => {
    const { queryByTestId } = render(
      <AuthFormLayout title="Login">
        <Text>Form</Text>
      </AuthFormLayout>
    );

    expect(queryByTestId('auth-form-layout-subtitle')).toBeFalsy();
  });

  it('should render footer when provided', () => {
    const { getByTestId, getByText } = render(
      <AuthFormLayout
        title="Login"
        footer={<Text>Forgot Password?</Text>}
      >
        <Text>Form</Text>
      </AuthFormLayout>
    );

    expect(getByTestId('auth-form-layout-footer')).toBeDefined();
    expect(getByText('Forgot Password?')).toBeDefined();
  });

  it('should not render footer when not provided', () => {
    const { queryByTestId } = render(
      <AuthFormLayout title="Login">
        <Text>Form</Text>
      </AuthFormLayout>
    );

    expect(queryByTestId('auth-form-layout-footer')).toBeFalsy();
  });

  it('should use padding keyboard behavior on iOS', () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', {
      value: 'ios',
      writable: true,
    });

    const { getByTestId } = render(
      <AuthFormLayout title="Login">
        <Text>Content</Text>
      </AuthFormLayout>
    );

    expect(getByTestId('auth-form-layout')).toBeDefined();

    Object.defineProperty(Platform, 'OS', {
      value: originalOS,
      writable: true,
    });
  });

  it('should use height keyboard behavior on Android', () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', {
      value: 'android',
      writable: true,
    });

    const { getByTestId } = render(
      <AuthFormLayout title="Login">
        <Text>Content</Text>
      </AuthFormLayout>
    );

    expect(getByTestId('auth-form-layout')).toBeDefined();

    Object.defineProperty(Platform, 'OS', {
      value: originalOS,
      writable: true,
    });
  });

  it('should render all sections when provided', () => {
    const { getByTestId, getByText } = render(
      <AuthFormLayout
        title="Complete Form"
        subtitle="Fill this out"
        footer={<Text>Footer text</Text>}
      >
        <Text>Body content</Text>
      </AuthFormLayout>
    );

    expect(getByTestId('auth-form-layout-header')).toBeDefined();
    expect(getByTestId('auth-form-layout-content')).toBeDefined();
    expect(getByTestId('auth-form-layout-footer')).toBeDefined();
    expect(getByText('Complete Form')).toBeDefined();
    expect(getByText('Fill this out')).toBeDefined();
    expect(getByText('Body content')).toBeDefined();
    expect(getByText('Footer text')).toBeDefined();
  });
});
