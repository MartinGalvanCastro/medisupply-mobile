export interface CartItem {
  inventoryId: string;
  productId: string;
  productName: string;
  productSku: string;
  productPrice: number;
  quantity: number;
  warehouseName: string;
  availableQuantity: number;
}

export interface CartState {
  items: CartItem[];
  selectedClientId?: string;
  selectedVisitId?: string;
}

export interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  updateQuantity: (inventoryId: string, quantity: number) => void;
  removeItem: (inventoryId: string) => void;
  clearCart: () => void;
  setClient: (clientId: string) => void;
  setVisit: (visitId?: string) => void;
  getSubtotal: (inventoryId: string) => number;
  getTotal: () => number;
}

export type CartStore = CartState & CartActions;
