import { by, element, expect, waitFor } from 'detox';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  private readonly screenID = 'inventory-screen';
  private readonly searchInputID = 'inventory-search-input';
  private readonly filterButtonID = 'inventory-filter-button';
  private readonly warehouseFilterID = 'inventory-warehouse-filter';
  private readonly productListID = 'inventory-product-list';
  private readonly loadingIndicatorID = 'inventory-loading';
  private readonly loadingMoreID = 'inventory-loading-more';
  private readonly emptyStateID = 'inventory-empty-state';
  private readonly refreshControlID = 'inventory-refresh-control';

  async waitForScreen(): Promise<void> {
    await this.waitForVisible(this.screenID);
  }

  async waitForProductsLoaded(): Promise<void> {
    await this.waitForNotVisible(this.loadingIndicatorID);
  }

  async searchProduct(query: string): Promise<void> {
    await this.clearAndType(this.searchInputID, query);
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for debounce
  }

  async clearSearch(): Promise<void> {
    await this.clearText(this.searchInputID);
  }

  async tapFilterButton(): Promise<void> {
    await this.tap(this.filterButtonID);
  }

  async selectFilterType(type: 'name' | 'sku'): Promise<void> {
    await this.tap(this.filterButtonID);
    await this.tapByText(type === 'name' ? 'Name' : 'SKU');
  }

  async selectWarehouse(warehouseName: string): Promise<void> {
    await this.tap(this.warehouseFilterID);
    await this.tapByText(warehouseName);
  }

  getProductCardID(index: number): string {
    return `product-card-${index}`;
  }

  async tapProductByIndex(index: number): Promise<void> {
    const productID = this.getProductCardID(index);
    await this.scrollToElement(productID, this.productListID);
    await this.tap(productID);
  }

  async tapProductByName(name: string): Promise<void> {
    await this.tapByText(name);
  }

  async scrollToProduct(index: number): Promise<void> {
    const productID = this.getProductCardID(index);
    await this.scrollToElement(productID, this.productListID);
  }

  async pullToRefresh(): Promise<void> {
    await this.swipeDown(this.productListID, 'slow');
    await this.waitForNotVisible(this.refreshControlID);
  }

  async scrollToLoadMore(): Promise<void> {
    await this.swipeUp(this.productListID);
    await this.waitForNotVisible(this.loadingMoreID);
  }

  async expectProductVisible(productName: string): Promise<void> {
    await this.expectTextVisible(productName);
  }

  async expectEmptyState(): Promise<void> {
    await this.expectVisible(this.emptyStateID);
  }

  async expectProductCount(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.expectToExist(this.getProductCardID(i));
    }
  }
}
