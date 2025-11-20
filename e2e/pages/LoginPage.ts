import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly screenID = 'login-screen';
  private readonly emailInputID = 'login-email-input';
  private readonly passwordInputID = 'login-password-input';
  private readonly signInButtonID = 'login-sign-in-button';
  private readonly signUpLinkID = 'login-sign-up-link';
  private readonly errorMessageID = 'login-error-message';
  private readonly loadingIndicatorID = 'login-loading';

  async waitForScreen(): Promise<void> {
    await this.waitForVisible(this.screenID);
  }

  async waitForLoading(): Promise<void> {
    await this.waitForVisible(this.loadingIndicatorID);
  }

  async waitForLoadingComplete(): Promise<void> {
    await this.waitForNotVisible(this.loadingIndicatorID);
  }

  async enterEmail(email: string): Promise<void> {
    await this.clearAndType(this.emailInputID, email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.clearAndType(this.passwordInputID, password);
  }

  async tapSignIn(): Promise<void> {
    await this.dismissKeyboard();
    await this.tap(this.signInButtonID);
  }

  async tapSignUpLink(): Promise<void> {
    await this.tap(this.signUpLinkID);
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.tapSignIn();
  }

  async expectErrorVisible(): Promise<void> {
    await this.expectVisible(this.errorMessageID);
  }

  async expectErrorMessage(message: string): Promise<void> {
    await this.expectText(this.errorMessageID, message);
  }

  async expectSignInButtonEnabled(): Promise<void> {
    await this.expectEnabled(this.signInButtonID);
  }

  async expectSignInButtonDisabled(): Promise<void> {
    await this.expectDisabled(this.signInButtonID);
  }
}
