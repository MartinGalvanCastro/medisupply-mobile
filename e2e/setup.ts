import { beforeAll, afterAll } from '@jest/globals';

beforeAll(async () => {
  // Initialize Detox before all tests
  await device.launchApp({
    permissions: { notifications: 'YES' },
  });
});

afterAll(async () => {
  // Cleanup after all tests
  await device.terminateApp();
});
