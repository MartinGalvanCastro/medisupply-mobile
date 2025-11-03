/**
 * Orders Mock Handlers
 *
 * Custom Axios interceptor handlers for order endpoints.
 * Supports both sellers-app and client-app paths.
 */

import type { AxiosRequestConfig } from 'axios';
import type { MockHandler, MockResponse } from './types';
import { mockOrders, type MockOrder, type MockOrderItem, type OrderStatus } from '../orders';
import { mockClients } from '../clients';
import { mockProducts } from '../products';
import { mockInventory } from '../inventory';
import { mockShipments, type ShipmentStatus } from '../shipments';
import type { OrderResponse, OrderItemResponse } from '@/api/generated/models';

/**
 * Convert mock order to OrderResponse format with shipment data
 */
const convertToOrderResponse = (order: MockOrder): OrderResponse => {
  // Get client info
  const client = mockClients.find((c) => c.id === order.client_id);

  // Get shipment info if available
  const shipment = mockShipments.find((s) => s.order_id === order.id);

  // Convert order items
  const items: OrderItemResponse[] = order.items.map((item) => ({
    id: item.id,
    pedido_id: order.id,
    producto_id: item.product_id,
    inventario_id: `INV-${item.product_id}`,
    cantidad: item.quantity,
    precio_unitario: item.unit_price,
    precio_total: item.subtotal,
    product_name: item.product.name,
    product_sku: item.product.sku,
    warehouse_id: 'WH-001',
    warehouse_name: 'Bodega Principal',
    warehouse_city: 'Bogotá',
    warehouse_country: 'Colombia',
    batch_number: `BATCH-${item.product_id}-001`,
    expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: order.order_date,
    updated_at: order.order_date,
  }));

  return {
    id: order.id,
    customer_id: order.client_id,
    seller_id: null,
    visit_id: null,
    route_id: order.route_id || null,
    fecha_pedido: order.order_date,
    fecha_entrega_estimada: order.delivery_date,
    metodo_creacion: 'app_cliente',
    direccion_entrega: client?.direccion || 'N/A',
    ciudad_entrega: client?.ciudad || 'N/A',
    pais_entrega: client?.pais || 'Colombia',
    customer_name: client?.nombre_institucion || 'N/A',
    customer_phone: client?.telefono || null,
    customer_email: client?.email || null,
    seller_name: null,
    seller_email: null,
    monto_total: order.total,
    created_at: order.order_date,
    updated_at: order.order_date,
    items,
    // Add shipment data as extended properties
    shipment_id: shipment?.id || null,
    shipment_status: shipment?.status || null,
    vehicle_plate: shipment?.vehicle_plate || null,
    driver_name: shipment?.driver_name || null,
  } as any; // Cast to any to add shipment properties
};

/**
 * GET /bff/client-app/my-orders
 * Get orders for the current client
 */
const getMyOrdersHandler: MockHandler = {
  method: 'GET',
  endpoint: '/bff/client-app/my-orders',
  description: 'Get orders for the current client',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // In a real implementation, we would get the client_id from the auth token
    // For mock purposes, we'll use query params or default to client '1'
    const params = config.params || {};
    const clientId = params.client_id || '1';
    const status = params.status as OrderStatus | undefined;
    const showPastDeliveries = params.show_past_deliveries === 'true';

    // Filter orders for this client
    let filteredOrders = mockOrders.filter((order) => order.client_id === clientId);

    // Filter by status if provided
    if (status) {
      filteredOrders = filteredOrders.filter((order) => order.status === status);
    }

    // Filter by delivery date if not showing past deliveries
    if (!showPastDeliveries) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filteredOrders = filteredOrders.filter((order) => {
        const deliveryDate = new Date(order.delivery_date);
        deliveryDate.setHours(0, 0, 0, 0);
        return deliveryDate >= today;
      });
    }

    // Sort by order date (descending - most recent first)
    filteredOrders.sort((a, b) => {
      return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
    });

    // Convert to OrderResponse format
    const orderResponses = filteredOrders.map(convertToOrderResponse);

    // Return paginated response format
    const total = orderResponses.length;
    const page = parseInt(params.page || '1', 10);
    const size = parseInt(params.limit || '50', 10);

    return {
      status: 200,
      data: {
        items: orderResponses,
        total,
        page,
        size,
        has_next: false,
        has_previous: false,
      },
    };
  },
};

/**
 * GET /bff/sellers-app/orders
 * Get all orders with optional filters (sellers)
 */
const getSellersOrdersHandler: MockHandler = {
  method: 'GET',
  endpoint: '/bff/sellers-app/orders',
  description: 'Get all orders with optional filters (sellers)',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Parse query parameters
    const params = config.params || {};
    const clientId = params.client_id || '';
    const status = params.status as OrderStatus | undefined;
    const dateFrom = params.date_from ? new Date(params.date_from) : null;
    const dateTo = params.date_to ? new Date(params.date_to) : null;

    // Filter orders
    let filteredOrders = [...mockOrders];

    if (clientId) {
      filteredOrders = filteredOrders.filter((order) => {
        return order.client_id === clientId;
      });
    }

    if (status) {
      filteredOrders = filteredOrders.filter((order) => {
        return order.status === status;
      });
    }

    if (dateFrom) {
      filteredOrders = filteredOrders.filter((order) => {
        return new Date(order.order_date) >= dateFrom;
      });
    }

    if (dateTo) {
      filteredOrders = filteredOrders.filter((order) => {
        return new Date(order.order_date) <= dateTo;
      });
    }

    // Sort by order date (descending - most recent first)
    filteredOrders.sort((a, b) => {
      return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
    });

    return {
      status: 200,
      data: filteredOrders,
    };
  },
};

/**
 * POST /bff/client-app/orders
 * Create a new order (client)
 */
const createClientOrderHandler: MockHandler = {
  method: 'POST',
  endpoint: '/bff/client-app/orders',
  description: 'Create a new order (client)',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Parse request body
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};

    // In a real implementation, client_id would come from auth token
    const clientId = body.client_id || '1';

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return {
        status: 422,
        data: {
          detail: 'Missing or invalid field: items',
          status: 422,
        },
      };
    }

    // Validate client exists
    const client = mockClients.find((c) => c.id === clientId);
    if (!client) {
      return {
        status: 404,
        data: {
          detail: 'Client not found',
          status: 404,
        },
      };
    }

    // Process order items
    const orderItems: MockOrderItem[] = [];
    let total = 0;

    for (const item of body.items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return {
          status: 422,
          data: {
            detail: 'Invalid item: product_id and quantity > 0 required',
            status: 422,
          },
        };
      }

      // Find product
      const product = mockProducts.find((p) => p.id === item.product_id);
      if (!product) {
        return {
          status: 404,
          data: {
            detail: `Product not found: ${item.product_id}`,
            status: 404,
          },
        };
      }

      // Get price from inventory
      const inventoryItem = mockInventory.find(
        (inv) => inv.product_id === item.product_id && inv.available_quantity >= item.quantity
      );

      if (!inventoryItem) {
        return {
          status: 400,
          data: {
            detail: `Insufficient inventory for product: ${product.name}`,
            status: 400,
          },
        };
      }

      const subtotal = inventoryItem.price * item.quantity;
      total += subtotal;

      orderItems.push({
        id: `ITEM-${String(Date.now()).slice(-3)}`,
        product_id: product.id,
        product: product,
        quantity: item.quantity,
        unit_price: inventoryItem.price,
        subtotal: subtotal,
      });
    }

    // Create order
    const orderDate = new Date().toISOString();
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 2); // 2 days delivery

    const newOrder: MockOrder = {
      id: `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`,
      client_id: clientId,
      order_date: orderDate,
      delivery_date: deliveryDate.toISOString(),
      status: 'pending',
      items: orderItems,
      total: total,
    };

    // Add to mock data (in-memory)
    mockOrders.push(newOrder);

    return {
      status: 201,
      data: newOrder,
    };
  },
};

/**
 * POST /bff/sellers-app/orders
 * Create a new order for a client (seller)
 */
const createSellerOrderHandler: MockHandler = {
  method: 'POST',
  endpoint: '/bff/sellers-app/orders',
  description: 'Create a new order for a client (seller)',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Parse request body
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};

    // Validate required fields
    if (!body.client_id) {
      return {
        status: 422,
        data: {
          detail: 'Missing required field: client_id',
          status: 422,
        },
      };
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return {
        status: 422,
        data: {
          detail: 'Missing or invalid field: items',
          status: 422,
        },
      };
    }

    // Validate client exists
    const client = mockClients.find((c) => c.id === body.client_id);
    if (!client) {
      return {
        status: 404,
        data: {
          detail: 'Client not found',
          status: 404,
        },
      };
    }

    // Process order items
    const orderItems: MockOrderItem[] = [];
    let total = 0;

    for (const item of body.items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return {
          status: 422,
          data: {
            detail: 'Invalid item: product_id and quantity > 0 required',
            status: 422,
          },
        };
      }

      // Find product
      const product = mockProducts.find((p) => p.id === item.product_id);
      if (!product) {
        return {
          status: 404,
          data: {
            detail: `Product not found: ${item.product_id}`,
            status: 404,
          },
        };
      }

      // Get price from inventory
      const inventoryItem = mockInventory.find(
        (inv) => inv.product_id === item.product_id && inv.available_quantity >= item.quantity
      );

      if (!inventoryItem) {
        return {
          status: 400,
          data: {
            detail: `Insufficient inventory for product: ${product.name}`,
            status: 400,
          },
        };
      }

      const subtotal = inventoryItem.price * item.quantity;
      total += subtotal;

      orderItems.push({
        id: `ITEM-${String(Date.now()).slice(-3)}`,
        product_id: product.id,
        product: product,
        quantity: item.quantity,
        unit_price: inventoryItem.price,
        subtotal: subtotal,
      });
    }

    // Create order
    const orderDate = new Date().toISOString();
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 2); // 2 days delivery

    const newOrder: MockOrder = {
      id: `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`,
      client_id: body.client_id,
      order_date: orderDate,
      delivery_date: deliveryDate.toISOString(),
      status: 'pending',
      items: orderItems,
      total: total,
      route_id: body.route_id,
    };

    // Add to mock data (in-memory)
    mockOrders.push(newOrder);

    return {
      status: 201,
      data: newOrder,
    };
  },
};

/**
 * Export all order handlers
 */
export const orderHandlers: MockHandler[] = [
  getMyOrdersHandler,
  getSellersOrdersHandler,
  createClientOrderHandler,
  createSellerOrderHandler,
];
