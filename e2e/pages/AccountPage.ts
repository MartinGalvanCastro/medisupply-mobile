import { BasePage } from './BasePage';

export class AccountPage extends BasePage {
  private readonly screenID = 'account-screen';
  private readonly scrollViewID = 'account-scroll';
  private readonly logoutButtonID = 'account-logout-button';
  private readonly userEmailID = 'account-user-email';
  private readonly userTypeBadgeID = 'account-user-type';

  async waitForScreen(): Promise<void> {
    await this.waitForVisible(this.screenID);
  }

  async tapLogout(): Promise<void> {
    // Scroll down and tap logout button
    await this.tap(this.logoutButtonID);
  }

  async expectUserEmail(email: string): Promise<void> {
    await this.expectText(this.userEmailID, email);
  }

  async expectUserType(type: string): Promise<void> {
    await this.expectText(this.userTypeBadgeID, type);
  }
}
