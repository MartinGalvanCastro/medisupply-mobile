export const testUsers = {
  client: {
    email: 'e2e.client@medisupply.test',
    password: 'TestClient123!',
    name: 'E2E Test Client',
    institutionName: 'Test Hospital',
    phone: '+57 300 123 4567',
  },
  seller: {
    email: 'e2e.seller@medisupply.test',
    password: 'TestSeller123!',
    name: 'E2E Test Seller',
  },
  newUser: {
    email: `e2e.new.${Date.now()}@medisupply.test`,
    password: 'NewUser123!',
    confirmPassword: 'NewUser123!',
    phone: '+57 301 234 5678',
    institutionName: 'New Test Clinic',
    institutionType: 'Clinic',
    nit: '900123456-7',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    state: 'Cundinamarca',
    country: 'Colombia',
    representative: 'John Doe',
  },
};

export const invalidCredentials = {
  email: 'invalid@test.com',
  password: 'WrongPassword123!',
};
