import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthLogo } from './AuthLogo';

describe('AuthLogo', () => {
  it('should render correctly', () => {
    const { getByLabelText } = render(<AuthLogo />);
    expect(getByLabelText('Logo')).toBeTruthy();
  });

  it('should render with correct image source', () => {
    const { getByLabelText } = render(<AuthLogo />);
    const image = getByLabelText('Logo');
    expect(image.props.source).toBeDefined();
  });
});
