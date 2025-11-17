import React from 'react';
import { useIsMutating } from '@tanstack/react-query';
import { Modal, ModalBackdrop } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Box } from '@/components/ui/box';
import type { GlobalLoadingProviderProps } from './types';

export const GlobalLoadingProvider: React.FC<GlobalLoadingProviderProps> = ({ children }) => {
  const isMutating = useIsMutating();
  const isLoading = isMutating > 0;

  return (
    <>
      {children}
      <Modal isOpen={isLoading} onClose={() => {}} size="full">
        <ModalBackdrop className="opacity-50" />
        <Box className="flex-1 justify-center items-center" pointerEvents="none">
          <Spinner size="large" color="#ffffff" />
        </Box>
      </Modal>
    </>
  );
};
