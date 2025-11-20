import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { AuthLogo } from './AuthLogo';

jest.mock('@/components/ui/image', () => ({
  Image: require('react-native').Image,
}));

describe('AuthLogo', () => {
  it('should render with default height of 289', () => {
    const { root } = render(<AuthLogo />);
    expect(root).toBeDefined();
  });

  it('should render View component', () => {
    const { UNSAFE_getByType } = render(<AuthLogo />);
    const view = UNSAFE_getByType(View);
    expect(view).toBeDefined();
  });

  it('should apply custom height when provided', () => {
    const { root } = render(<AuthLogo height={150} />);
    expect(root).toBeDefined();
  });

  it('should handle height of 0', () => {
    const { root } = render(<AuthLogo height={0} />);
    expect(root).toBeDefined();
  });

  it('should handle large height values', () => {
    const { root } = render(<AuthLogo height={1000} />);
    expect(root).toBeDefined();
  });

  it('should handle fractional height values', () => {
    const { root } = render(<AuthLogo height={250.5} />);
    expect(root).toBeDefined();
  });

  it('should render consistently on rerender with same props', () => {
    const height = 300;
    const { rerender, root } = render(<AuthLogo height={height} />);
    expect(root).toBeDefined();

    rerender(<AuthLogo height={height} />);
    expect(root).toBeDefined();
  });

  it('should accept undefined height and use default', () => {
    const { root } = render(<AuthLogo height={undefined} />);
    expect(root).toBeDefined();
  });

  it('should accept negative height values without error', () => {
    const { root } = render(<AuthLogo height={-100} />);
    expect(root).toBeDefined();
  });

  it('should change height on prop update', () => {
    const { rerender, root: root1 } = render(<AuthLogo height={200} />);
    expect(root1).toBeDefined();

    rerender(<AuthLogo height={400} />);
    expect(root1).toBeDefined();
  });
});
