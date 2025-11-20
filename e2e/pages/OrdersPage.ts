import { BasePage } from './BasePage';

export class OrdersPage extends BasePage {
  private readonly screenID = 'orders-screen';
  private readonly orderListID = 'orders-list';
  private readonly loadingID = 'orders-loading';
  private readonly emptyStateID = 'orders-empty-state';
  private readonly togglePastOrdersID = 'orders-toggle-past';
  private readonly showingPastIndicatorID = 'orders-showing-past';

  async waitForScreen(): Promise<void> {
    await this.waitForVisible(this.screenID);
  }

  async waitForOrdersLoaded(): Promise<void> {
    await this.waitForNotVisible(this.loadingID);
  }

  getOrderCardID(index: number): string {
    return `order-card-${index}`;
  }

  async tapOrderByIndex(index: number): Promise<void> {
    const orderID = this.getOrderCardID(index);
    await this.scrollToElement(orderID, this.orderListID);
    await this.tap(orderID);
  }

  async togglePastOrders(): Promise<void> {
    await this.tap(this.togglePastOrdersID);
  }

  async expandOrderDetails(index: number): Promise<void> {
    await this.tap(`${this.getOrderCardID(index)}-expand`);
  }

  async expectOrderVisible(orderId: string): Promise<void> {
    await this.expectTextVisible(orderId);
  }

  async expectEmptyState(): Promise<void> {
    await this.expectVisible(this.emptyStateID);
  }

  async expectShowingPastOrders(): Promise<void> {
    await this.expectVisible(this.showingPastIndicatorID);
  }

  async expectOrderStatus(index: number, status: string): Promise<void> {
    await this.expectText(`${this.getOrderCardID(index)}-status`, status);
  }
}
