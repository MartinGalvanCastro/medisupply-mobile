const http = require('http');

// Fixture data
const testUsers = {
  client: {
    email: 'e2e.client@medisupply.test',
    password: 'TestClient123!',
    name: 'E2E Test Client',
    institutionName: 'Test Hospital',
    phone: '+57 300 123 4567',
    user_type: 'client',
  },
  seller: {
    email: 'e2e.seller@medisupply.test',
    password: 'TestSeller123!',
    name: 'E2E Test Seller',
    user_type: 'seller',
  },
};

const testProducts = [
  {
    id: 'prod-001',
    product_id: 'prod-001',
    product_name: 'Paracetamol 500mg',
    product_sku: 'SKU-001',
    product_category: 'analgésicos',
    product_price: 5000,
    total_quantity: 500,
    reserved_quantity: 0,
    warehouse_name: 'Bodega Principal',
  },
  {
    id: 'prod-002',
    product_id: 'prod-002',
    product_name: 'Ibuprofeno 400mg',
    product_sku: 'SKU-002',
    product_category: 'antiinflamatorios',
    product_price: 8000,
    total_quantity: 50,
    reserved_quantity: 0,
    warehouse_name: 'Bodega Principal',
  },
  {
    id: 'prod-003',
    product_id: 'prod-003',
    product_name: 'Amoxicilina 500mg',
    product_sku: 'SKU-003',
    product_category: 'antibióticos',
    product_price: 15000,
    total_quantity: 100,
    reserved_quantity: 100,
    warehouse_name: 'Bodega Principal',
  },
];

const testClients = [
  {
    cliente_id: 'client-001',
    representante: 'Hospital Central',
    nombre_institucion: 'Hospital Central de Bogotá',
    email: 'central@hospital.com',
    telefono: '+57 601 234 5678',
    ciudad: 'Bogotá',
  },
  {
    cliente_id: 'client-002',
    representante: 'Clínica Norte',
    nombre_institucion: 'Clínica del Norte',
    email: 'norte@clinica.com',
    telefono: '+57 604 567 8901',
    ciudad: 'Medellín',
  },
];

// Token storage
let currentUser = null;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  // Log all incoming requests
  console.log(`[${new Date().toISOString()}] ${method} ${path}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const data = body ? JSON.parse(body) : {};

    // Health check
    if (path === '/' || path === '/bff/check-all') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    // Login
    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = data;
      const user = Object.values(testUsers).find(
        u => u.email === email && u.password === password
      );

      if (user) {
        currentUser = user;
        res.writeHead(200);
        res.end(JSON.stringify({
          access_token: 'mock-access-token-12345',
          refresh_token: 'mock-refresh-token-12345',
          token_type: 'bearer',
        }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({ detail: 'Invalid credentials' }));
      }
      return;
    }

    // Get current user
    if (path === '/auth/me' && method === 'GET') {
      if (currentUser) {
        res.writeHead(200);
        res.end(JSON.stringify({
          id: 'user-001',
          email: currentUser.email,
          name: currentUser.name,
          user_type: currentUser.user_type,
          user_details: {
            institution_name: currentUser.institutionName,
            phone: currentUser.phone,
          },
        }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({ detail: 'Not authenticated' }));
      }
      return;
    }

    // Refresh token
    if (path === '/auth/refresh' && method === 'POST') {
      res.writeHead(200);
      res.end(JSON.stringify({
        access_token: 'mock-access-token-refreshed',
        refresh_token: 'mock-refresh-token-refreshed',
        token_type: 'bearer',
      }));
      return;
    }

    // Get inventories
    if ((path === '/bff/inventories' || path === '/bff/web/inventories') && method === 'GET') {
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const name = url.searchParams.get('name');

      let items = testProducts;
      if (name) {
        items = items.filter(p =>
          p.product_name.toLowerCase().includes(name.toLowerCase())
        );
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        items: items.slice(offset, offset + limit),
        total: items.length,
        has_next: offset + limit < items.length,
      }));
      return;
    }

    // Get clients
    if (path === '/bff/sellers-app/clients' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        items: testClients,
        total: testClients.length,
        has_next: false,
      }));
      return;
    }

    // Create order
    if ((path === '/bff/client-app/orders' || path === '/bff/sellers-app/orders') && method === 'POST') {
      res.writeHead(201);
      res.end(JSON.stringify({
        id: `order-${Date.now()}`,
        status: 'pending',
        created_at: new Date().toISOString(),
      }));
      return;
    }

    // Ably token (support both endpoints)
    if ((path === '/realtime/ably-token' || path === '/auth/ably/token') && method === 'POST') {
      res.writeHead(200);
      res.end(JSON.stringify({
        token_request: {
          keyName: 'mock-key',
          ttl: 3600000,
          timestamp: Date.now(),
          nonce: 'mock-nonce',
          mac: 'mock-mac',
        },
      }));
      return;
    }

    // Default 404
    res.writeHead(404);
    res.end(JSON.stringify({ detail: `Not found: ${method} ${path}` }));
  });
});

const PORT = process.env.MOCK_SERVER_PORT || 8010;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock API server running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Mock server closed');
    process.exit(0);
  });
});
