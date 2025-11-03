/**
 * Products Mock Handlers
 *
 * Custom Axios interceptor handlers for product endpoints.
 * Supports both sellers-app and client-app paths.
 */

import type { AxiosRequestConfig } from 'axios';
import type { MockHandler, MockResponse } from './types';
import { mockProducts } from '../products';

/**
 * GET /bff/sellers-app/products
 * List all products with optional search filter (sellers)
 */
const getSellersProductsHandler: MockHandler = {
  method: 'GET',
  endpoint: '/bff/sellers-app/products',
  description: 'List all products with optional search filter (sellers)',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Parse query parameters
    const params = config.params || {};
    const search = params.search?.toLowerCase() || '';

    // Filter products by search term
    let filteredProducts = mockProducts;

    if (search) {
      filteredProducts = mockProducts.filter((product) => {
        return (
          product.name.toLowerCase().includes(search) ||
          product.sku.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search) ||
          product.manufacturer.toLowerCase().includes(search)
        );
      });
    }

    return {
      status: 200,
      data: filteredProducts,
    };
  },
};

/**
 * GET /bff/client-app/products
 * List all products with optional search filter (clients)
 */
const getClientProductsHandler: MockHandler = {
  method: 'GET',
  endpoint: '/bff/client-app/products',
  description: 'List all products with optional search filter (clients)',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Parse query parameters
    const params = config.params || {};
    const search = params.search?.toLowerCase() || '';

    // Filter products by search term
    let filteredProducts = mockProducts;

    if (search) {
      filteredProducts = mockProducts.filter((product) => {
        return (
          product.name.toLowerCase().includes(search) ||
          product.sku.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search) ||
          product.manufacturer.toLowerCase().includes(search)
        );
      });
    }

    return {
      status: 200,
      data: filteredProducts,
    };
  },
};

/**
 * GET /bff/sellers-app/products/:id
 * Get a single product by ID (sellers)
 */
const getSellersProductByIdHandler: MockHandler = {
  method: 'GET',
  endpoint: /\/bff\/sellers-app\/products\/[^/]+$/,
  description: 'Get a single product by ID (sellers)',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Extract product ID from URL
    const url = config.url || '';
    const productId = url.split('/').pop();

    // Find product by ID
    const product = mockProducts.find((p) => p.id === productId);

    if (!product) {
      return {
        status: 404,
        data: {
          detail: 'Product not found',
          status: 404,
        },
      };
    }

    return {
      status: 200,
      data: product,
    };
  },
};

/**
 * GET /bff/client-app/products/:id
 * Get a single product by ID (clients)
 */
const getClientProductByIdHandler: MockHandler = {
  method: 'GET',
  endpoint: /\/bff\/client-app\/products\/[^/]+$/,
  description: 'Get a single product by ID (clients)',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Extract product ID from URL
    const url = config.url || '';
    const productId = url.split('/').pop();

    // Find product by ID
    const product = mockProducts.find((p) => p.id === productId);

    if (!product) {
      return {
        status: 404,
        data: {
          detail: 'Product not found',
          status: 404,
        },
      };
    }

    return {
      status: 200,
      data: product,
    };
  },
};

/**
 * Export all product handlers
 */
export const productHandlers: MockHandler[] = [
  getSellersProductsHandler,
  getClientProductsHandler,
  getSellersProductByIdHandler,
  getClientProductByIdHandler,
];
