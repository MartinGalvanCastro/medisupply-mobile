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
    await this.waitForVisible(this.modalID);
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.clearAndType(this.quantityInputID, quantity.toString());
  }

  async incrementQuantity(times = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.tap(this.incrementButtonID);
    }
  }

  async decrementQuantity(times = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.tap(this.decrementButtonID);
    }
  }

  async tapAddToCart(): Promise<void> {
    await this.tap(this.addButtonID);
  }

  async tapCancel(): Promise<void> {
    await this.tap(this.cancelButtonID);
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
