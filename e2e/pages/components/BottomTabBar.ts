import { BasePage } from '../BasePage';

export class BottomTabBar extends BasePage {
  private readonly inventoryTabID = 'tab-inventory';
  private readonly cartTabID = 'tab-cart';
  private readonly visitsTabID = 'tab-visits';
  private readonly clientsTabID = 'tab-clients';
  private readonly ordersTabID = 'tab-orders';
  private readonly accountTabID = 'tab-account';
  private readonly cartBadgeID = 'tab-cart-badge';

  async navigateToInventory(): Promise<void> {
    await this.tapByText('Inventory');
  }

  async navigateToCart(): Promise<void> {
    await this.tapByText('Cart');
  }

  async navigateToVisits(): Promise<void> {
    await this.tapByText('Visits');
  }

  async navigateToClients(): Promise<void> {
    await this.tapByText('Clients');
  }

  async navigateToOrders(): Promise<void> {
    await this.tapByText('Orders');
  }

  async navigateToAccount(): Promise<void> {
    await this.tapByText('Account');
  }

  async expectCartBadge(count: string): Promise<void> {
    await this.expectText(this.cartBadgeID, count);
  }
}
