import { BasePage } from '../BasePage';

export class ClientSelectorModal extends BasePage {
  private readonly modalID = 'client-selector-modal';
  private readonly searchInputID = 'client-selector-search';
  private readonly clientListID = 'client-selector-list';
  private readonly cancelButtonID = 'client-selector-cancel';

  async waitForModal(): Promise<void> {
    await this.waitForVisible(this.modalID);
  }

  async searchClient(name: string): Promise<void> {
    await this.clearAndType(this.searchInputID, name);
  }

  async selectClient(name: string): Promise<void> {
    await this.tapByText(name);
  }

  async selectClientByIndex(index: number): Promise<void> {
    await this.tap(`client-selector-item-${index}`);
  }

  async tapCancel(): Promise<void> {
    await this.tap(this.cancelButtonID);
  }
}
