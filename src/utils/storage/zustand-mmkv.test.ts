import { zustandStorage } from './zustand-mmkv';
import { storage } from './storage';

// Mock storage
jest.mock('./storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

describe('zustandStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('should call storage.getItem with correct key', () => {
      (storage.getItem as jest.Mock).mockReturnValue('test-value');

      const result = zustandStorage.getItem('test-key');

      expect(storage.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toBe('test-value');
    });

    it('should return null when storage returns null', () => {
      (storage.getItem as jest.Mock).mockReturnValue(null);

      const result = zustandStorage.getItem('non-existent');

      expect(result).toBeNull();
    });

    it('should handle empty string value', () => {
      (storage.getItem as jest.Mock).mockReturnValue('');

      const result = zustandStorage.getItem('empty-key');

      expect(result).toBe('');
    });
  });

  describe('setItem', () => {
    it('should call storage.setItem with correct key and value', () => {
      zustandStorage.setItem('test-key', 'test-value');

      expect(storage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should handle JSON stringified objects', () => {
      const obj = { name: 'test', value: 123 };
      const jsonString = JSON.stringify(obj);

      zustandStorage.setItem('object-key', jsonString);

      expect(storage.setItem).toHaveBeenCalledWith('object-key', jsonString);
    });

    it('should handle empty string value', () => {
      zustandStorage.setItem('empty-key', '');

      expect(storage.setItem).toHaveBeenCalledWith('empty-key', '');
    });
  });

  describe('removeItem', () => {
    it('should call storage.removeItem with correct key', () => {
      zustandStorage.removeItem('test-key');

      expect(storage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should handle removing non-existent key', () => {
      zustandStorage.removeItem('non-existent');

      expect(storage.removeItem).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('integration with Zustand persist middleware', () => {
    it('should work with typical persist middleware flow', () => {
      // Simulate persist middleware flow
      const state = { count: 5, user: { name: 'John' } };
      const stateString = JSON.stringify(state);
      const key = 'zustand-store';

      // Set state
      zustandStorage.setItem(key, stateString);
      expect(storage.setItem).toHaveBeenCalledWith(key, stateString);

      // Get state
      (storage.getItem as jest.Mock).mockReturnValue(stateString);
      const retrieved = zustandStorage.getItem(key);
      expect(retrieved).toBe(stateString);
      expect(JSON.parse(retrieved as string)).toEqual(state);

      // Remove state
      zustandStorage.removeItem(key);
      expect(storage.removeItem).toHaveBeenCalledWith(key);
    });

    it('should handle complex nested state objects', () => {
      const complexState = {
        auth: {
          token: 'abc123',
          user: {
            id: 1,
            name: 'John Doe',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        data: {
          items: [1, 2, 3],
          meta: { count: 3 },
        },
      };
      const stateString = JSON.stringify(complexState);

      zustandStorage.setItem('complex-store', stateString);
      (storage.getItem as jest.Mock).mockReturnValue(stateString);
      const retrieved = zustandStorage.getItem('complex-store');

      expect(JSON.parse(retrieved as string)).toEqual(complexState);
    });
  });
});
