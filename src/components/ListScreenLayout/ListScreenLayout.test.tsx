import { render } from '@testing-library/react-native';
import { ListScreenLayout } from './ListScreenLayout';
import { Text } from '@/components/ui/text';

// Mock SafeAreaView to simplify testing
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: jest.fn(({ children, testID, ...props }: any) => (
    <div testID={testID} {...props}>
      {children}
    </div>
  )),
}));

describe('ListScreenLayout', () => {
  it('should render title and children', () => {
    const { getByText } = render(
      <ListScreenLayout title="Screen Title">
        <Text>Screen Content</Text>
      </ListScreenLayout>
    );

    expect(getByText('Screen Title')).toBeDefined();
    expect(getByText('Screen Content')).toBeDefined();
  });

  it('should render title with correct testID', () => {
    const { getByTestId } = render(
      <ListScreenLayout title="Test Title">
        <Text>Content</Text>
      </ListScreenLayout>
    );

    expect(getByTestId('list-screen-layout-title')).toBeDefined();
  });

  it('should render main container with default testID', () => {
    const { getByTestId } = render(
      <ListScreenLayout title="Title">
        <Text>Content</Text>
      </ListScreenLayout>
    );

    expect(getByTestId('list-screen-layout')).toBeDefined();
  });

  it('should use custom testID when provided', () => {
    const { getByTestId } = render(
      <ListScreenLayout title="Title" testID="custom-layout">
        <Text>Content</Text>
      </ListScreenLayout>
    );

    expect(getByTestId('custom-layout')).toBeDefined();
    expect(getByTestId('custom-layout-title')).toBeDefined();
    expect(getByTestId('custom-layout-content')).toBeDefined();
  });

  it('should render content wrapper with testID', () => {
    const { getByTestId } = render(
      <ListScreenLayout title="Title">
        <Text>Content</Text>
      </ListScreenLayout>
    );

    expect(getByTestId('list-screen-layout-content')).toBeDefined();
  });

  it('should render multiple children correctly', () => {
    const { getByText } = render(
      <ListScreenLayout title="Title">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </ListScreenLayout>
    );

    expect(getByText('Item 1')).toBeDefined();
    expect(getByText('Item 2')).toBeDefined();
    expect(getByText('Item 3')).toBeDefined();
  });

  it('should maintain component hierarchy', () => {
    const { getByTestId } = render(
      <ListScreenLayout title="Title">
        <Text>Content</Text>
      </ListScreenLayout>
    );

    expect(getByTestId('list-screen-layout')).toBeDefined();
    expect(getByTestId('list-screen-layout-title')).toBeDefined();
    expect(getByTestId('list-screen-layout-content')).toBeDefined();
  });

  it('should render with complex children structure', () => {
    const { getByText } = render(
      <ListScreenLayout title="List Screen">
        <Text>Header</Text>
        <Text>Content Line 1</Text>
        <Text>Content Line 2</Text>
        <Text>Footer</Text>
      </ListScreenLayout>
    );

    expect(getByText('Header')).toBeDefined();
    expect(getByText('Content Line 1')).toBeDefined();
    expect(getByText('Content Line 2')).toBeDefined();
    expect(getByText('Footer')).toBeDefined();
  });

  it('should support different title values', () => {
    const { getByText, rerender } = render(
      <ListScreenLayout title="Title One">
        <Text>Content</Text>
      </ListScreenLayout>
    );

    expect(getByText('Title One')).toBeDefined();

    rerender(
      <ListScreenLayout title="Title Two">
        <Text>Content</Text>
      </ListScreenLayout>
    );

    expect(getByText('Title Two')).toBeDefined();
  });

  it('should render SafeAreaView wrapper', () => {
    const { getByTestId } = render(
      <ListScreenLayout title="Title">
        <Text>Content</Text>
      </ListScreenLayout>
    );

    const container = getByTestId('list-screen-layout');
    expect(container).toBeDefined();
  });
});
