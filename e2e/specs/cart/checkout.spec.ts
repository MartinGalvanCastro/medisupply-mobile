import { device, expect, element, by } from 'detox';
import { AuthFlow } from '../../flows/AuthFlow';
import { CartFlow } from '../../flows/CartFlow';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { testUsers } from '../../fixtures/users';
import { testClients } from '../../fixtures/clients';

describe('Checkout Flow', () => {
  const authFlow = new AuthFlow();
  const cartFlow = new CartFlow();
  const inventoryPage = new InventoryPage();
  const cartPage = new CartPage();

  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
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

  it('should complete seller checkout with client selection', async () => {
    await authFlow.loginAsSeller(
      testUsers.seller.email,
      testUsers.seller.password
    );
    await inventoryPage.waitForScreen();
    await cartFlow.addProductToCart(0, 1);
    await cartFlow.checkout(testClients[0].name);

    // Verify cart is empty after successful order
    await cartPage.expectEmptyCart();
  });

  it('should complete client checkout', async () => {
    await authFlow.loginAsClient(
      testUsers.client.email,
      testUsers.client.password
    );
    await inventoryPage.waitForScreen();
    await cartFlow.addProductToCart(0, 1);

    await cartFlow.goToCart();
    await cartPage.tapPlaceOrder();

    // Verify cart is empty after successful order
    await cartPage.expectEmptyCart();
  });
});
