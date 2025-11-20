import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { AddToCartModal } from '../pages/components/AddToCartModal';
import { ClientSelectorModal } from '../pages/components/ClientSelectorModal';
import { BottomTabBar } from '../pages/components/BottomTabBar';

export interface ProductToAdd {
  index: number;
  quantity: number;
}

export class CartFlow {
  private inventoryPage = new InventoryPage();
  private cartPage = new CartPage();
  private addToCartModal = new AddToCartModal();
  private clientSelector = new ClientSelectorModal();
  private tabBar = new BottomTabBar();

  async addProductToCart(productIndex: number, quantity: number): Promise<void> {
    await this.inventoryPage.tapProductByIndex(productIndex);
    await this.addToCartModal.waitForModal();
    await this.addToCartModal.setQuantity(quantity);
    await this.addToCartModal.tapAddToCart();
  }

  async addMultipleProducts(products: ProductToAdd[]): Promise<void> {
    for (const product of products) {
      await this.addProductToCart(product.index, product.quantity);
    }
  }

  async goToCart(): Promise<void> {
    await this.tabBar.navigateToCart();
    await this.cartPage.waitForScreen();
  }

  async selectClientForOrder(clientName: string): Promise<void> {
    await this.cartPage.tapSelectClient();
    await this.clientSelector.waitForModal();
    await this.clientSelector.selectClient(clientName);
  }

  async placeOrder(): Promise<void> {
    await this.cartPage.tapPlaceOrder();
  }

  async checkout(clientName?: string): Promise<void> {
    await this.goToCart();

    if (clientName) {
      await this.selectClientForOrder(clientName);
    }

    await this.placeOrder();
  }

  async clearCart(): Promise<void> {
    await this.goToCart();
    await this.cartPage.tapClearCart();
  }

  async verifyCartTotal(expectedTotal: string): Promise<void> {
    await this.goToCart();
    await this.cartPage.expectTotalAmount(expectedTotal);
  }

  async verifyCartItemCount(count: string): Promise<void> {
    await this.goToCart();
    await this.cartPage.expectTotalItems(count);
  }
}
