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

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
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

  describe('Adding Products', () => {
    it('should add single product to cart', async () => {
      await inventoryPage.waitForScreen();
      await inventoryPage.tapProductByIndex(0);

      await addToCartModal.waitForModal();
      await addToCartModal.setQuantity(5);
      await addToCartModal.tapAddToCart();

      await expect(element(by.text('Added to Cart'))).toBeVisible();

      await tabBar.navigateToCart();
      await cartPage.waitForScreen();
    });

    it('should add multiple products to cart', async () => {
      await inventoryPage.waitForScreen();
      await cartFlow.addMultipleProducts([
        { index: 0, quantity: 3 },
        { index: 1, quantity: 2 },
      ]);

      await tabBar.navigateToCart();
      await cartPage.waitForScreen();
      await cartPage.expectTotalItems('2 item(s)');
    });

    it('should update subtotal when quantity changes', async () => {
      await inventoryPage.waitForScreen();
      await inventoryPage.tapProductByIndex(0);

      await addToCartModal.waitForModal();
      await addToCartModal.setQuantity(1);
      await addToCartModal.incrementQuantity(4);
      await addToCartModal.expectQuantity('5');
    });

    it('should not allow adding more than available quantity', async () => {
      await inventoryPage.waitForScreen();
      await inventoryPage.tapProductByIndex(0);

      await addToCartModal.waitForModal();
      await addToCartModal.setQuantity(9999);
      await addToCartModal.expectAddButtonDisabled();
    });
  });

  describe('Modal Interactions', () => {
    it('should cancel adding product', async () => {
      await inventoryPage.waitForScreen();
      await inventoryPage.tapProductByIndex(0);

      await addToCartModal.waitForModal();
      await addToCartModal.setQuantity(5);
      await addToCartModal.tapCancel();

      await tabBar.navigateToCart();
      await cartPage.waitForScreen();
      await cartPage.expectEmptyCart();
    });

    it('should handle increment and decrement buttons', async () => {
      await inventoryPage.waitForScreen();
      await inventoryPage.tapProductByIndex(0);

      await addToCartModal.waitForModal();
      await addToCartModal.setQuantity(5);
      await addToCartModal.incrementQuantity(2);
      await addToCartModal.decrementQuantity(1);
      await addToCartModal.expectQuantity('6');
    });
  });
});
