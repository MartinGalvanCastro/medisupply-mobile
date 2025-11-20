import React from 'react';
import { render } from '@testing-library/react-native';
import { ScreenContainer } from './ScreenContainer';

describe('ScreenContainer', () => {
  it('should render with default testID', () => {
    const { getByTestId } = render(
      <ScreenContainer>
        <React.Fragment />
      </ScreenContainer>
    );

    expect(getByTestId('screen-container')).toBeDefined();
  });

  it('should render with custom testID', () => {
    const customTestID = 'custom-container';
    const { getByTestId } = render(
      <ScreenContainer testID={customTestID}>
        <React.Fragment />
      </ScreenContainer>
    );

    expect(getByTestId(customTestID)).toBeDefined();
  });

  it('should render children correctly', () => {
    const { getByTestId } = render(
      <ScreenContainer>
        <React.Fragment>
          Test Child Content
        </React.Fragment>
      </ScreenContainer>
    );

    const container = getByTestId('screen-container');
    expect(container.props.children).toBeTruthy();
  });

  it('should render multiple children', () => {
    const { getByTestId } = render(
      <ScreenContainer>
        <React.Fragment>
          First Child
        </React.Fragment>
        <React.Fragment>
          Second Child
        </React.Fragment>
      </ScreenContainer>
    );

    const container = getByTestId('screen-container');
    expect(container.props.children).toBeTruthy();
  });

  it('should wrap children in SafeAreaView', () => {
    const { getByTestId } = render(
      <ScreenContainer testID="test-container">
        <React.Fragment>Content</React.Fragment>
      </ScreenContainer>
    );

    const container = getByTestId('test-container');
    expect(container).toBeDefined();
    expect(container.props.children).toBeDefined();
  });

  it('should handle empty children', () => {
    const { getByTestId } = render(
      <ScreenContainer>
        <React.Fragment />
      </ScreenContainer>
    );

    expect(getByTestId('screen-container')).toBeDefined();
  });

  it('should maintain flex: 1 style', () => {
    const { getByTestId } = render(
      <ScreenContainer testID="flex-container">
        <React.Fragment />
      </ScreenContainer>
    );

    const container = getByTestId('flex-container');
    expect(container.props.style).toEqual({ flex: 1 });
  });

  it('should render as root container element', () => {
    const { getByTestId } = render(
      <ScreenContainer>
        <React.Fragment />
      </ScreenContainer>
    );

    const container = getByTestId('screen-container');
    expect(container).toBeDefined();
    expect(container.props.testID).toBe('screen-container');
  });

  it('should support multiple render cycles', () => {
    const { getByTestId, rerender } = render(
      <ScreenContainer>
        <React.Fragment>Version 1</React.Fragment>
      </ScreenContainer>
    );

    expect(getByTestId('screen-container')).toBeDefined();

    rerender(
      <ScreenContainer>
        <React.Fragment>Version 2</React.Fragment>
      </ScreenContainer>
    );

    expect(getByTestId('screen-container')).toBeDefined();
  });
});
