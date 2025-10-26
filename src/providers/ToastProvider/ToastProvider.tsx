import React, { createContext, useContext, useCallback } from 'react';
import { useToast as useGluestackToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import type { ToastProviderProps, ToastContextValue, ToastOptions } from './types';

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const gluestackToast = useGluestackToast();

  const show = useCallback(
    ({ title, description, duration = 3000, type = 'info' }: ToastOptions) => {
      gluestackToast.show({
        placement: 'top',
        duration,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action={type}>
            <VStack space="xs">
              <ToastTitle>{title}</ToastTitle>
              {description && <ToastDescription>{description}</ToastDescription>}
            </VStack>
          </Toast>
        ),
      });
    },
    [gluestackToast]
  );

  const success = useCallback(
    (title: string, description?: string) => {
      show({ title, description, type: 'success' });
    },
    [show]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      show({ title, description, type: 'error' });
    },
    [show]
  );

  const info = useCallback(
    (title: string, description?: string) => {
      show({ title, description, type: 'info' });
    },
    [show]
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      show({ title, description, type: 'warning' });
    },
    [show]
  );

  return (
    <ToastContext.Provider value={{ show, success, error, info, warning }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
