import { create } from 'zustand';
import type { VisitResponseBFF } from '@/api/generated/models/visitResponseBFF';
import type { ClientResponse } from '@/api/generated/models/clientResponse';

interface NavigationState {
  // Current visit being viewed
  currentVisit: VisitResponseBFF | null;
  setCurrentVisit: (visit: VisitResponseBFF | null) => void;
  updateCurrentVisitStatus: (status: string, recommendations?: string | null) => void;
  clearCurrentVisit: () => void;

  // Current client being viewed
  currentClient: ClientResponse | null;
  setCurrentClient: (client: ClientResponse | null) => void;
  clearCurrentClient: () => void;

  // Clear all navigation state
  clearAll: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  // Visit state
  currentVisit: null,
  setCurrentVisit: (visit) => set({ currentVisit: visit }),
  updateCurrentVisitStatus: (status, recommendations) =>
    set((state) => {
      console.log('🔴 [NavigationStore] updateCurrentVisitStatus called');
      console.log('🔴 [NavigationStore] Before update - current visit:', state.currentVisit);
      console.log('🔴 [NavigationStore] New status:', status);
      console.log('🔴 [NavigationStore] New recommendations:', recommendations);

      if (!state.currentVisit) {
        console.log('⚠️ [NavigationStore] No current visit in store!');
        return state;
      }

      const updatedVisit = {
        ...state.currentVisit,
        status,
        ...(recommendations !== undefined && { recomendaciones: recommendations }),
      };

      console.log('🟢 [NavigationStore] After update - new visit:', updatedVisit);

      return {
        currentVisit: updatedVisit,
      };
    }),
  clearCurrentVisit: () => set({ currentVisit: null }),

  // Client state
  currentClient: null,
  setCurrentClient: (client) => set({ currentClient: client }),
  clearCurrentClient: () => set({ currentClient: null }),

  // Clear all
  clearAll: () => set({ currentVisit: null, currentClient: null }),
}));
