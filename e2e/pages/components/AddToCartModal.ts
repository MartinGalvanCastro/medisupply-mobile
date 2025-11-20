import { device, element, by, waitFor } from 'detox';
import { BasePage } from '../BasePage';

export class AddToCartModal extends BasePage {
  private readonly modalID = 'add-to-cart-modal';
  private readonly productNameID = 'add-to-cart-product-name';
  private readonly quantityInputID = 'add-to-cart-input';
  private readonly incrementButtonID = 'add-to-cart-increment';
  private readonly decrementButtonID = 'add-to-cart-decrement';
  private readonly subtotalID = 'add-to-cart-subtotal';
  private readonly addButtonID = 'add-to-cart-confirm-button';
  private readonly cancelButtonID = 'add-to-cart-cancel-button';

  async waitForModal(): Promise<void> {
    // React Native Modal doesn't expose testID to native layer
    // Wait for the confirm button inside the modal instead
    await this.waitForVisible(this.addButtonID);
  }

  async setQuantity(quantity: number): Promise<void> {
    // Use increment buttons instead of direct input for better reliability
    // Default quantity is 1, so we need (quantity - 1) increments
    const increments = quantity - 1;
    if (increments > 0) {
      await this.incrementQuantity(increments);
    }
  }

  async incrementQuantity(times = 1): Promise<void> {
    await device.disableSynchronization();
    for (let i = 0; i < times; i++) {
      await this.tap(this.incrementButtonID);
    }
    await device.enableSynchronization();
  }

  async decrementQuantity(times = 1): Promise<void> {
    await device.disableSynchronization();
    for (let i = 0; i < times; i++) {
      await this.tap(this.decrementButtonID);
    }
    await device.enableSynchronization();
  }

  async tapAddToCart(): Promise<void> {
    // Disable sync to avoid "app is busy" due to TextInput keyboard processing
    await device.disableSynchronization();
    await this.tap(this.addButtonID);
    await device.enableSynchronization();
    // Wait for modal to close
    await this.waitForNotVisible(this.addButtonID);
    // Dismiss the native "Added to Cart" alert
    // Wait for alert to appear, then tap OK button
    await waitFor(element(by.text('OK')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.text('OK')).tap();
  }

  async tapCancel(): Promise<void> {
    // Disable sync to avoid "app is busy" due to TextInput keyboard processing
    await device.disableSynchronization();
    await this.tap(this.cancelButtonID);
    await device.enableSynchronization();
  }

  async expectProductName(name: string): Promise<void> {
    await this.expectText(this.productNameID, name);
  }

  async expectSubtotal(amount: string): Promise<void> {
    await this.expectText(this.subtotalID, amount);
  }

  async expectQuantity(quantity: string): Promise<void> {
    await this.expectText(this.quantityInputID, quantity);
  }

  async expectAddButtonEnabled(): Promise<void> {
    await this.expectEnabled(this.addButtonID);
  }

  async expectAddButtonDisabled(): Promise<void> {
    await this.expectDisabled(this.addButtonID);
  }
}
