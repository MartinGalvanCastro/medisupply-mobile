import { device, expect, element, by } from 'detox';
import { AuthFlow } from '../../flows/AuthFlow';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { testUsers, invalidCredentials } from '../../fixtures/users';

describe('Login Flow', () => {
  const authFlow = new AuthFlow();
  const loginPage = new LoginPage();
  const inventoryPage = new InventoryPage();

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Successful Login', () => {
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
  });

  describe('Failed Login', () => {
    it('should show error for invalid credentials', async () => {
      await loginPage.waitForScreen();
      await loginPage.login(
        invalidCredentials.email,
        invalidCredentials.password
      );
      await loginPage.expectErrorVisible();
    });

    it('should show validation error for empty email', async () => {
      await loginPage.waitForScreen();
      await loginPage.enterPassword('password123');
      await loginPage.tapSignIn();
      await loginPage.expectSignInButtonDisabled();
    });

    it('should show validation error for invalid email format', async () => {
      await loginPage.waitForScreen();
      await loginPage.enterEmail('invalid-email');
      await loginPage.enterPassword('password123');
      await loginPage.tapSignIn();
      await loginPage.expectErrorVisible();
    });
  });

  describe('Navigation', () => {
    it('should navigate to signup screen', async () => {
      await loginPage.waitForScreen();
      await loginPage.tapSignUpLink();
      await expect(element(by.id('signup-screen'))).toBeVisible();
    });
  });
});
