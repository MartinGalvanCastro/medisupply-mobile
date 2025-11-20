import { device, expect, element, by } from 'detox';
import { AuthFlow } from '../../flows/AuthFlow';
import { CartFlow } from '../../flows/CartFlow';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { BottomTabBar } from '../../pages/components/BottomTabBar';
import { testUsers } from '../../fixtures/users';
import { testClients } from '../../fixtures/clients';

describe('Checkout Flow', () => {
  const authFlow = new AuthFlow();
  const cartFlow = new CartFlow();
  const inventoryPage = new InventoryPage();
  const cartPage = new CartPage();
  const tabBar = new BottomTabBar();

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Seller Checkout', () => {
    beforeEach(async () => {
      await authFlow.loginAsSeller(
        testUsers.seller.email,
        testUsers.seller.password
      );
    });

    afterEach(async () => {
      try {
        await cartFlow.clearCart();
      } catch {
        // Cart might already be empty
      }
    });

    it('should complete full checkout flow with client selection', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addMultipleProducts([
        { index: 0, quantity: 10 },
        { index: 1, quantity: 5 },
      ]);

      await cartFlow.checkout(testClients[0].name);

      await expect(element(by.text('Order Placed Successfully'))).toBeVisible();

      await tabBar.navigateToOrders();
      await expect(element(by.id('orders-screen'))).toBeVisible();
    });

    it('should require client selection before checkout', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addProductToCart(0, 1);

      await tabBar.navigateToCart();
      await cartPage.waitForScreen();
      await cartPage.tapPlaceOrder();

      await expect(element(by.text('Please select a client'))).toBeVisible();
    });

    it('should allow updating selected client', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addProductToCart(0, 1);

      await cartFlow.goToCart();
      await cartFlow.selectClientForOrder(testClients[0].name);
      await cartPage.expectSelectedClient(testClients[0].name);

      await cartFlow.selectClientForOrder(testClients[1].name);
      await cartPage.expectSelectedClient(testClients[1].name);
    });

    it('should add multiple products before checkout', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addMultipleProducts([
        { index: 0, quantity: 5 },
        { index: 1, quantity: 3 },
      ]);

      await cartFlow.goToCart();
      await cartPage.expectTotalItems('2 item(s)');
    });
  });

  describe('Client Checkout', () => {
    beforeEach(async () => {
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
    });

    it('should complete checkout without client selection', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addProductToCart(0, 5);

      await cartFlow.goToCart();
      await cartPage.tapPlaceOrder();

      await expect(element(by.text('Order Placed Successfully'))).toBeVisible();
    });

    it('should display cart items correctly', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addProductToCart(0, 3);

      await cartFlow.goToCart();
      await cartPage.expectItemInCart('prod-001');
      await cartPage.expectItemQuantity('prod-001', '3');
    });
  });

  describe('Cart Management', () => {
    beforeEach(async () => {
      await authFlow.loginAsClient(
        testUsers.client.email,
        testUsers.client.password
      );
    });

    it('should clear cart', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addMultipleProducts([
        { index: 0, quantity: 3 },
        { index: 1, quantity: 2 },
      ]);

      await cartFlow.clearCart();
      await cartPage.expectEmptyCart();
    });

    it('should update item quantity in cart', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addProductToCart(0, 5);

      await cartFlow.goToCart();
      await cartPage.incrementQuantity('prod-001');
      await cartPage.expectItemQuantity('prod-001', '6');
    });

    it('should remove item from cart', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addProductToCart(0, 5);

      await cartFlow.goToCart();
      await cartPage.removeItem('prod-001');
      await cartPage.expectEmptyCart();
    });

    it('should decrement quantity in cart', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addProductToCart(0, 5);

      await cartFlow.goToCart();
      await cartPage.decrementQuantity('prod-001');
      await cartPage.expectItemQuantity('prod-001', '4');
    });

    it('should handle multiple product addition and removal', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addMultipleProducts([
        { index: 0, quantity: 3 },
        { index: 1, quantity: 2 },
      ]);

      await cartFlow.goToCart();
      await cartPage.expectTotalItems('2 item(s)');

      await cartPage.removeItem('prod-001');
      await cartPage.expectItemNotInCart('prod-001');
      await cartPage.expectItemInCart('prod-002');
    });
  });
});
