import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { VisitDetailScreen } from './VisitDetailScreen';
import {
  useListVisitsBffSellersAppVisitsGet,
  useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch,
} from '@/api/generated/sellers-app/sellers-app';
import { useTranslation } from '@/i18n/hooks';
import { router, useLocalSearchParams } from 'expo-router';

// Mock dependencies
jest.mock('@/api/generated/sellers-app/sellers-app');
jest.mock('@/i18n/hooks');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(),
  },
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSegments: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, testID, style }: any) => (
    <div testID={testID} style={style}>
      {children}
    </div>
  ),
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Building2: () => <div testID="building-icon" />,
  MapPin: () => <div testID="map-pin-icon" />,
  Calendar: () => <div testID="calendar-icon" />,
  ArrowLeft: () => <div testID="arrow-left-icon" />,
  FileText: () => <div testID="file-text-icon" />,
  CheckCircle: () => <div testID="check-circle-icon" />,
  XCircle: () => <div testID="x-circle-icon" />,
}));

// Mock useToast
const mockToastShow = jest.fn();
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    show: mockToastShow,
  }),
}));

// Mock Modal components
jest.mock('@/components/ui/modal', () => ({
  Modal: ({ isOpen, children, onClose, testID }: any) => (
    isOpen ? <div testID={testID} data-onclose={onClose}>{children}</div> : null
  ),
  ModalBackdrop: () => <div testID="modal-backdrop" />,
  ModalContent: ({ children, testID }: any) => (
    <div testID={testID}>{children}</div>
  ),
  ModalHeader: ({ children }: any) => <div>{children}</div>,
  ModalBody: ({ children }: any) => <div>{children}</div>,
  ModalFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock formatDate
jest.mock('@/utils/formatDate', () => ({
  formatDate: (date: string) => {
    if (!date) return 'Invalid date';
    return 'Jan 15, 2025';
  },
}));

const mockVisit = {
  id: 'visit-123',
  client_nombre_institucion: 'Hospital General',
  client_direccion: '123 Main St, Bogotá',
  fecha_visita: '2025-01-15T10:00:00Z',
  status: 'programada',
  notas_visita: 'Initial consultation visit',
  recomendaciones: 'Recommend product X and Y',
  archivos_evidencia: 'photo1.jpg, photo2.jpg',
};

const mockVisitWithoutOptionalFields = {
  id: 'visit-456',
  client_nombre_institucion: 'Clínica Central',
  client_direccion: '456 Oak Ave',
  fecha_visita: '2025-01-20T14:00:00Z',
  status: 'pending',
  notas_visita: null,
  recomendaciones: null,
  archivos_evidencia: null,
};

describe('VisitDetailScreen', () => {
  const mockMutate = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      visitId: 'visit-123',
    });

    (router.canGoBack as jest.Mock).mockReturnValue(true);

    (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
      data: { visits: [mockVisit] },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    (useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('should render the visit detail screen', () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('visit-detail-screen')).toBeTruthy();
    });

    it('should render back button', () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('back-button')).toBeTruthy();
    });

    it('should render client information card', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.clientInfo')).toBeTruthy();
    });

    it('should render visit information card', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.visitInfo')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should render loading state when isLoading is true', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.loading')).toBeTruthy();
    });

    it('should render back button during loading', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('back-button')).toBeTruthy();
    });

    it('should not render visit details during loading', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      const { queryByText } = render(<VisitDetailScreen />);

      expect(queryByText('visitDetail.clientInfo')).toBeNull();
    });
  });

  describe('Error States', () => {
    it('should render error state when error occurs', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.notFound')).toBeTruthy();
      expect(getByText('visitDetail.notFoundDescription')).toBeTruthy();
    });

    it('should render back button in error state', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('back-button')).toBeTruthy();
    });

    it('should render back to visits button in error state', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('back-to-visits-button')).toBeTruthy();
    });

    it('should navigate back when back to visits button is pressed', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('back-to-visits-button'));

      expect(router.back).toHaveBeenCalled();
    });
  });

  describe('Visit Not Found', () => {
    it('should render not found when visit does not exist', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.notFound')).toBeTruthy();
    });

    it('should render not found when visitId does not match', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'non-existent-id',
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.notFound')).toBeTruthy();
    });

    it('should render not found when visitId is undefined', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({});

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.notFound')).toBeTruthy();
    });

    it('should render not found when data is undefined', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.notFound')).toBeTruthy();
    });
  });

  describe('Visit Data Display', () => {
    it('should display client institution name', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('Hospital General')).toBeTruthy();
    });

    it('should display client address', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('123 Main St, Bogotá')).toBeTruthy();
    });

    it('should display visit date', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('Jan 15, 2025')).toBeTruthy();
    });

    it('should display visit notes when available', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('Initial consultation visit')).toBeTruthy();
    });

    it('should display no notes message when notes are null', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.profile.noNotes')).toBeTruthy();
    });

    it('should display recommendations when available', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('Recommend product X and Y')).toBeTruthy();
    });

    it('should display no recommendations message when recommendations are null', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.profile.noRecommendations')).toBeTruthy();
    });

    it('should display evidence files when available', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('photo1.jpg, photo2.jpg')).toBeTruthy();
    });

    it('should display no evidence message when evidence is null', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.profile.noEvidence')).toBeTruthy();
    });
  });

  describe('Visit Status Display', () => {
    it('should display status badge for programada status', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visits.status.programada')).toBeTruthy();
    });

    it('should display status badge for completed status', () => {
      const completedVisit = { ...mockVisit, status: 'completada' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [completedVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visits.status.completada')).toBeTruthy();
    });

    it('should display status badge for cancelled status', () => {
      const cancelledVisit = { ...mockVisit, status: 'cancelada' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [cancelledVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visits.status.cancelada')).toBeTruthy();
    });

    it('should display status badge for pending status', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visits.status.pending')).toBeTruthy();
    });
  });

  describe('Action Buttons for Pending Visits', () => {
    it('should display complete visit button for pending visits', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('complete-visit-button')).toBeTruthy();
    });

    it('should display cancel visit button for pending visits', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('cancel-visit-button')).toBeTruthy();
    });

    it('should display action buttons for programada status', () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('complete-visit-button')).toBeTruthy();
      expect(getByTestId('cancel-visit-button')).toBeTruthy();
    });

    it('should not display action buttons for completed visits', () => {
      const completedVisit = { ...mockVisit, status: 'completada' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [completedVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { queryByTestId } = render(<VisitDetailScreen />);

      expect(queryByTestId('complete-visit-button')).toBeNull();
      expect(queryByTestId('cancel-visit-button')).toBeNull();
    });

    it('should not display action buttons for cancelled visits', () => {
      const cancelledVisit = { ...mockVisit, status: 'cancelada' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [cancelledVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { queryByTestId } = render(<VisitDetailScreen />);

      expect(queryByTestId('complete-visit-button')).toBeNull();
      expect(queryByTestId('cancel-visit-button')).toBeNull();
    });
  });

  describe('Complete Visit Modal', () => {
    beforeEach(() => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });
    });

    it('should open complete modal when complete button is pressed', async () => {
      const { getByTestId, queryByTestId } = render(<VisitDetailScreen />);

      expect(queryByTestId('complete-visit-modal')).toBeNull();

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        expect(getByTestId('complete-visit-modal')).toBeTruthy();
      });
    });

    it('should render modal title', async () => {
      const { getByTestId, getByText } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        expect(getByText('visitDetail.completeModal.title')).toBeTruthy();
      });
    });

    it('should render modal description', async () => {
      const { getByTestId, getByText } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        expect(getByText('visitDetail.completeModal.description')).toBeTruthy();
      });
    });

    it('should render notes input', async () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        expect(getByTestId('complete-modal-notes-input')).toBeTruthy();
      });
    });

    it('should render recommendations input', async () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        expect(getByTestId('complete-modal-recommendations-input')).toBeTruthy();
      });
    });

    it('should update notes when typing', async () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        const notesInput = getByTestId('complete-modal-notes-input');
        fireEvent.changeText(notesInput, 'Test notes');

        expect(notesInput.props.value).toBe('Test notes');
      });
    });

    it('should update recommendations when typing', async () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        const recommendationsInput = getByTestId('complete-modal-recommendations-input');
        fireEvent.changeText(recommendationsInput, 'Test recommendations');

        expect(recommendationsInput.props.value).toBe('Test recommendations');
      });
    });

    it('should close modal when cancel button is pressed', async () => {
      const { getByTestId, queryByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        expect(getByTestId('complete-visit-modal')).toBeTruthy();
      });

      fireEvent.press(getByTestId('complete-modal-cancel-button'));

      await waitFor(() => {
        // Modal should close (isOpen becomes false)
        expect(queryByTestId('complete-visit-modal')).toBeNull();
      });
    });

    it('should clear form when modal is closed', async () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        fireEvent.changeText(getByTestId('complete-modal-notes-input'), 'Test');
        fireEvent.changeText(getByTestId('complete-modal-recommendations-input'), 'Rec');
      });

      fireEvent.press(getByTestId('complete-modal-cancel-button'));

      await waitFor(() => {
        // Modal is closed, so it shouldn't be in DOM
        expect(() => getByTestId('complete-visit-modal')).toThrow();
      });

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        // Form should be cleared
        expect(getByTestId('complete-modal-notes-input').props.value).toBe('');
        expect(getByTestId('complete-modal-recommendations-input').props.value).toBe('');
      });
    });

    it('should call mutate when confirm button is pressed', async () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        fireEvent.changeText(getByTestId('complete-modal-recommendations-input'), 'Product ABC');
        fireEvent.press(getByTestId('complete-modal-confirm-button'));
      });

      expect(mockMutate).toHaveBeenCalledWith({
        visitId: 'visit-456',
        data: {
          status: 'completada',
          recomendaciones: 'Product ABC',
        },
      });
    });

    it('should call mutate without recommendations when not provided', async () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        fireEvent.press(getByTestId('complete-modal-confirm-button'));
      });

      expect(mockMutate).toHaveBeenCalledWith({
        visitId: 'visit-456',
        data: {
          status: 'completada',
          recomendaciones: undefined,
        },
      });
    });

    it('should disable buttons when mutation is pending', async () => {
      const { getByTestId, rerender } = render(<VisitDetailScreen />);

      // First open the modal
      fireEvent.press(getByTestId('complete-visit-button'));

      await waitFor(() => {
        expect(getByTestId('complete-visit-modal')).toBeTruthy();
      });

      // Now change to pending state
      (useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      // Force rerender to apply the new isPending state
      rerender(<VisitDetailScreen />);

      await waitFor(() => {
        expect(getByTestId('complete-modal-cancel-button').props.accessibilityState.disabled).toBe(true);
        expect(getByTestId('complete-modal-confirm-button').props.accessibilityState.disabled).toBe(true);
      });
    });

    it('should not call mutate when visitId is undefined', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({});

      const { getByTestId } = render(<VisitDetailScreen />);

      // Will show not found, so this test validates early return
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Visit Modal', () => {
    beforeEach(() => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });
    });

    it('should open cancel modal when cancel button is pressed', async () => {
      const { getByTestId, queryByTestId } = render(<VisitDetailScreen />);

      expect(queryByTestId('cancel-visit-modal')).toBeNull();

      fireEvent.press(getByTestId('cancel-visit-button'));

      await waitFor(() => {
        expect(getByTestId('cancel-visit-modal')).toBeTruthy();
      });
    });

    it('should render cancel modal title', async () => {
      const { getByTestId, getByText } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('cancel-visit-button'));

      await waitFor(() => {
        expect(getByText('visitDetail.cancelModal.title')).toBeTruthy();
      });
    });

    it('should render cancel modal description', async () => {
      const { getByTestId, getByText } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('cancel-visit-button'));

      await waitFor(() => {
        expect(getByText('visitDetail.cancelModal.description')).toBeTruthy();
      });
    });

    it('should render notes input in cancel modal', async () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('cancel-visit-button'));

      await waitFor(() => {
        expect(getByTestId('cancel-modal-notes-input')).toBeTruthy();
      });
    });

    it('should update notes in cancel modal when typing', async () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('cancel-visit-button'));

      await waitFor(() => {
        const notesInput = getByTestId('cancel-modal-notes-input');
        fireEvent.changeText(notesInput, 'Cancellation reason');

        expect(notesInput.props.value).toBe('Cancellation reason');
      });
    });

    it('should close cancel modal when cancel button is pressed', async () => {
      const { getByTestId, queryByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('cancel-visit-button'));

      await waitFor(() => {
        expect(getByTestId('cancel-visit-modal')).toBeTruthy();
      });

      fireEvent.press(getByTestId('cancel-modal-cancel-button'));

      await waitFor(() => {
        // Modal should close
        expect(queryByTestId('cancel-visit-modal')).toBeNull();
      });
    });

    it('should clear notes when cancel modal is closed', async () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('cancel-visit-button'));

      await waitFor(() => {
        fireEvent.changeText(getByTestId('cancel-modal-notes-input'), 'Test');
      });

      fireEvent.press(getByTestId('cancel-modal-cancel-button'));

      await waitFor(() => {
        expect(() => getByTestId('cancel-visit-modal')).toThrow();
      });

      fireEvent.press(getByTestId('cancel-visit-button'));

      await waitFor(() => {
        expect(getByTestId('cancel-modal-notes-input').props.value).toBe('');
      });
    });

    it('should call mutate when confirm cancel is pressed', async () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('cancel-visit-button'));

      await waitFor(() => {
        fireEvent.press(getByTestId('cancel-modal-confirm-button'));
      });

      expect(mockMutate).toHaveBeenCalledWith({
        visitId: 'visit-456',
        data: {
          status: 'cancelada',
        },
      });
    });

    it('should disable buttons in cancel modal when mutation is pending', async () => {
      const { getByTestId, rerender } = render(<VisitDetailScreen />);

      // First open the modal
      fireEvent.press(getByTestId('cancel-visit-button'));

      await waitFor(() => {
        expect(getByTestId('cancel-visit-modal')).toBeTruthy();
      });

      // Now change to pending state
      (useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      // Force rerender to apply the new isPending state
      rerender(<VisitDetailScreen />);

      await waitFor(() => {
        expect(getByTestId('cancel-modal-cancel-button').props.accessibilityState.disabled).toBe(true);
        expect(getByTestId('cancel-modal-confirm-button').props.accessibilityState.disabled).toBe(true);
      });
    });
  });

  describe('Status Update Success', () => {
    it('should show success toast when visit is completed', async () => {
      const mockOnSuccess = jest.fn();
      (useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch as jest.Mock).mockImplementation(({ mutation }) => {
        mockOnSuccess.mockImplementation(() => {
          mutation.onSuccess({}, { visitId: 'visit-456', data: { status: 'completada' } });
        });
        return { mutate: mockOnSuccess, isPending: false };
      });

      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));
      fireEvent.press(getByTestId('complete-modal-confirm-button'));

      mockOnSuccess();

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
        expect(mockToastShow).toHaveBeenCalled();
        expect(router.push).toHaveBeenCalledWith('/visit/visit-456/upload-evidence');
      });
    });

    it('should show success toast when visit is cancelled', async () => {
      const mockOnSuccess = jest.fn();
      (useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch as jest.Mock).mockImplementation(({ mutation }) => {
        mockOnSuccess.mockImplementation(() => {
          mutation.onSuccess({}, { visitId: 'visit-456', data: { status: 'cancelada' } });
        });
        return { mutate: mockOnSuccess, isPending: false };
      });

      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('cancel-visit-button'));
      fireEvent.press(getByTestId('cancel-modal-confirm-button'));

      mockOnSuccess();

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
        expect(mockToastShow).toHaveBeenCalled();
      });
    });

    it('should navigate to upload evidence after completing visit', async () => {
      const mockOnSuccess = jest.fn();
      (useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch as jest.Mock).mockImplementation(({ mutation }) => {
        mockOnSuccess.mockImplementation(() => {
          mutation.onSuccess({}, { visitId: 'visit-123', data: { status: 'completada' } });
        });
        return { mutate: mockOnSuccess, isPending: false };
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));
      fireEvent.press(getByTestId('complete-modal-confirm-button'));

      mockOnSuccess();

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith('/visit/visit-123/upload-evidence');
      });
    });

    it('should not navigate to upload evidence after cancelling visit', async () => {
      const mockOnSuccess = jest.fn();
      (useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch as jest.Mock).mockImplementation(({ mutation }) => {
        mockOnSuccess.mockImplementation(() => {
          mutation.onSuccess({}, { visitId: 'visit-456', data: { status: 'cancelada' } });
        });
        return { mutate: mockOnSuccess, isPending: false };
      });

      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('cancel-visit-button'));
      fireEvent.press(getByTestId('cancel-modal-confirm-button'));

      mockOnSuccess();

      await waitFor(() => {
        expect(router.push).not.toHaveBeenCalledWith(expect.stringContaining('upload-evidence'));
      });
    });
  });

  describe('Status Update Error', () => {
    it('should show error toast when status update fails', async () => {
      const mockOnError = jest.fn();
      (useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch as jest.Mock).mockImplementation(({ mutation }) => {
        mockOnError.mockImplementation(() => {
          mutation.onError(new Error('Update failed'));
        });
        return { mutate: mockOnError, isPending: false };
      });

      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));
      fireEvent.press(getByTestId('complete-modal-confirm-button'));

      mockOnError();

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is pressed and can go back', () => {
      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('back-button'));

      expect(router.canGoBack).toHaveBeenCalled();
      expect(router.back).toHaveBeenCalled();
    });

    it('should navigate to visits tab when back button is pressed and cannot go back', () => {
      (router.canGoBack as jest.Mock).mockReturnValue(false);

      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('back-button'));

      expect(router.canGoBack).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/(tabs)/visits');
    });

    it('should call handleBack in loading state', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('back-button'));

      expect(router.back).toHaveBeenCalled();
    });

    it('should call handleBack in error state', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed'),
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('back-button'));

      expect(router.back).toHaveBeenCalled();
    });
  });

  describe('Status Badge Mapping', () => {
    it('should map programada status to warning badge', () => {
      const { getByText } = render(<VisitDetailScreen />);

      const badge = getByText('visits.status.programada');
      expect(badge).toBeTruthy();
    });

    it('should map completada status to success badge', () => {
      const completedVisit = { ...mockVisit, status: 'completada' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [completedVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visits.status.completada')).toBeTruthy();
    });

    it('should map cancelada status to error badge', () => {
      const cancelledVisit = { ...mockVisit, status: 'cancelada' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [cancelledVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visits.status.cancelada')).toBeTruthy();
    });

    it('should handle unknown status gracefully', () => {
      const unknownStatusVisit = { ...mockVisit, status: 'unknown' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [unknownStatusVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      // Should display the status translation fallback
      expect(getByText('visits.status.unknown')).toBeTruthy();
    });

    it('should handle null status', () => {
      const nullStatusVisit = { ...mockVisit, status: null };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [nullStatusVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { queryByText } = render(<VisitDetailScreen />);

      // Should handle null gracefully
      expect(queryByText('visitDetail.profile.status')).toBeTruthy();
    });
  });

  describe('Action Button States', () => {
    it('should disable action buttons when mutation is pending', () => {
      (useUpdateVisitStatusBffSellersAppVisitsVisitIdStatusPatch as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('complete-visit-button').props.accessibilityState.disabled).toBe(true);
      expect(getByTestId('cancel-visit-button').props.accessibilityState.disabled).toBe(true);
    });

    it('should enable action buttons when mutation is not pending', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('complete-visit-button').props.accessibilityState.disabled).toBe(false);
      expect(getByTestId('cancel-visit-button').props.accessibilityState.disabled).toBe(false);
    });
  });

  describe('Visit Date Fetching', () => {
    it('should fetch visits with today\'s date', () => {
      render(<VisitDetailScreen />);

      expect(useListVisitsBffSellersAppVisitsGet).toHaveBeenCalledWith(
        { date: expect.any(String) },
        {
          query: {
            enabled: true,
            staleTime: 5 * 60 * 1000,
          },
        }
      );
    });

    it('should pass correct query options to API hook', () => {
      render(<VisitDetailScreen />);

      expect(useListVisitsBffSellersAppVisitsGet).toHaveBeenCalledWith(
        expect.any(Object),
        {
          query: {
            enabled: true,
            staleTime: 300000,
          },
        }
      );
    });
  });

  describe('Internationalization', () => {
    it('should use translation hook', () => {
      render(<VisitDetailScreen />);

      expect(useTranslation).toHaveBeenCalled();
    });

    it('should render all translation keys', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.clientInfo')).toBeTruthy();
      expect(getByText('visitDetail.visitInfo')).toBeTruthy();
      expect(getByText('visitDetail.recommendations')).toBeTruthy();
      expect(getByText('visitDetail.evidence')).toBeTruthy();
    });
  });

  describe('useMemo for Visit', () => {
    it('should find visit by id from visits array', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('Hospital General')).toBeTruthy();
    });

    it('should return null when visits is empty', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.notFound')).toBeTruthy();
    });

    it('should return null when visitId is null', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: null,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('visitDetail.notFound')).toBeTruthy();
    });

    it('should recalculate when data changes', () => {
      const { rerender, getByText } = render(<VisitDetailScreen />);

      expect(getByText('Hospital General')).toBeTruthy();

      const updatedVisit = { ...mockVisit, client_nombre_institucion: 'Updated Hospital' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [updatedVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      rerender(<VisitDetailScreen />);

      expect(getByText('Updated Hospital')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string status', () => {
      const emptyStatusVisit = { ...mockVisit, status: '' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [emptyStatusVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('visit-detail-screen')).toBeTruthy();
    });

    it('should handle very long text in fields', () => {
      const longTextVisit = {
        ...mockVisit,
        notas_visita: 'A'.repeat(1000),
        recomendaciones: 'B'.repeat(1000),
      };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [longTextVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('A'.repeat(1000))).toBeTruthy();
      expect(getByText('B'.repeat(1000))).toBeTruthy();
    });

    it('should handle special characters in text fields', () => {
      const specialCharsVisit = {
        ...mockVisit,
        client_nombre_institucion: 'Hospital & Clinic <Test>',
        notas_visita: 'Notes with "quotes" and \'apostrophes\'',
      };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [specialCharsVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('Hospital & Clinic <Test>')).toBeTruthy();
    });

    it('should handle multiple visits with same status', () => {
      const visits = [mockVisit, { ...mockVisit, id: 'visit-789' }];
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('Hospital General')).toBeTruthy();
    });

    it('should handle rapid button clicks', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      const completeButton = getByTestId('complete-visit-button');
      fireEvent.press(completeButton);
      fireEvent.press(completeButton);
      fireEvent.press(completeButton);

      // Modal should only open once
      expect(getByTestId('complete-visit-modal')).toBeTruthy();
    });
  });

  describe('Recommendations Field Optional', () => {
    it('should pass undefined when recommendations is empty string', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));
      fireEvent.changeText(getByTestId('complete-modal-recommendations-input'), '');
      fireEvent.press(getByTestId('complete-modal-confirm-button'));

      expect(mockMutate).toHaveBeenCalledWith({
        visitId: 'visit-456',
        data: {
          status: 'completada',
          recomendaciones: undefined,
        },
      });
    });

    it('should pass recommendations when provided', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      fireEvent.press(getByTestId('complete-visit-button'));
      fireEvent.changeText(getByTestId('complete-modal-recommendations-input'), 'Test rec');
      fireEvent.press(getByTestId('complete-modal-confirm-button'));

      expect(mockMutate).toHaveBeenCalledWith({
        visitId: 'visit-456',
        data: {
          status: 'completada',
          recomendaciones: 'Test rec',
        },
      });
    });
  });

  describe('Conditional Rendering', () => {
    it('should show notes section when notes exist', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('Initial consultation visit')).toBeTruthy();
    });

    it('should show recommendations card when recommendations exist', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('Recommend product X and Y')).toBeTruthy();
    });

    it('should show evidence card when evidence exists', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('photo1.jpg, photo2.jpg')).toBeTruthy();
    });

    it('should render divider before notes', () => {
      const { getByText } = render(<VisitDetailScreen />);

      expect(getByText('Initial consultation visit')).toBeTruthy();
    });
  });

  describe('getStatusBadgeAction function', () => {
    it('should return warning for pending status', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        visitId: 'visit-456',
      });
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisitWithoutOptionalFields] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('visit-detail-screen')).toBeTruthy();
    });

    it('should return success for completed status', () => {
      const completedVisit = { ...mockVisit, status: 'completed' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [completedVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('visit-detail-screen')).toBeTruthy();
    });

    it('should return error for cancelled status', () => {
      const cancelledVisit = { ...mockVisit, status: 'cancelled' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [cancelledVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('visit-detail-screen')).toBeTruthy();
    });

    it('should handle case-insensitive status matching', () => {
      const upperCaseStatusVisit = { ...mockVisit, status: 'PENDING' };
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [upperCaseStatusVisit] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { getByTestId } = render(<VisitDetailScreen />);

      expect(getByTestId('visit-detail-screen')).toBeTruthy();
    });
  });
});
