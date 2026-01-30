import { Page, Locator } from '@playwright/test';
import { Logger } from '../utils/logger';

export class SignInPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly loginButton: Locator;
  private readonly signInTitle: Locator;
  private readonly signUpTab: Locator;

  constructor(public page: Page) {
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.rememberMeCheckbox = page.locator('#rememberMe');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.signInTitle = page.locator('[data-slot="card-title"]');
    this.signUpTab = page.getByRole('tab', { name: 'Sign Up' });
  }

  async fillEmail(email: string): Promise<void> {
    Logger.info(`Filling email with: ${email}`);
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    Logger.info(`Filling password`);
    await this.passwordInput.fill(password);
  }

  //Toggles Remember Me checkbox on the Sign in page
  async toggleRememberMe(check: boolean = true): Promise<void> {
    const isChecked = await this.rememberMeCheckbox.isChecked();

    if (check && !isChecked) {
      Logger.info('Checking Remember Me checkbox');
      await this.rememberMeCheckbox.check();
    } else if (!check && isChecked) {
      Logger.info('Unchecking Remember Me checkbox');
      await this.rememberMeCheckbox.uncheck();
    }
  }

  async clickLogin(): Promise<void> {
    Logger.info('Clicking Login button');
    await this.loginButton.click();
  }

  async signIn(email: string, password: string, rememberMe: boolean = true): Promise<void> {
    Logger.step(1, 'Fill in sign in credentials');
    await this.fillEmail(email);
    await this.fillPassword(password);

    if (rememberMe) {
      await this.toggleRememberMe(true);
    }

    Logger.step(2, 'Submit sign in form');
    await this.clickLogin();
  }

  async navigateToSignUp(): Promise<void> {
    Logger.step(1, 'Click Sign Up tab');
    Logger.info('Clicking Sign Up tab');
    await this.signUpTab.click();
  }

  async verifySignInTitle(): Promise<Locator> {
    Logger.info('Verifying Sign In title');
    return this.signInTitle;
  }

  async getSignInTitleText(): Promise<string> {
    return (await this.signInTitle.textContent()) || '';
  }

  async isOnSignInPage(): Promise<boolean> {
    try {
      await this.signInTitle.waitFor({ state: 'visible', timeout: 5000 });
      const titleText = await this.getSignInTitleText();
      return titleText.includes('Sign In');
    } catch {
      return false;
    }
  }

  async navigateToHome(): Promise<void> {
    await this.page.goto('/'); // Playwright uses baseURL from config
  }
}
