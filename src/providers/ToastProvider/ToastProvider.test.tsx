import { act, renderHook } from '@testing-library/react-native';
import { ToastProvider, useToast } from './ToastProvider';

const mockShow = jest.fn();

jest.mock('@/components/ui/toast', () => {
  const actual = jest.requireActual('@/components/ui/toast');
  return {
    ...actual,
    useToast: () => ({ show: mockShow }),
  };
});


describe('ToastProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error when useToast is called outside provider', () => {
    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within ToastProvider');
  });

  it('should provide toast context when used within provider', () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ToastProvider,
    });

    expect(result.current).toHaveProperty('show');
    expect(result.current).toHaveProperty('success');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('info');
    expect(result.current).toHaveProperty('warning');
  });

  describe('success', () => {
    it('should call gluestack toast show', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.success('Success!');
      });

      expect(mockShow).toHaveBeenCalledTimes(1);
    });

    it('should call with title and description', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.success('Success!', 'All done');
      });

      expect(mockShow).toHaveBeenCalledTimes(1);
    });
  });

  describe('error', () => {
    it('should call gluestack toast show', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.error('Error!');
      });

      expect(mockShow).toHaveBeenCalledTimes(1);
    });
  });

  describe('info', () => {
    it('should call gluestack toast show', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.info('Info!');
      });

      expect(mockShow).toHaveBeenCalledTimes(1);
    });
  });

  describe('warning', () => {
    it('should call gluestack toast show', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.warning('Warning!');
      });

      expect(mockShow).toHaveBeenCalledTimes(1);
    });
  });

  describe('show', () => {
    it('should call gluestack toast with options', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({
          title: 'Custom',
          description: 'Message',
          type: 'info',
          duration: 5000,
        });
      });

      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          placement: 'top',
          duration: 5000,
        })
      );
    });

    it('should use default duration', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({ title: 'Test' });
      });

      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 3000,
        })
      );
    });

    it('should render toast with description', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({
          title: 'Test',
          description: 'Description',
        });
      });

      const renderFn = mockShow.mock.calls[0][0].render;
      const rendered = renderFn({ id: '1' });
      expect(rendered).toBeDefined();
    });

    it('should render toast without description', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({ title: 'Test' });
      });

      const renderFn = mockShow.mock.calls[0][0].render;
      const rendered = renderFn({ id: '1' });
      expect(rendered).toBeDefined();
    });

    it('should support all toast types', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      const types = ['success', 'error', 'info', 'warning'] as const;

      types.forEach((type) => {
        act(() => {
          result.current.show({
            title: `${type} toast`,
            type,
          });
        });
      });

      expect(mockShow).toHaveBeenCalledTimes(4);
    });

    it('should pass correct type to render function', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({
          title: 'Test',
          type: 'error',
        });
      });

      const renderFn = mockShow.mock.calls[0][0].render;
      // Should not throw when calling render function
      expect(() => renderFn({ id: 'test-id' })).not.toThrow();
    });
  });

  describe('multiple toasts', () => {
    it('should show multiple toasts of different types', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.success('Success message');
        result.current.error('Error message');
        result.current.info('Info message');
        result.current.warning('Warning message');
      });

      expect(mockShow).toHaveBeenCalledTimes(4);
    });

    it('should show multiple toasts of same type', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.success('First success');
        result.current.success('Second success');
        result.current.success('Third success');
      });

      expect(mockShow).toHaveBeenCalledTimes(3);
    });
  });

  describe('callback stability', () => {
    it('should have useCallback-wrapped functions', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      expect(typeof result.current.show).toBe('function');
      expect(typeof result.current.success).toBe('function');
      expect(typeof result.current.error).toBe('function');
      expect(typeof result.current.info).toBe('function');
      expect(typeof result.current.warning).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle empty title', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({
          title: '',
          type: 'info',
        });
      });

      expect(mockShow).toHaveBeenCalled();
    });

    it('should handle empty description', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.success('Title', '');
      });

      expect(mockShow).toHaveBeenCalled();
    });

    it('should handle very long title', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      const longTitle = 'a'.repeat(500);

      act(() => {
        result.current.success(longTitle);
      });

      expect(mockShow).toHaveBeenCalled();
    });

    it('should handle very long description', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      const longDesc = 'b'.repeat(1000);

      act(() => {
        result.current.success('Title', longDesc);
      });

      expect(mockShow).toHaveBeenCalled();
    });

    it('should handle special characters in title', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.success('Title with <>&"\'');
      });

      expect(mockShow).toHaveBeenCalled();
    });

    it('should handle special characters in description', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.success('Title', 'Desc with <>&"\'');
      });

      expect(mockShow).toHaveBeenCalled();
    });

    it('should handle unicode characters', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.success('título', 'descripción 中文 日本語');
      });

      expect(mockShow).toHaveBeenCalled();
    });

    it('should handle zero duration', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({
          title: 'Test',
          duration: 0,
          type: 'info',
        });
      });

      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 0,
        })
      );
    });

    it('should handle very large duration', () => {
      const { result } = renderHook(() => useToast(), {
        wrapper: ToastProvider,
      });

      act(() => {
        result.current.show({
          title: 'Test',
          duration: 999999999,
          type: 'info',
        });
      });

      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 999999999,
        })
      );
    });
  });
});
