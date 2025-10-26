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
  });
});
