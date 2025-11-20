import { renderHook, act } from '@testing-library/react-native';
import { useNavigationStore } from './useNavigationStore';
import type { VisitResponseBFF } from '@/api/generated/models/visitResponseBFF';
import type { ClientResponse } from '@/api/generated/models/clientResponse';

describe('useNavigationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useNavigationStore());
    act(() => {
      result.current.clearAll();
    });
  });

  describe('Initial State', () => {
    it('should initialize with null currentVisit and currentClient', () => {
      const { result } = renderHook(() => useNavigationStore());

      expect(result.current.currentVisit).toBeNull();
      expect(result.current.currentClient).toBeNull();
    });
  });

  describe('Visit State Management', () => {
    describe('setCurrentVisit', () => {
      it('should set a visit as currentVisit', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
        });

        expect(result.current.currentVisit).toEqual(mockVisit);
      });

      it('should replace currentVisit when called multiple times', () => {
        const { result } = renderHook(() => useNavigationStore());
        const visit1 = createMockVisit('visit-1', 'client-1');
        const visit2 = createMockVisit('visit-2', 'client-2');

        act(() => {
          result.current.setCurrentVisit(visit1);
        });

        expect(result.current.currentVisit).toEqual(visit1);

        act(() => {
          result.current.setCurrentVisit(visit2);
        });

        expect(result.current.currentVisit).toEqual(visit2);
      });

      it('should set currentVisit to null explicitly', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
        });

        expect(result.current.currentVisit).not.toBeNull();

        act(() => {
          result.current.setCurrentVisit(null);
        });

        expect(result.current.currentVisit).toBeNull();
      });

      it('should preserve visit properties when setting', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1', 'pending');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
        });

        const current = result.current.currentVisit;
        expect(current?.id).toBe('visit-1');
        expect(current?.status).toBe('pending');
        expect(current?.client_id).toBe('client-1');
      });
    });

    describe('updateCurrentVisitStatus', () => {
      it('should update the status of currentVisit', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1', 'pending');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
        });

        act(() => {
          result.current.updateCurrentVisitStatus('completed');
        });

        expect(result.current.currentVisit?.status).toBe('completed');
      });

      it('should update status and add recommendations', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1', 'pending');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
        });

        act(() => {
          result.current.updateCurrentVisitStatus('completed', 'Follow up needed');
        });

        expect(result.current.currentVisit?.status).toBe('completed');
        expect(result.current.currentVisit?.recomendaciones).toBe('Follow up needed');
      });

      it('should update status without recommendations when recommendations is undefined', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1', 'pending');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
        });

        act(() => {
          result.current.updateCurrentVisitStatus('in_progress');
        });

        expect(result.current.currentVisit?.status).toBe('in_progress');
        expect(result.current.currentVisit?.recomendaciones).toEqual(mockVisit.recomendaciones);
      });

      it('should update recommendations with explicit null value', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1', 'pending', { recommendations: 'Initial recommendation' });

        act(() => {
          result.current.setCurrentVisit(mockVisit);
        });

        act(() => {
          result.current.updateCurrentVisitStatus('completed', null);
        });

        expect(result.current.currentVisit?.status).toBe('completed');
        expect(result.current.currentVisit?.recomendaciones).toBeNull();
      });

      it('should not update if currentVisit is null', () => {
        const { result } = renderHook(() => useNavigationStore());

        act(() => {
          result.current.updateCurrentVisitStatus('completed');
        });

        expect(result.current.currentVisit).toBeNull();
      });

      it('should preserve other visit properties when updating status', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1', 'pending');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
        });

        act(() => {
          result.current.updateCurrentVisitStatus('completed', 'New recommendation');
        });

        const updated = result.current.currentVisit;
        expect(updated?.id).toBe('visit-1');
        expect(updated?.client_id).toBe('client-1');
        expect(updated?.seller_id).toBe('seller-1');
        expect(updated?.fecha_visita).toBe(mockVisit.fecha_visita);
      });

      it('should update status multiple times with different values', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1', 'pending');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
        });

        act(() => {
          result.current.updateCurrentVisitStatus('in_progress');
        });

        expect(result.current.currentVisit?.status).toBe('in_progress');

        act(() => {
          result.current.updateCurrentVisitStatus('completed', 'Done');
        });

        expect(result.current.currentVisit?.status).toBe('completed');
        expect(result.current.currentVisit?.recomendaciones).toBe('Done');
      });

      it('should handle empty string recommendations', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1', 'pending');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
        });

        act(() => {
          result.current.updateCurrentVisitStatus('completed', '');
        });

        expect(result.current.currentVisit?.status).toBe('completed');
        expect(result.current.currentVisit?.recomendaciones).toBe('');
      });
    });

    describe('clearCurrentVisit', () => {
      it('should clear currentVisit', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
        });

        expect(result.current.currentVisit).not.toBeNull();

        act(() => {
          result.current.clearCurrentVisit();
        });

        expect(result.current.currentVisit).toBeNull();
      });

      it('should not affect currentClient when clearing currentVisit', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1');
        const mockClient = createMockClient('client-1');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
          result.current.setCurrentClient(mockClient);
        });

        act(() => {
          result.current.clearCurrentVisit();
        });

        expect(result.current.currentVisit).toBeNull();
        expect(result.current.currentClient).not.toBeNull();
      });

      it('should be safe to call when currentVisit is already null', () => {
        const { result } = renderHook(() => useNavigationStore());

        expect(result.current.currentVisit).toBeNull();

        act(() => {
          result.current.clearCurrentVisit();
        });

        expect(result.current.currentVisit).toBeNull();
      });
    });
  });

  describe('Client State Management', () => {
    describe('setCurrentClient', () => {
      it('should set a client as currentClient', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockClient = createMockClient('client-1');

        act(() => {
          result.current.setCurrentClient(mockClient);
        });

        expect(result.current.currentClient).toEqual(mockClient);
      });

      it('should replace currentClient when called multiple times', () => {
        const { result } = renderHook(() => useNavigationStore());
        const client1 = createMockClient('client-1');
        const client2 = createMockClient('client-2');

        act(() => {
          result.current.setCurrentClient(client1);
        });

        expect(result.current.currentClient).toEqual(client1);

        act(() => {
          result.current.setCurrentClient(client2);
        });

        expect(result.current.currentClient).toEqual(client2);
      });

      it('should set currentClient to null explicitly', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockClient = createMockClient('client-1');

        act(() => {
          result.current.setCurrentClient(mockClient);
        });

        expect(result.current.currentClient).not.toBeNull();

        act(() => {
          result.current.setCurrentClient(null);
        });

        expect(result.current.currentClient).toBeNull();
      });

      it('should preserve client properties when setting', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockClient = createMockClient('client-1');

        act(() => {
          result.current.setCurrentClient(mockClient);
        });

        const current = result.current.currentClient;
        expect(current?.cliente_id).toBe('client-1');
        expect(current?.nombre_institucion).toBe('Test Institution');
        expect(current?.email).toBe('test@institution.com');
      });
    });

    describe('clearCurrentClient', () => {
      it('should clear currentClient', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockClient = createMockClient('client-1');

        act(() => {
          result.current.setCurrentClient(mockClient);
        });

        expect(result.current.currentClient).not.toBeNull();

        act(() => {
          result.current.clearCurrentClient();
        });

        expect(result.current.currentClient).toBeNull();
      });

      it('should not affect currentVisit when clearing currentClient', () => {
        const { result } = renderHook(() => useNavigationStore());
        const mockVisit = createMockVisit('visit-1', 'client-1');
        const mockClient = createMockClient('client-1');

        act(() => {
          result.current.setCurrentVisit(mockVisit);
          result.current.setCurrentClient(mockClient);
        });

        act(() => {
          result.current.clearCurrentClient();
        });

        expect(result.current.currentClient).toBeNull();
        expect(result.current.currentVisit).not.toBeNull();
      });

      it('should be safe to call when currentClient is already null', () => {
        const { result } = renderHook(() => useNavigationStore());

        expect(result.current.currentClient).toBeNull();

        act(() => {
          result.current.clearCurrentClient();
        });

        expect(result.current.currentClient).toBeNull();
      });
    });
  });

  describe('clearAll', () => {
    it('should clear both currentVisit and currentClient', () => {
      const { result } = renderHook(() => useNavigationStore());
      const mockVisit = createMockVisit('visit-1', 'client-1');
      const mockClient = createMockClient('client-1');

      act(() => {
        result.current.setCurrentVisit(mockVisit);
        result.current.setCurrentClient(mockClient);
      });

      expect(result.current.currentVisit).not.toBeNull();
      expect(result.current.currentClient).not.toBeNull();

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.currentVisit).toBeNull();
      expect(result.current.currentClient).toBeNull();
    });

    it('should be safe to call when both states are already null', () => {
      const { result } = renderHook(() => useNavigationStore());

      expect(result.current.currentVisit).toBeNull();
      expect(result.current.currentClient).toBeNull();

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.currentVisit).toBeNull();
      expect(result.current.currentClient).toBeNull();
    });

    it('should clear currentVisit when currentClient is null', () => {
      const { result } = renderHook(() => useNavigationStore());
      const mockVisit = createMockVisit('visit-1', 'client-1');

      act(() => {
        result.current.setCurrentVisit(mockVisit);
      });

      expect(result.current.currentVisit).not.toBeNull();

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.currentVisit).toBeNull();
      expect(result.current.currentClient).toBeNull();
    });

    it('should clear currentClient when currentVisit is null', () => {
      const { result } = renderHook(() => useNavigationStore());
      const mockClient = createMockClient('client-1');

      act(() => {
        result.current.setCurrentClient(mockClient);
      });

      expect(result.current.currentClient).not.toBeNull();

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.currentVisit).toBeNull();
      expect(result.current.currentClient).toBeNull();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle setting visit and client independently', () => {
      const { result } = renderHook(() => useNavigationStore());
      const mockVisit = createMockVisit('visit-1', 'client-1');
      const mockClient = createMockClient('client-1');

      act(() => {
        result.current.setCurrentVisit(mockVisit);
      });

      expect(result.current.currentVisit).not.toBeNull();
      expect(result.current.currentClient).toBeNull();

      act(() => {
        result.current.setCurrentClient(mockClient);
      });

      expect(result.current.currentVisit).not.toBeNull();
      expect(result.current.currentClient).not.toBeNull();
    });

    it('should handle updating visit status and clearing client', () => {
      const { result } = renderHook(() => useNavigationStore());
      const mockVisit = createMockVisit('visit-1', 'client-1', 'pending');
      const mockClient = createMockClient('client-1');

      act(() => {
        result.current.setCurrentVisit(mockVisit);
        result.current.setCurrentClient(mockClient);
      });

      act(() => {
        result.current.updateCurrentVisitStatus('completed', 'Recommendations');
      });

      expect(result.current.currentVisit?.status).toBe('completed');
      expect(result.current.currentClient).not.toBeNull();

      act(() => {
        result.current.clearCurrentClient();
      });

      expect(result.current.currentVisit?.status).toBe('completed');
      expect(result.current.currentClient).toBeNull();
    });

    it('should handle clearing visit and updating client separately', () => {
      const { result } = renderHook(() => useNavigationStore());
      const mockVisit = createMockVisit('visit-1', 'client-1');
      const mockClient = createMockClient('client-1');
      const newMockClient = createMockClient('client-2');

      act(() => {
        result.current.setCurrentVisit(mockVisit);
        result.current.setCurrentClient(mockClient);
      });

      act(() => {
        result.current.clearCurrentVisit();
      });

      expect(result.current.currentVisit).toBeNull();
      expect(result.current.currentClient).not.toBeNull();

      act(() => {
        result.current.setCurrentClient(newMockClient);
      });

      expect(result.current.currentVisit).toBeNull();
      expect(result.current.currentClient?.cliente_id).toBe('client-2');
    });

    it('should handle complete workflow: set -> update -> clear', () => {
      const { result } = renderHook(() => useNavigationStore());
      const mockVisit = createMockVisit('visit-1', 'client-1', 'pending');
      const mockClient = createMockClient('client-1');

      // Initial setup
      act(() => {
        result.current.setCurrentVisit(mockVisit);
        result.current.setCurrentClient(mockClient);
      });

      expect(result.current.currentVisit?.status).toBe('pending');
      expect(result.current.currentClient?.cliente_id).toBe('client-1');

      // Update visit status
      act(() => {
        result.current.updateCurrentVisitStatus('in_progress', 'In progress');
      });

      expect(result.current.currentVisit?.status).toBe('in_progress');
      expect(result.current.currentVisit?.recomendaciones).toBe('In progress');

      // Update status again
      act(() => {
        result.current.updateCurrentVisitStatus('completed', 'Completed successfully');
      });

      expect(result.current.currentVisit?.status).toBe('completed');
      expect(result.current.currentVisit?.recomendaciones).toBe('Completed successfully');

      // Clear all
      act(() => {
        result.current.clearAll();
      });

      expect(result.current.currentVisit).toBeNull();
      expect(result.current.currentClient).toBeNull();
    });

    it('should handle replacing visit while preserving client', () => {
      const { result } = renderHook(() => useNavigationStore());
      const visit1 = createMockVisit('visit-1', 'client-1', 'pending');
      const visit2 = createMockVisit('visit-2', 'client-1', 'pending');
      const mockClient = createMockClient('client-1');

      act(() => {
        result.current.setCurrentVisit(visit1);
        result.current.setCurrentClient(mockClient);
      });

      expect(result.current.currentVisit?.id).toBe('visit-1');

      act(() => {
        result.current.setCurrentVisit(visit2);
      });

      expect(result.current.currentVisit?.id).toBe('visit-2');
      expect(result.current.currentClient?.cliente_id).toBe('client-1');
    });

    it('should handle updating status then clearing current visit', () => {
      const { result } = renderHook(() => useNavigationStore());
      const mockVisit = createMockVisit('visit-1', 'client-1', 'pending');

      act(() => {
        result.current.setCurrentVisit(mockVisit);
      });

      act(() => {
        result.current.updateCurrentVisitStatus('completed', 'Done');
      });

      expect(result.current.currentVisit?.status).toBe('completed');

      act(() => {
        result.current.clearCurrentVisit();
      });

      expect(result.current.currentVisit).toBeNull();
    });
  });
});

// Helper functions to create mock data
function createMockVisit(
  id: string,
  clientId: string,
  status: string = 'pending',
  overrides?: {
    recommendations?: string | null;
  }
): VisitResponseBFF {
  return {
    id,
    seller_id: 'seller-1',
    client_id: clientId,
    fecha_visita: '2024-01-15',
    status,
    notas_visita: {
      observaciones_generales: 'Test notes',
    } as any,
    recomendaciones: overrides?.recommendations ?? {
      recomendacion: 'Test recommendation',
    } as any,
    archivos_evidencia: {
      archivos: [],
    } as any,
    client_nombre_institucion: 'Test Institution',
    client_direccion: 'Test Address',
    client_ciudad: 'Test City',
    client_pais: 'Test Country',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  };
}

function createMockClient(clientId: string): ClientResponse {
  return {
    cliente_id: clientId,
    cognito_user_id: 'cognito-' + clientId,
    email: 'test@institution.com',
    telefono: '+1234567890',
    nombre_institucion: 'Test Institution',
    tipo_institucion: 'Hospital',
    nit: 'NIT-123456',
    direccion: 'Test Address 123',
    ciudad: 'Test City',
    pais: 'Test Country',
    representante: 'Test Representative',
    vendedor_asignado_id: {
      vendedor_id: 'seller-1',
    } as any,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  };
}
