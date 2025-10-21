import { device, element, by, expect as detoxExpect } from 'detox';

describe('Navigation', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should navigate through the app flow', async () => {
    // Start at home
    await detoxExpect(element(by.text('Welcome to MediSupply'))).toBeVisible();

    // Navigate to products
    await element(by.text('View Products')).tap();
    await detoxExpect(element(by.text('Search products...'))).toBeVisible();

    // Open product detail
    await element(by.text('Medical Mask')).tap();
    await detoxExpect(element(by.text('Add to Order'))).toBeVisible();

    // Go back to products
    if (device.getPlatform() === 'ios') {
      await element(by.traits(['button'])).atIndex(0).tap();
    } else {
      await device.pressBack();
    }
    await detoxExpect(element(by.text('Search products...'))).toBeVisible();
  });
});
