import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VisitDetailScreen } from './VisitDetailScreen';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useTranslation } from '@/i18n/hooks';
import { useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch } from '@/api/generated/sellers-app/sellers-app';
import { useToast } from '@/components/ui/toast';
import { router, useLocalSearchParams } from 'expo-router';

jest.mock('@/store/useNavigationStore');
jest.mock('@/i18n/hooks');
jest.mock('@/api/generated/sellers-app/sellers-app');
jest.mock('@/components/ui/toast');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/components/ui/modal', () => ({
  Modal: ({ children, isOpen }: any) => isOpen ? children : null,
  ModalBackdrop: () => null,
  ModalContent: jest.fn(({ children, testID }: any) => {
    const View = require('react-native').View;
    return <View testID={testID}>{children}</View>;
  }),
  ModalHeader: ({ children }: any) => <div>{children}</div>,
  ModalBody: ({ children }: any) => <div>{children}</div>,
  ModalFooter: ({ children }: any) => <div>{children}</div>,
}));

const mockUseNavigationStore = useNavigationStore as jest.MockedFunction<
  typeof useNavigationStore
>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseUpdateVisitStatus = useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch as jest.MockedFunction<
  typeof useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch
>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const mockVisit = {
  id: '1',
  client_nombre_institucion: 'Test Institution',
  client_direccion: '123 Main St',
  fecha_visita: '2025-11-20T10:00:00Z',
  status: 'programada',
  notas_visita: 'Test notes',
  recomendaciones: 'Test recommendations',
  archivos_evidencia: 'file.pdf',
};

const mockVisitWithoutOptionalFields = {
  id: '2',
  client_nombre_institucion: 'Another Institution',
  client_direccion: '456 Oak Ave',
  fecha_visita: '2025-11-21T14:00:00Z',
  status: 'programada',
  notas_visita: null,
  recomendaciones: null,
  archivos_evidencia: null,
};

const createWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('VisitDetailScreen', () => {
  let mockQueryClient: QueryClient;
  let mockUpdateCurrentVisitStatus: jest.Mock;
  let mockClearCurrentVisit: jest.Mock;
  let mockToast: any;
  let mockMutate: jest.Mock;
  let mockOnSuccess: any;
  let mockOnError: any;

  beforeEach(() => {
    mockQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    jest.clearAllMocks();

    mockUpdateCurrentVisitStatus = jest.fn();
    mockClearCurrentVisit = jest.fn();

    mockUseTranslation.mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'visitDetail.notFound': 'Visit not found',
          'visitDetail.notFoundDescription': 'The visit you are looking for does not exist',
          'visitDetail.clientInfo': 'Client Information',
          'visitDetail.profile.institution': 'Institution',
          'visitDetail.profile.client': 'Location',
          'visitDetail.visitInfo': 'Visit Information',
          'visitDetail.profile.date': 'Date',
          'visitDetail.profile.status': 'Status',
          'visitDetail.profile.notes': 'Notes',
          'visitDetail.profile.noNotes': 'No notes provided',
          'visitDetail.recommendations': 'Recommendations',
          'visitDetail.profile.noRecommendations': 'No recommendations',
          'visitDetail.evidence': 'Evidence Files',
          'visitDetail.profile.noEvidence': 'No evidence files',
          'visitDetail.completeVisit': 'Complete Visit',
          'visitDetail.cancelVisit': 'Cancel Visit',
          'visitDetail.visitCompleted': 'Visit completed successfully',
          'visitDetail.visitCancelled': 'Visit cancelled',
          'visitDetail.updateStatusError': 'Failed to update visit status',
          'visitDetail.completeModal.title': 'Complete Visit',
          'visitDetail.completeModal.description': 'Are you sure you want to complete this visit?',
          'visitDetail.completeModal.notesLabel': 'Notes',
          'visitDetail.completeModal.notesPlaceholder': 'Enter notes',
          'visitDetail.completeModal.recommendationsLabel': 'Recommendations',
          'visitDetail.completeModal.recommendationsPlaceholder': 'Enter recommendations',
          'visitDetail.completeModal.cancelButton': 'Cancel',
          'visitDetail.completeModal.confirmButton': 'Complete',
          'visitDetail.cancelModal.title': 'Cancel Visit',
          'visitDetail.cancelModal.description': 'Are you sure you want to cancel this visit?',
          'visitDetail.cancelModal.notesLabel': 'Reason',
          'visitDetail.cancelModal.notesPlaceholder': 'Enter reason',
          'visitDetail.cancelModal.cancelButton': 'Cancel',
          'visitDetail.cancelModal.confirmButton': 'Cancel Visit',
          'common.back': 'Back',
          'visits.status.programada': 'Scheduled',
          'visits.status.completada': 'Completed',
          'visits.status.cancelada': 'Cancelled',
        };
        return translations[key] || key;
      },
      i18n: {} as any,
    });

    mockUseNavigationStore.mockImplementation((selector) => {
      const state = {
        currentVisit: mockVisit,
        updateCurrentVisitStatus: mockUpdateCurrentVisitStatus,
        clearCurrentVisit: mockClearCurrentVisit,
      } as any;
      return selector(state);
    });

    mockToast = {
      show: jest.fn(),
    };
    mockUseToast.mockReturnValue(mockToast);

    mockMutate = jest.fn((variables) => {
      if (mockOnSuccess) {
        mockOnSuccess({ status: variables.data.status }, variables);
      }
    });

    mockUseUpdateVisitStatus.mockImplementation((options?: any) => {
      mockOnSuccess = options?.mutation?.onSuccess;
      mockOnError = options?.mutation?.onError;
      return {
        mutate: mockMutate,
        isPending: false,
      } as any;
    });

    (useLocalSearchParams as jest.Mock).mockReturnValue({ visitId: '1' } as any);
    (router.canGoBack as jest.Mock).mockReturnValue(true);
    (router.back as jest.Mock).mockImplementation(() => {});
    (router.replace as jest.Mock).mockResolvedValue(true);
    (router.push as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render visit detail when visit is available', () => {
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });
    expect(screen.getByTestId('visit-detail-screen')).toBeDefined();
    expect(screen.getByTestId('back-button')).toBeDefined();
    expect(screen.getByText('Test Institution')).toBeDefined();
    expect(screen.getByText('123 Main St')).toBeDefined();
  });

  it('should render not found state when visit is null', () => {
    mockUseNavigationStore.mockImplementation((selector) => {
      const state = {
        currentVisit: null,
        updateCurrentVisitStatus: mockUpdateCurrentVisitStatus,
        clearCurrentVisit: mockClearCurrentVisit,
      } as any;
      return selector(state);
    });

    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });
    expect(screen.getByTestId('visit-detail-screen')).toBeDefined();
    expect(screen.getByTestId('back-to-visits-button')).toBeDefined();
  });

  it('should display all visit information correctly', () => {
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    expect(screen.getByText('Test notes')).toBeDefined();
    expect(screen.getByText('Test recommendations')).toBeDefined();
    expect(screen.getByText('file.pdf')).toBeDefined();
  });

  it('should display no data messages when fields are missing', () => {
    mockUseNavigationStore.mockImplementation((selector) => {
      const state = {
        currentVisit: mockVisitWithoutOptionalFields,
        updateCurrentVisitStatus: mockUpdateCurrentVisitStatus,
        clearCurrentVisit: mockClearCurrentVisit,
      } as any;
      return selector(state);
    });

    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    expect(screen.getByText('No notes provided')).toBeDefined();
    expect(screen.getByText('No recommendations')).toBeDefined();
    expect(screen.getByText('No evidence files')).toBeDefined();
  });

  it('should show action buttons only when visit status is pending', () => {
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });
    expect(screen.getByTestId('complete-visit-button')).toBeDefined();
    expect(screen.getByTestId('cancel-visit-button')).toBeDefined();

    const completedVisit = { ...mockVisit, status: 'completada' };
    mockUseNavigationStore.mockImplementation((selector) => {
      const state = {
        currentVisit: completedVisit,
        updateCurrentVisitStatus: mockUpdateCurrentVisitStatus,
        clearCurrentVisit: mockClearCurrentVisit,
      } as any;
      return selector(state);
    });

    const { rerender } = render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });
    expect(screen.queryByTestId('complete-visit-button')).toBeNull();
    expect(screen.queryByTestId('cancel-visit-button')).toBeNull();
  });

  it('should handle complete visit mutation with/without recommendations', async () => {
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    mockMutate.mockClear();

    const completeButton = screen.getByTestId('complete-visit-button');
    await act(async () => {
      fireEvent.press(completeButton);
    });

    const confirmButton = screen.getByTestId('complete-modal-confirm-button');
    await act(async () => {
      fireEvent.press(confirmButton);
    });

    // Verify mutate was called with visitId (covers line 166-172)
    expect(mockMutate).toHaveBeenCalledWith({
      visitId: '1',
      data: {
        status: 'completada',
        recomendaciones: undefined,
      },
    });

    // Also verify the success callback behavior
    if (mockOnSuccess) {
      mockOnSuccess(
        { status: 'completada' },
        {
          visitId: '1',
          data: { status: 'completada', recomendaciones: 'Test rec' },
        }
      );
    }

    expect(mockUpdateCurrentVisitStatus).toHaveBeenCalledWith('completada', 'Test rec');
    expect(mockToast.show).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith('/visit/1/upload-evidence');
  });

  it('should handle cancel visit mutation, call mutate, and invalidate cache', async () => {
    const invalidateQueriesSpy = jest.spyOn(mockQueryClient, 'invalidateQueries');
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    mockMutate.mockClear();

    const cancelButton = screen.getByTestId('cancel-visit-button');
    await act(async () => {
      fireEvent.press(cancelButton);
    });

    const confirmButton = screen.getByTestId('cancel-modal-confirm-button');
    await act(async () => {
      fireEvent.press(confirmButton);
    });

    // Verify mutate was called with visitId (covers line 178-183)
    expect(mockMutate).toHaveBeenCalledWith({
      visitId: '1',
      data: {
        status: 'cancelada',
      },
    });

    // Also verify the success callback behavior
    if (mockOnSuccess) {
      mockOnSuccess(
        { status: 'cancelada' },
        {
          visitId: '1',
          data: { status: 'cancelada' },
        }
      );
    }

    expect(mockUpdateCurrentVisitStatus).toHaveBeenCalledWith('cancelada', undefined);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['visits'] });
    expect(mockToast.show).toHaveBeenCalled();
  });

  it('should execute else if branch for cancelada status (line 106)', () => {
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    mockToast.show.mockClear();

    if (mockOnSuccess) {
      mockOnSuccess(
        { status: 'cancelada' },
        {
          visitId: '1',
          data: { status: 'cancelada' },
        }
      );
    }

    expect(mockToast.show).toHaveBeenCalled();
    const toastCall = mockToast.show.mock.calls[mockToast.show.mock.calls.length - 1];
    expect(toastCall[0].placement).toBe('top');
    const renderFn = toastCall[0].render;
    const jsxResult = renderFn({ id: 'cancel-else-if' });
    expect(jsxResult).toBeDefined();
    expect(jsxResult.props.children).toBeDefined();
  });

  it('should handle status values other than completada or cancelada', () => {
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    if (mockOnSuccess) {
      mockOnSuccess(
        { status: 'other_status' },
        {
          visitId: '1',
          data: { status: 'other_status' },
        }
      );
    }

    expect(mockUpdateCurrentVisitStatus).toHaveBeenCalledWith('other_status', undefined);
  });

  it('should handle mutation errors with error toast', () => {
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    mockToast.show.mockClear();

    if (mockOnError && typeof mockOnError === 'function') {
      mockOnError();
    }

    expect(mockToast.show).toHaveBeenCalled();
    const toastCall = mockToast.show.mock.calls[0];
    const renderFn = toastCall[0].render;
    const jsxResult = renderFn({ id: 'error-test' });
    expect(jsxResult).toBeDefined();
  });

  it('should handle back navigation and clear visit', () => {
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    const backButton = screen.getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockClearCurrentVisit).toHaveBeenCalled();
    expect(router.back).toHaveBeenCalled();
  });

  it('should navigate to visits screen when router cannot go back', () => {
    (router.canGoBack as jest.Mock).mockReturnValue(false);

    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    const backButton = screen.getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockClearCurrentVisit).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/visits');
  });

  it('should prevent complete mutation when visitId is missing (line 164)', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({} as any);

    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    const completeButton = screen.getByTestId('complete-visit-button');
    fireEvent.press(completeButton);

    const confirmButton = screen.getByTestId('complete-modal-confirm-button');
    fireEvent.press(confirmButton);

    // Verify mutate was not called due to guard clause on line 164
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should prevent cancel mutation when visitId is missing (line 176)', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({} as any);

    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    const cancelButton = screen.getByTestId('cancel-visit-button');
    fireEvent.press(cancelButton);

    const confirmButton = screen.getByTestId('cancel-modal-confirm-button');
    fireEvent.press(confirmButton);

    // Verify mutate was not called due to guard clause on line 176
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should open and close complete visit modal', async () => {
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    const completeButton = screen.getByTestId('complete-visit-button');
    await act(async () => {
      fireEvent.press(completeButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('complete-visit-modal')).toBeDefined();
    });

    const modalCancelButton = screen.getByTestId('complete-modal-cancel-button');
    await act(async () => {
      fireEvent.press(modalCancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('complete-visit-modal')).toBeNull();
    });
  });

  it('should open and close cancel visit modal', async () => {
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    const cancelButton = screen.getByTestId('cancel-visit-button');
    await act(async () => {
      fireEvent.press(cancelButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('cancel-visit-modal')).toBeDefined();
    });

    const modalCancelButton = screen.getByTestId('cancel-modal-cancel-button');
    await act(async () => {
      fireEvent.press(modalCancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('cancel-visit-modal')).toBeNull();
    });
  });

  it('should recognize visit status in any case (uppercase/lowercase)', () => {
    const uppercaseVisit = { ...mockVisit, status: 'PROGRAMADA' };
    mockUseNavigationStore.mockImplementation((selector) => {
      const state = {
        currentVisit: uppercaseVisit,
        updateCurrentVisitStatus: mockUpdateCurrentVisitStatus,
        clearCurrentVisit: mockClearCurrentVisit,
      } as any;
      return selector(state);
    });

    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    expect(screen.getByTestId('complete-visit-button')).toBeDefined();
    expect(screen.getByTestId('cancel-visit-button')).toBeDefined();
  });

  it('should execute complete visit toast render function', () => {
    render(<VisitDetailScreen />, { wrapper: createWrapper(mockQueryClient) });

    mockToast.show.mockClear();

    if (mockOnSuccess) {
      mockOnSuccess(
        { status: 'completada' },
        {
          visitId: '1',
          data: { status: 'completada', recomendaciones: undefined },
        }
      );
    }

    expect(mockToast.show).toHaveBeenCalled();
    const toastCall = mockToast.show.mock.calls[0];
    const renderFn = toastCall[0].render;
    const jsxResult = renderFn({ id: 'completion-test' });

    expect(jsxResult).toBeDefined();
    expect(jsxResult.type).toBeDefined();
  });
});
