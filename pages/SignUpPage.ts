import { Page, Locator } from '@playwright/test';
import { Logger } from '../utils/logger';
import { UserData } from '../utils/test-data-generator';

export class SignUpPage {
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly passwordConfirmationInput: Locator;
  private readonly createAccountButton: Locator;
  private readonly signUpTitle: Locator;

  constructor(public page: Page) {
    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.passwordConfirmationInput = page.locator('#password_confirmation');
    this.createAccountButton = page.getByRole('button', { name: 'Create an account' });
    this.signUpTitle = page.getByText('Sign Up', { exact: true });
  }

  async fillFirstName(firstName: string): Promise<void> {
    Logger.info(`Filling first name with: ${firstName}`);
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string): Promise<void> {
    Logger.info(`Filling last name with: ${lastName}`);
    await this.lastNameInput.fill(lastName);
  }

  async fillEmail(email: string): Promise<void> {
    Logger.info(`Filling email with: ${email}`);
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    Logger.info(`Filling password`);
    await this.passwordInput.fill(password);
  }

  async fillPasswordConfirmation(password: string): Promise<void> {
    Logger.info(`Filling password confirmation`);
    await this.passwordConfirmationInput.fill(password);
  }

  async clickCreateAccount(): Promise<void> {
    Logger.info('Clicking Create Account button');
    await this.createAccountButton.click();
  }

  async signUp(userData: UserData): Promise<void> {
    Logger.step(1, 'Fill in sign up form');
    Logger.info(`Registering user: ${userData.email}`);

    await this.fillFirstName(userData.firstName);
    await this.fillLastName(userData.lastName);
    await this.fillEmail(userData.email);
    await this.fillPassword(userData.password);
    await this.fillPasswordConfirmation(userData.password);

    Logger.step(2, 'Submit sign up form');
    await this.clickCreateAccount();
  }

  async verifySignUpTitle(): Promise<Locator> {
    Logger.info('Verifying Sign Up title');
    return this.signUpTitle;
  }

  async isOnSignUpPage(): Promise<boolean> {
    try {
      await this.signUpTitle.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
