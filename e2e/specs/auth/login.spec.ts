import { device, expect, element, by } from 'detox';
import { AuthFlow } from '../../flows/AuthFlow';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { testUsers } from '../../fixtures/users';

describe('Login Flow', () => {
  const authFlow = new AuthFlow();
  const loginPage = new LoginPage();
  const inventoryPage = new InventoryPage();

  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
  });

  afterEach(async () => {
    try {
      await authFlow.logout();
    } catch {
      // Might not be logged in or already on login screen
    }
  });

  it('should login successfully as client', async () => {
    await authFlow.loginAsClient(
      testUsers.client.email,
      testUsers.client.password
    );
    await inventoryPage.waitForScreen();
  });

  it('should login successfully as seller', async () => {
    await authFlow.loginAsSeller(
      testUsers.seller.email,
      testUsers.seller.password
    );
    await inventoryPage.waitForScreen();
  });

  it('should navigate to signup screen', async () => {
    await loginPage.waitForScreen();
    await loginPage.tapSignUpLink();
    await expect(element(by.id('signup-screen'))).toBeVisible();
  });
});
