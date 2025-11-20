import React from 'react';
import { renderHook, render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useToast as useGluestackToast } from '@/components/ui/toast';
import { ToastProvider, useToast } from './ToastProvider';

jest.mock('@/components/ui/toast', () => ({
  ...jest.requireActual('@/components/ui/toast'),
  useToast: jest.fn(),
}));

describe('ToastProvider', () => {
  const mockShow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useGluestackToast as jest.Mock).mockReturnValue({ show: mockShow });
  });

  describe('useToast hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useToast());
      }).toThrow('useToast must be used within ToastProvider');
    });
  });

  describe('show method', () => {
    it('should call gluestack toast.show with correct parameters including description', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({
          title: 'Test Title',
          description: 'Test Description',
          type: 'error',
          duration: 5000,
        });
      });

      expect(mockShow).toHaveBeenCalledWith({
        placement: 'top',
        duration: 5000,
        render: expect.any(Function),
      });

      const renderFn = mockShow.mock.calls[0][0].render;
      const rendered = renderFn({ id: '123' });
      expect(rendered.props.nativeID).toBe('toast-123');
      expect(rendered.props.action).toBe('error');
    });

    it('should use default duration and type when not provided', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({ title: 'Test' });
      });

      expect(mockShow).toHaveBeenCalledWith({
        placement: 'top',
        duration: 3000,
        render: expect.any(Function),
      });

      const renderFn = mockShow.mock.calls[0][0].render;
      const rendered = renderFn({ id: 'abc' });
      expect(rendered.props.action).toBe('info');
    });

    it('should handle toast without description gracefully', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({
          title: 'Title Only',
          type: 'success',
          duration: 2000,
        });
      });

      expect(mockShow).toHaveBeenCalledTimes(1);
      const renderFn = mockShow.mock.calls[0][0].render;
      const rendered = renderFn({ id: 'test' });
      expect(rendered.props.action).toBe('success');
    });

    it('should use correct placement in all toast calls', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({ title: 'First' });
        result.current.show({ title: 'Second' });
      });

      expect(mockShow).toHaveBeenCalledTimes(2);
      expect(mockShow.mock.calls[0][0].placement).toBe('top');
      expect(mockShow.mock.calls[1][0].placement).toBe('top');
    });
  });

  describe('convenience methods', () => {
    it('should call show with success type', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.success('Success!', 'Details');
      });

      expect(mockShow).toHaveBeenCalledTimes(1);
      expect(mockShow).toHaveBeenCalledWith({
        placement: 'top',
        duration: 3000,
        render: expect.any(Function),
      });

      const renderFn = mockShow.mock.calls[0][0].render;
      const rendered = renderFn({ id: '1' });
      expect(rendered.props.action).toBe('success');
    });

    it('should call show with error type', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.error('Error!');
      });

      expect(mockShow).toHaveBeenCalledTimes(1);
      expect(mockShow).toHaveBeenCalledWith({
        placement: 'top',
        duration: 3000,
        render: expect.any(Function),
      });

      const renderFn = mockShow.mock.calls[0][0].render;
      const rendered = renderFn({ id: '1' });
      expect(rendered.props.action).toBe('error');
    });

    it('should call show with info type', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.info('Info!', 'More info');
      });

      expect(mockShow).toHaveBeenCalledTimes(1);
      expect(mockShow).toHaveBeenCalledWith({
        placement: 'top',
        duration: 3000,
        render: expect.any(Function),
      });

      const renderFn = mockShow.mock.calls[0][0].render;
      const rendered = renderFn({ id: '1' });
      expect(rendered.props.action).toBe('info');
    });

    it('should call show with warning type', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.warning('Warning!');
      });

      expect(mockShow).toHaveBeenCalledTimes(1);
      expect(mockShow).toHaveBeenCalledWith({
        placement: 'top',
        duration: 3000,
        render: expect.any(Function),
      });

      const renderFn = mockShow.mock.calls[0][0].render;
      const rendered = renderFn({ id: '1' });
      expect(rendered.props.action).toBe('warning');
    });
  });

  describe('Provider behavior', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <ToastProvider>
          <Text>Test Child</Text>
        </ToastProvider>
      );

      expect(getByText('Test Child')).toBeDefined();
    });
  });
});
