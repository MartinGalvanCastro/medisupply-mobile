import { device } from 'detox';

beforeAll(async () => {
  await device.launchApp({
    newInstance: true,
    permissions: {
      camera: 'YES',
      photos: 'YES',
      notifications: 'YES',
      location: 'always',
    },
  });
});

afterAll(async () => {
  await device.terminateApp();
});
