import { test as base } from '@playwright/test';
import { SignInPage } from '../pages/SignInPage';
import { SignUpPage } from '../pages/SignUpPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import testConfig from '../config/test-config';
import { Logger } from '../utils/logger';

type CustomFixtures = {
  signInPage: SignInPage;
  signUpPage: SignUpPage;
  dashboardPage: DashboardPage;
  organizationPage: OrganizationPage;
  authenticatedPage: void; // This fixture performs authentication automatically
};

export const test = base.extend<CustomFixtures>({
  signInPage: async ({ page }, use) => {
    const signInPage = new SignInPage(page);
    await use(signInPage);
  },

  signUpPage: async ({ page }, use) => {
    const signUpPage = new SignUpPage(page);
    await use(signUpPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  organizationPage: async ({ page }, use) => {
    const organizationPage = new OrganizationPage(page);
    await use(organizationPage);
  },

  /**
   * Authenticated Page Fixture
   * Automatically signs in the user before the test runs
   * Use this for tests that require authentication
   */
  authenticatedPage: async ({ page }, use) => {
    Logger.info('🔐 Setting up authenticated session');

    const signInPage = new SignInPage(page);

    // Navigate and sign in
    await signInPage.navigateToHome();
    await page.click('a:has-text("Sign In")');
    await signInPage.signIn(
      testConfig.testUsers.validUser.email,
      testConfig.testUsers.validUser.password,
      true
    );

    // Wait for dashboard to confirm successful login
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    Logger.success('✅ User authenticated and on dashboard');

    await use();

    // Cleanup after test (optional)
    // await page.context().clearCookies();
  },
});

export { expect } from '@playwright/test';