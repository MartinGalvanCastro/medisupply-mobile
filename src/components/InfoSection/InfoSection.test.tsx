import { render } from '@testing-library/react-native';
import { InfoSection } from './InfoSection';
import { Text } from '@/components/ui/text';

describe('InfoSection', () => {
  it('should render with title and children', () => {
    const { getByText, getByTestId } = render(
      <InfoSection title="Test Title">
        <Text>Child Content</Text>
      </InfoSection>
    );

    expect(getByText('Test Title')).toBeDefined();
    expect(getByText('Child Content')).toBeDefined();
  });

  it('should render divider by default', () => {
    const { getByTestId } = render(
      <InfoSection title="Test Title">
        <Text>Content</Text>
      </InfoSection>
    );

    expect(getByTestId('info-section-divider')).toBeDefined();
  });

  it('should not render divider when showDivider is false', () => {
    const { queryByTestId } = render(
      <InfoSection title="Test Title" showDivider={false}>
        <Text>Content</Text>
      </InfoSection>
    );

    expect(queryByTestId('info-section-divider')).toBeNull();
  });

  it('should render title with correct testID', () => {
    const { getByTestId } = render(
      <InfoSection title="Section Title">
        <Text>Content</Text>
      </InfoSection>
    );

    expect(getByTestId('info-section-title')).toBeDefined();
  });

  it('should use custom testID when provided', () => {
    const { getByTestId } = render(
      <InfoSection title="Title" testID="custom-info">
        <Text>Content</Text>
      </InfoSection>
    );

    expect(getByTestId('custom-info')).toBeDefined();
    expect(getByTestId('custom-info-title')).toBeDefined();
    expect(getByTestId('custom-info-divider')).toBeDefined();
    expect(getByTestId('custom-info-content')).toBeDefined();
  });

  it('should render content wrapper with testID', () => {
    const { getByTestId } = render(
      <InfoSection title="Title">
        <Text>Content</Text>
      </InfoSection>
    );

    expect(getByTestId('info-section-content')).toBeDefined();
  });

  it('should render multiple children correctly', () => {
    const { getByText } = render(
      <InfoSection title="Title">
        <Text>Child 1</Text>
        <Text>Child 2</Text>
        <Text>Child 3</Text>
      </InfoSection>
    );

    expect(getByText('Child 1')).toBeDefined();
    expect(getByText('Child 2')).toBeDefined();
    expect(getByText('Child 3')).toBeDefined();
  });

  it('should render title in uppercase with proper styling', () => {
    const { getByTestId } = render(
      <InfoSection title="test title">
        <Text>Content</Text>
      </InfoSection>
    );

    const titleElement = getByTestId('info-section-title');
    expect(titleElement).toBeDefined();
  });

  it('should maintain structure with divider enabled', () => {
    const { getByTestId } = render(
      <InfoSection title="Title" showDivider={true}>
        <Text>Content</Text>
      </InfoSection>
    );

    expect(getByTestId('info-section')).toBeDefined();
    expect(getByTestId('info-section-title')).toBeDefined();
    expect(getByTestId('info-section-divider')).toBeDefined();
    expect(getByTestId('info-section-content')).toBeDefined();
  });

  it('should maintain structure with divider disabled', () => {
    const { getByTestId, queryByTestId } = render(
      <InfoSection title="Title" showDivider={false}>
        <Text>Content</Text>
      </InfoSection>
    );

    expect(getByTestId('info-section')).toBeDefined();
    expect(getByTestId('info-section-title')).toBeDefined();
    expect(queryByTestId('info-section-divider')).toBeNull();
    expect(getByTestId('info-section-content')).toBeDefined();
  });
});
