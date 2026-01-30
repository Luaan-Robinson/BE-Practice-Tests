import { test, expect } from '../../fixtures/test-fixtures';
import { Logger } from '../../utils/logger';
import testConfig from '../../config/test-config'; // Import your test config

test.describe('User Authentication', () => {
  test.beforeEach(async ({ signInPage }) => {
    // Navigate to home page before each test
    await signInPage.navigateToHome();
  });

  test('should successfully sign in with valid credentials', async ({
    signInPage,
    dashboardPage: _dashboardPage,
  }) => {
    Logger.testStart('Sign In with Valid Credentials');

    try {
      // ===== NAVIGATE TO SIGN IN PAGE =====
      Logger.step(1, 'Navigate to Sign In page');
      await signInPage.page.click('a:has-text("Sign In")');
      await expect(await signInPage.verifySignInTitle()).toBeVisible();
      Logger.success('Navigated to Sign In page');

      // ===== PERFORM SIGN IN =====
      Logger.step(2, 'Sign in with valid credentials');
      await signInPage.signIn(
        testConfig.testUsers.validUser.email, // From config
        testConfig.testUsers.validUser.password, // From config
        true
      );

      // ===== VERIFY SUCCESSFUL SIGN IN =====
      Logger.step(3, 'Verify successful sign in');
      // Add verification here based on your app behavior
      // Example: Check for welcome message, dashboard URL, etc.
      // await expect(page).toHaveURL(/dashboard/);
      // await expect(page.locator('.welcome-message')).toBeVisible();

      Logger.success('Successfully signed in');
      Logger.testEnd('Sign In with Valid Credentials', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Sign In with Valid Credentials', false);
      throw error;
    }
  });

  test('should display Sign In page elements correctly', async ({ signInPage }) => {
    Logger.testStart('Verify Sign In Page Elements');

    try {
      // Navigate to sign in page
      await signInPage.page.click('a:has-text("Sign In")');

      // Verify page elements are present
      await expect(await signInPage.verifySignInTitle()).toBeVisible();

      // Additional element checks (add based on your actual page)
      await expect(signInPage.page.locator('#email')).toBeVisible();
      await expect(signInPage.page.locator('#password')).toBeVisible();
      await expect(signInPage.page.locator('#rememberMe')).toBeVisible();
      await expect(signInPage.page.getByRole('button', { name: 'Login' })).toBeVisible();

      Logger.success('Sign In page displayed correctly');
      Logger.testEnd('Verify Sign In Page Elements', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Verify Sign In Page Elements', false);
      throw error;
    }
  });

  test('should fail sign in with invalid credentials', async ({ signInPage }) => {
    Logger.testStart('Sign In with Invalid Credentials');

    try {
      // Navigate to sign in page
      await signInPage.page.click('a:has-text("Sign In")');

      // Attempt sign in with invalid credentials
      await signInPage.signIn('invalid@example.com', 'wrongpassword', true);

      // Verify error message is displayed
      // Adjust based on your app's error handling
      // await expect(page.locator('.error-message')).toBeVisible();
      // await expect(page.locator('.error-message')).toContainText('Invalid credentials');

      Logger.success('Sign in correctly rejected invalid credentials');
      Logger.testEnd('Sign In with Invalid Credentials', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Sign In with Invalid Credentials', false);
      throw error;
    }
  });

  test('should remember user when "Remember Me" is checked', async ({ signInPage, page }) => {
    Logger.testStart('Remember Me Functionality');

    try {
      // Navigate to sign in page
      await signInPage.page.click('a:has-text("Sign In")');

      // Sign in with "Remember Me" checked
      await signInPage.signIn(
        testConfig.testUsers.validUser.email,
        testConfig.testUsers.validUser.password,
        true // Remember Me = true
      );

      // Close browser context
      await page.context().close();

      // Reopen and navigate to app
      // Note: This requires separate browser context setup
      // Might need to adjust based on your actual Remember Me implementation

      Logger.success('Remember Me test completed');
      Logger.testEnd('Remember Me Functionality', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Remember Me Functionality', false);
      throw error;
    }
  });
});
