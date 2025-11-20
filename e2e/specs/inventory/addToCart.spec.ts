import { device, expect, element, by } from 'detox';
import { AuthFlow } from '../../flows/AuthFlow';
import { CartFlow } from '../../flows/CartFlow';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { AddToCartModal } from '../../pages/components/AddToCartModal';
import { BottomTabBar } from '../../pages/components/BottomTabBar';
import { testUsers } from '../../fixtures/users';

describe('Add to Cart Flow', () => {
  const authFlow = new AuthFlow();
  const cartFlow = new CartFlow();
  const inventoryPage = new InventoryPage();
  const cartPage = new CartPage();
  const addToCartModal = new AddToCartModal();
  const tabBar = new BottomTabBar();

  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    await authFlow.loginAsClient(
      testUsers.client.email,
      testUsers.client.password
    );
  });

  afterEach(async () => {
    try {
      await cartFlow.clearCart();
    } catch {
      // Cart might already be empty
    }
    try {
      await authFlow.logout();
    } catch {
      // Might not be logged in or already on login screen
    }
  });

  it('should add single product to cart', async () => {
    await inventoryPage.waitForScreen();
    await inventoryPage.tapProductByIndex(0);

    await addToCartModal.waitForModal();
    // Use default quantity of 1
    await addToCartModal.tapAddToCart();

    await tabBar.navigateToCart();
    await cartPage.waitForScreen();
  });

  it('should add multiple products to cart', async () => {
    await inventoryPage.waitForScreen();

    // Add first product with default quantity
    await inventoryPage.tapProductByIndex(0);
    await addToCartModal.waitForModal();
    await addToCartModal.tapAddToCart();

    // Add second product with default quantity
    await inventoryPage.tapProductByIndex(1);
    await addToCartModal.waitForModal();
    await addToCartModal.tapAddToCart();

    await tabBar.navigateToCart();
    await cartPage.waitForScreen();
  });
});
