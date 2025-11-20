import { device } from 'detox';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { AccountPage } from '../pages/AccountPage';
import { BottomTabBar } from '../pages/components/BottomTabBar';

export class AuthFlow {
  private loginPage = new LoginPage();
  private inventoryPage = new InventoryPage();
  private accountPage = new AccountPage();
  private tabBar = new BottomTabBar();

  async loginAsClient(email: string, password: string): Promise<void> {
    await this.loginPage.waitForScreen();
    await this.loginPage.login(email, password);
    await this.inventoryPage.waitForScreen();
  }

  async loginAsSeller(email: string, password: string): Promise<void> {
    await this.loginPage.waitForScreen();
    await this.loginPage.login(email, password);
    await this.inventoryPage.waitForScreen();
  }

  async logout(): Promise<void> {
    await this.tabBar.navigateToAccount();
    await this.accountPage.waitForScreen();
    await this.accountPage.tapLogout();
    await this.loginPage.waitForScreen();
  }

  async resetApp(): Promise<void> {
    await device.reloadReactNative();
  }
}
