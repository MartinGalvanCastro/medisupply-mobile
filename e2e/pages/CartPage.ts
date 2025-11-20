import { element, by, waitFor } from 'detox';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private readonly screenID = 'cart-screen';
  private readonly cartListID = 'cart-item-list';
  private readonly totalAmountID = 'cart-total-amount';
  private readonly totalItemsID = 'cart-total-items';
  private readonly placeOrderButtonID = 'cart-place-order-button';
  private readonly clearCartButtonID = 'cart-clear-button';
  private readonly emptyStateID = 'cart-empty-state';
  private readonly selectClientButtonID = 'cart-select-client-button';
  private readonly selectedClientID = 'cart-selected-client';

  async waitForScreen(): Promise<void> {
    await this.waitForVisible(this.screenID);
  }

  getCartItemID(productId: string): string {
    return `cart-item-${productId}`;
  }

  async removeItem(productId: string): Promise<void> {
    await this.tap(`cart-item-remove-${productId}`);
    await this.tapByText('Delete');
  }

  async incrementQuantity(productId: string): Promise<void> {
    await this.tap(`cart-item-${productId}-qty-increment`);
  }

  async decrementQuantity(productId: string): Promise<void> {
    await this.tap(`cart-item-${productId}-qty-decrement`);
  }

  async setQuantity(productId: string, quantity: number): Promise<void> {
    const quantityInputID = `cart-item-${productId}-qty-input`;
    await this.clearAndType(quantityInputID, quantity.toString());
  }

  async tapSelectClient(): Promise<void> {
    await this.tap(this.selectClientButtonID);
  }

  async tapPlaceOrder(): Promise<void> {
    await this.scrollToElement(this.placeOrderButtonID, this.cartListID);
    await this.tap(this.placeOrderButtonID);
    // Wait for confirmation dialog to appear
    await waitFor(element(by.text('Ready to place your order?')))
      .toBeVisible()
      .withTimeout(3000);
    // Tap the "Confirm" button in the alert dialog
    await this.tapByText('Confirm');
  }

  async tapClearCart(): Promise<void> {
    await this.tap(this.clearCartButtonID);
    await this.tapByText('OK');
  }

  async expectTotalAmount(amount: string): Promise<void> {
    await this.expectText(this.totalAmountID, amount);
  }

  async expectTotalItems(count: string): Promise<void> {
    await this.expectText(this.totalItemsID, count);
  }

  async expectEmptyCart(): Promise<void> {
    await this.expectVisible(this.emptyStateID);
  }

  async expectItemInCart(productId: string): Promise<void> {
    await this.expectVisible(this.getCartItemID(productId));
  }

  async expectItemNotInCart(productId: string): Promise<void> {
    await this.expectNotVisible(this.getCartItemID(productId));
  }

  async expectItemQuantity(productId: string, quantity: string): Promise<void> {
    await this.expectText(`cart-item-quantity-${productId}`, quantity);
  }

  async expectSelectedClient(clientName: string): Promise<void> {
    await this.expectText(this.selectedClientID, clientName);
  }

  async expectPlaceOrderEnabled(): Promise<void> {
    await this.expectEnabled(this.placeOrderButtonID);
  }

  async expectPlaceOrderDisabled(): Promise<void> {
    await this.expectDisabled(this.placeOrderButtonID);
  }
}
