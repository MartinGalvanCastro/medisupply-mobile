import { device, element, by, expect as detoxExpect } from 'detox';

describe('Home Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display the home screen with welcome message', async () => {
    await detoxExpect(element(by.text('Welcome to MediSupply'))).toBeVisible();
  });

  it('should display quick action buttons', async () => {
    await detoxExpect(element(by.text('View Products'))).toBeVisible();
    await detoxExpect(element(by.text('Manage Inventory'))).toBeVisible();
    await detoxExpect(element(by.text('View Orders'))).toBeVisible();
  });

  it('should navigate to products screen when clicking View Products', async () => {
    await element(by.text('View Products')).tap();
    await detoxExpect(element(by.text('Search products...'))).toBeVisible();
  });
});
