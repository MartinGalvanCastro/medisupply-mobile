import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ClientSelectorModal } from './ClientSelectorModal';
import { useTranslation } from '@/i18n/hooks';
import type { ClientResponse } from '@/api/generated/models/clientResponse';

jest.mock('@/i18n/hooks');

const mockTranslation = {
  t: jest.fn((key) => {
    const translations: Record<string, string> = {
      'cart.selectClient': 'Select Client',
      'common.close': 'Close',
      'clients.emptyState': 'No clients available',
    };
    return translations[key] || key;
  }),
};

jest.mocked(useTranslation).mockReturnValue(mockTranslation as any);

const createMockClient = (overrides?: Partial<ClientResponse>): ClientResponse => ({
  cliente_id: 'client-001',
  cognito_user_id: 'cognito-001',
  email: 'client@example.com',
  telefono: '1234567890',
  nombre_institucion: 'Health Institute',
  tipo_institucion: 'Hospital',
  nit: '123456789',
  direccion: '123 Main St',
  ciudad: 'Bogota',
  pais: 'Colombia',
  representante: 'John Doe',
  vendedor_asignado_id: { vendedor_id: 'seller-001' } as any,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
});

describe('ClientSelectorModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useTranslation).mockReturnValue(mockTranslation as any);
  });

  it('should render when visible=true', () => {
    const onClose = jest.fn();
    const onSelectClient = jest.fn();
    const clients: ClientResponse[] = [];

    const { getByTestId } = render(
      <ClientSelectorModal
        visible={true}
        onClose={onClose}
        clients={clients}
        onSelectClient={onSelectClient}
        testID="client-selector-modal"
      />
    );

    expect(getByTestId('client-selector-modal')).toBeDefined();
  });

  it('should not render when visible=false', () => {
    const onClose = jest.fn();
    const onSelectClient = jest.fn();
    const clients: ClientResponse[] = [];

    const { queryByTestId } = render(
      <ClientSelectorModal
        visible={false}
        onClose={onClose}
        clients={clients}
        onSelectClient={onSelectClient}
        testID="client-selector-modal"
      />
    );

    expect(queryByTestId('client-selector-modal')).toBeFalsy();
  });

  it('should display list of clients', () => {
    const onClose = jest.fn();
    const onSelectClient = jest.fn();
    const clients: ClientResponse[] = [
      createMockClient({
        cliente_id: 'client-001',
        representante: 'John Doe',
        nombre_institucion: 'Health Institute',
      }),
      createMockClient({
        cliente_id: 'client-002',
        representante: 'Jane Smith',
        nombre_institucion: 'Medical Center',
      }),
    ];

    const { getByText } = render(
      <ClientSelectorModal
        visible={true}
        onClose={onClose}
        clients={clients}
        onSelectClient={onSelectClient}
      />
    );

    expect(getByText('John Doe')).toBeDefined();
    expect(getByText('Health Institute')).toBeDefined();
    expect(getByText('Jane Smith')).toBeDefined();
    expect(getByText('Medical Center')).toBeDefined();
  });

  it('should call onSelectClient when client pressed', () => {
    const onClose = jest.fn();
    const onSelectClient = jest.fn();
    const client = createMockClient({
      cliente_id: 'client-special-123',
      representante: 'Special Client',
    });
    const clients: ClientResponse[] = [client];

    const { getByTestId } = render(
      <ClientSelectorModal
        visible={true}
        onClose={onClose}
        clients={clients}
        onSelectClient={onSelectClient}
      />
    );

    const clientOption = getByTestId('client-selector-item-0');
    fireEvent.press(clientOption);

    expect(onSelectClient).toHaveBeenCalledWith(client);
  });

  it('should call onClose when close button pressed', () => {
    const onClose = jest.fn();
    const onSelectClient = jest.fn();
    const clients: ClientResponse[] = [];

    const { getByTestId } = render(
      <ClientSelectorModal
        visible={true}
        onClose={onClose}
        clients={clients}
        onSelectClient={onSelectClient}
      />
    );

    const closeButton = getByTestId('client-selector-cancel');
    fireEvent.press(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should show empty state when no clients', () => {
    const onClose = jest.fn();
    const onSelectClient = jest.fn();
    const clients: ClientResponse[] = [];

    const { getByText } = render(
      <ClientSelectorModal
        visible={true}
        onClose={onClose}
        clients={clients}
        onSelectClient={onSelectClient}
      />
    );

    expect(getByText('No clients available')).toBeDefined();
  });

  it('should display client details: representante, nombre_institucion, ciudad', () => {
    const onClose = jest.fn();
    const onSelectClient = jest.fn();
    const client = createMockClient({
      representante: 'Maria Garcia',
      nombre_institucion: 'Central Hospital',
      ciudad: 'Medellin',
    });
    const clients: ClientResponse[] = [client];

    const { getByText } = render(
      <ClientSelectorModal
        visible={true}
        onClose={onClose}
        clients={clients}
        onSelectClient={onSelectClient}
      />
    );

    expect(getByText('Maria Garcia')).toBeDefined();
    expect(getByText('Central Hospital')).toBeDefined();
    expect(getByText('Medellin')).toBeDefined();
  });

  it('should call onClose when modal overlay press', () => {
    const onClose = jest.fn();
    const onSelectClient = jest.fn();
    const clients: ClientResponse[] = [];

    const { getByTestId } = render(
      <ClientSelectorModal
        visible={true}
        onClose={onClose}
        clients={clients}
        onSelectClient={onSelectClient}
      />
    );

    const overlayPressable = getByTestId('modal-overlay');
    fireEvent.press(overlayPressable);
    expect(onClose).toHaveBeenCalled();
  });

  it('should not call onClose when modal content press (propagation stopped)', () => {
    const onClose = jest.fn();
    const onSelectClient = jest.fn();
    const clients: ClientResponse[] = [];

    const { getByTestId } = render(
      <ClientSelectorModal
        visible={true}
        onClose={onClose}
        clients={clients}
        onSelectClient={onSelectClient}
      />
    );

    const contentPressable = getByTestId('modal-content');
    // Create a mock event with stopPropagation method
    const mockEvent = { stopPropagation: jest.fn() };
    fireEvent.press(contentPressable, mockEvent);
    // onClose should NOT be called because stopPropagation prevents it
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should handle multiple client selections in sequence', () => {
    const onClose = jest.fn();
    const onSelectClient = jest.fn();
    const client1 = createMockClient({
      cliente_id: 'client-001',
      representante: 'Client One',
    });
    const client2 = createMockClient({
      cliente_id: 'client-002',
      representante: 'Client Two',
    });
    const clients: ClientResponse[] = [client1, client2];

    const { getByTestId } = render(
      <ClientSelectorModal
        visible={true}
        onClose={onClose}
        clients={clients}
        onSelectClient={onSelectClient}
      />
    );

    // Select first client
    fireEvent.press(getByTestId('client-selector-item-0'));
    expect(onSelectClient).toHaveBeenCalledWith(client1);

    onSelectClient.mockClear();

    // Select second client
    fireEvent.press(getByTestId('client-selector-item-1'));
    expect(onSelectClient).toHaveBeenCalledWith(client2);
  });
});
