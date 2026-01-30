import { test, expect } from '../../fixtures/test-fixtures';
import { Logger } from '../../utils/logger';
import testConfig from '../../config/test-config';

test.describe('Dashboard Navigation', () => {
  // Sign in before each test
  test.beforeEach(async ({ signInPage, dashboardPage: _dashboardPage }) => {
    Logger.info('Setting up: Signing in user');

    await signInPage.navigateToHome();
    await signInPage.page.click('a:has-text("Sign In")');
    await signInPage.signIn(
      testConfig.testUsers.validUser.email,
      testConfig.testUsers.validUser.password,
      true
    );

    // Wait for dashboard to load
    await signInPage.page.waitForURL('**/dashboard');
    Logger.success('User signed in, on dashboard');
  });

  test('should display all functioning navigation links on dashboard', async ({
    dashboardPage,
  }) => {
    Logger.testStart('Verify Dashboard Navigation Links');

    try {
      Logger.step(1, 'Verify all sidebar navigation links are visible');

      await expect(await dashboardPage.verifyDashboardLink()).toBeVisible();
      await expect(await dashboardPage.verifyOrganizationLink()).toBeVisible();
      await expect(await dashboardPage.verifyUsersLink()).toBeVisible();

      Logger.success('All navigation links are visible');
      Logger.testEnd('Verify Dashboard Navigation Links', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Verify Dashboard Navigation Links', false);
      throw error;
    }
  });

  test('should navigate to Organization page', async ({ dashboardPage }) => {
    Logger.testStart('Navigate to Organization Page');

    try {
      Logger.step(1, 'Click Organization link');
      await dashboardPage.navigateToOrganization();

      Logger.step(2, 'Verify navigation to Organization page');
      await expect(dashboardPage.page).toHaveURL(/\/organization/);

      Logger.step(3, 'Verify Organization link is active');
      const isActive = await dashboardPage.isOrganizationLinkActive();
      expect(isActive).toBe(true);

      Logger.success('Successfully navigated to Organization page');
      Logger.testEnd('Navigate to Organization Page', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Navigate to Organization Page', false);
      throw error;
    }
  });

  test('should navigate to Users page', async ({ dashboardPage }) => {
    Logger.testStart('Navigate to Users Page');

    try {
      Logger.step(1, 'Click Users link');
      await dashboardPage.navigateToUsers();

      Logger.step(2, 'Verify navigation to Users page');
      await expect(dashboardPage.page).toHaveURL(/\/members/);

      Logger.step(3, 'Verify Users link is active');
      const isActive = await dashboardPage.isUsersLinkActive();
      expect(isActive).toBe(true);

      Logger.success('Successfully navigated to Users page');
      Logger.testEnd('Navigate to Users Page', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Navigate to Users Page', false);
      throw error;
    }
  });

  test('should display Create button on Organization page', async ({ dashboardPage }) => {
    Logger.testStart('Verify Create Button on Organization Page');

    try {
      Logger.step(1, 'Navigate to Organization page');
      await dashboardPage.navigateToOrganization();

      Logger.step(2, 'Verify Create button is visible');

      // Use the specific locator from DashboardPage
      const isVisible = await dashboardPage.isCreateButtonVisible();
      expect(isVisible).toBe(true);

      Logger.success('Create button is visible on Organization page');
      Logger.testEnd('Verify Create Button on Organization Page', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Verify Create Button on Organization Page', false);
      throw error;
    }
  });
});
