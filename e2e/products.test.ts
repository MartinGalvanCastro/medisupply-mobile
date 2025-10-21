import { device, element, by, expect as detoxExpect } from 'detox';

describe('Products Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to products screen
    await element(by.text('View Products')).tap();
  });

  it('should display the products list', async () => {
    await detoxExpect(element(by.text('Medical Mask'))).toBeVisible();
    await detoxExpect(element(by.text('Hand Sanitizer'))).toBeVisible();
  });

  it('should filter products when searching', async () => {
    await element(by.text('Search products...')).typeText('mask');
    await detoxExpect(element(by.text('Medical Mask'))).toBeVisible();
  });

  it('should navigate to product detail when tapping a product', async () => {
    await element(by.text('Medical Mask')).tap();
    await detoxExpect(element(by.text('Description'))).toBeVisible();
    await detoxExpect(element(by.text('Add to Order'))).toBeVisible();
  });
});
