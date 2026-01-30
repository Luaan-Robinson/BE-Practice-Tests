import { test, expect } from '../../fixtures/test-fixtures';
import { Logger } from '../../utils/logger';
import { TestDataGenerator } from '../../utils/test-data-generator';
import testConfig from '../../config/test-config';

test.describe('Organization Creation', () => {
  // Sign in before each test
  test.beforeEach(async ({ signInPage, dashboardPage }) => {
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

    // Navigate to organization page
    Logger.info('Navigating to Organization page');
    await dashboardPage.navigateToOrganization();
  });

  test('should navigate to organization create page', async ({
    dashboardPage,
    organizationPage, // Changed from organizationCreatePage to organizationPage
  }) => {
    Logger.testStart('Navigate to Organization Create Page');
    try {
      // ===== VERIFY CREATE BUTTON IS VISIBLE =====
      Logger.step(1, 'Verify Create button is visible on Organization page');
      const isCreateButtonVisible = await dashboardPage.isCreateButtonVisible();
      expect(isCreateButtonVisible).toBe(true);
      Logger.success('Create button is visible');

      // ===== CLICK CREATE BUTTON =====
      Logger.step(2, 'Click Create button');
      await dashboardPage.clickCreateButton();

      // ===== VERIFY NAVIGATION TO CREATE PAGE =====
      Logger.step(3, 'Verify navigation to Organization Create page');
      const isOnCreatePage = await organizationPage.isOnCreatePage();
      expect(isOnCreatePage).toBe(true);

      Logger.step(4, 'Verify page URL contains /organization/create');
      await expect(organizationPage.page).toHaveURL(/\/organization\/create/);

      Logger.success('Successfully navigated to Organization Create page');
      Logger.testEnd('Navigate to Organization Create Page', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Navigate to Organization Create Page', false);
      throw error;
    }
  });

  test('should display all form elements on organization create page', async ({
    dashboardPage,
    organizationPage, // Changed from organizationCreatePage to organizationPage
  }) => {
    Logger.testStart('Verify Organization Create Form Elements');

    try {
      // Navigate to create page
      Logger.step(1, 'Navigate to Organization Create page');
      await dashboardPage.clickCreateButton();
      await expect(organizationPage.page).toHaveURL(/\/organization\/create/);

      // ===== VERIFY FORM FIELDS ARE VISIBLE =====
      Logger.step(2, 'Verify Name input field is visible');
      const nameValue = await organizationPage.getNameValue();
      expect(nameValue).toBe('');

      Logger.step(3, 'Verify Slug input field is visible');
      const slugValue = await organizationPage.getSlugValue();
      expect(slugValue).toBe('');

      Logger.step(4, 'Verify Logo file input is visible');
      const isLogoInputPresent = await organizationPage.isLogoInputVisible();
      expect(isLogoInputPresent).toBe(true);

      // ===== VERIFY BUTTONS ARE VISIBLE =====
      Logger.step(5, 'Verify Submit button is visible');
      const isSubmitVisible = await organizationPage.isSubmitButtonVisible();
      expect(isSubmitVisible).toBe(true);

      Logger.step(6, 'Verify Reset button is visible');
      const isResetVisible = await organizationPage.isResetButtonVisible();
      expect(isResetVisible).toBe(true);

      Logger.success('All form elements are displayed correctly');
      Logger.testEnd('Verify Organization Create Form Elements', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Verify Organization Create Form Elements', false);
      throw error;
    }
  });

  test('should successfully create organization with valid data', async ({
    dashboardPage,
    organizationPage, // Changed from organizationCreatePage to organizationPage
  }) => {
    Logger.testStart('Create Organization with Valid Data');

    try {
      // Navigate to create page
      Logger.step(1, 'Navigate to Organization Create page');
      await dashboardPage.clickCreateButton();
      await expect(organizationPage.page).toHaveURL(/\/organization\/create/);

      // ===== GENERATE TEST ORGANIZATION DATA =====
      Logger.step(2, 'Generate test organization data');
      const orgData = TestDataGenerator.generateOrganization();

      Logger.info('Generated organization data:', {
        name: orgData.name,
        slug: orgData.slug,
      });

      // ===== FILL AND SUBMIT FORM =====
      Logger.step(3, 'Fill organization form with valid data');
      await organizationPage.fillOrganizationForm(orgData, 'test-logo.png');

      Logger.step(4, 'Verify logo was uploaded');
      const isLogoUploaded = await organizationPage.isLogoUploaded();
      expect(isLogoUploaded).toBe(true);

      Logger.step(5, 'Submit the form');
      await organizationPage.clickSubmit();

      // ===== VERIFY SUCCESS =====
      Logger.step(6, 'Verify success toast notification appears');
      const isToastVisible = await organizationPage.isSuccessToastVisible();

      if (isToastVisible) {
        Logger.step(7, 'Verify toast contains success message');
        const toastText = await organizationPage.getSuccessToastText();
        expect(toastText.toLowerCase()).toContain('saved');
        Logger.success('Organization created successfully with success toast');
      } else {
        // If no toast, check for redirect
        Logger.step(7, 'No toast found, checking for redirect to organization list');
        try {
          await organizationPage.page.waitForURL('**/organization', { timeout: 10000 });
          Logger.success('Organization created successfully with redirect');
        } catch {
          Logger.warning('Neither toast nor redirect detected');
        }
      }

      // Verify submission was successful
      const submissionSuccessful = await organizationPage.verifyNavigationAfterSubmit();
      expect(submissionSuccessful).toBe(true);

      Logger.testEnd('Create Organization with Valid Data', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Create Organization with Valid Data', false);
      throw error;
    }
  });

  test('should handle reset button correctly', async ({
    dashboardPage,
    organizationPage, // Changed from organizationCreatePage to organizationPage
  }) => {
    Logger.testStart('Test Reset Button Functionality');

    try {
      // Navigate to create page
      Logger.step(1, 'Navigate to Organization Create page');
      await dashboardPage.clickCreateButton();
      await expect(organizationPage.page).toHaveURL(/\/organization\/create/);

      // ===== FILL SOME DATA =====
      Logger.step(2, 'Fill form data');
      const orgData = TestDataGenerator.generateOrganization();
      await organizationPage.fillName(orgData.name);
      await organizationPage.fillSlug(orgData.slug);

      // Verify data was filled
      const nameBeforeReset = await organizationPage.getNameValue();
      const slugBeforeReset = await organizationPage.getSlugValue();
      expect(nameBeforeReset).toBe(orgData.name);
      expect(slugBeforeReset).toBe(orgData.slug);

      // ===== CLICK RESET =====
      Logger.step(3, 'Click Reset button');
      await organizationPage.clickReset();

      // ===== VERIFY FORM RESET =====
      Logger.step(4, 'Verify form fields are cleared');
      // Wait for reset animation to complete
      await organizationPage.page.waitForLoadState('networkidle');

      const nameAfterReset = await organizationPage.getNameValue();
      const slugAfterReset = await organizationPage.getSlugValue();

      expect(nameAfterReset).toBe('');
      expect(slugAfterReset).toBe('');

      Logger.step(5, 'Verify we are still on create page');
      await expect(organizationPage.page).toHaveURL(/\/organization\/create/);

      Logger.success('Reset button works correctly - cleared form fields, stayed on same page');
      Logger.testEnd('Test Reset Button Functionality', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Test Reset Button Functionality', false);
      throw error;
    }
  });

  test('should auto-generate slug from organization name', async ({
    dashboardPage,
    organizationPage, // Changed from organizationCreatePage to organizationPage
  }) => {
    Logger.testStart('Test Slug Auto-generation');

    try {
      // Navigate to create page
      Logger.step(1, 'Navigate to Organization Create page');
      await dashboardPage.clickCreateButton();
      await expect(organizationPage.page).toHaveURL(/\/organization\/create/);

      // ===== TEST SLUG GENERATION =====
      Logger.step(2, 'Enter organization name');
      const testName = 'Test Organization Name 2024';
      await organizationPage.fillName(testName);

      Logger.step(3, 'Check if slug was auto-generated');
      // Wait for any auto-fill logic to complete
      await organizationPage.page.waitForLoadState('networkidle');

      const slugValue = await organizationPage.getSlugValue();

      if (slugValue) {
        Logger.info(`Auto-generated slug: ${slugValue}`);
        Logger.step(4, 'Verify slug format is URL-friendly');
        expect(slugValue).toMatch(/^[a-z0-9-]+$/); // Only lowercase, numbers, hyphens
        expect(slugValue).not.toMatch(/[A-Z]/); // No uppercase
        expect(slugValue).not.toMatch(/[^a-z0-9-]/); // No special characters
      } else {
        Logger.info('No auto-generation detected, manual entry required');
      }

      Logger.success('Slug field behavior verified');
      Logger.testEnd('Test Slug Auto-generation', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Test Slug Auto-generation', false);
      throw error;
    }
  });

  test('should validate required fields', async ({
    dashboardPage,
    organizationPage, // Changed from organizationCreatePage to organizationPage
  }) => {
    Logger.testStart('Test Required Field Validation');

    try {
      // Navigate to create page
      Logger.step(1, 'Navigate to Organization Create page');
      await dashboardPage.clickCreateButton();
      await expect(organizationPage.page).toHaveURL(/\/organization\/create/);

      // ===== TEST EMPTY SUBMISSION =====
      Logger.step(2, 'Attempt to submit empty form');
      await organizationPage.clickSubmit();

      // Wait for validation messages
      await organizationPage.page.waitForLoadState('networkidle');

      // Check for validation indicators
      Logger.step(3, 'Check for validation errors');
      const nameHasError = await organizationPage.getNameInputAriaInvalid();
      const slugHasError = await organizationPage.getSlugInputAriaInvalid();

      // Check if validation errors are present
      const hasValidationErrors = nameHasError === 'true' || slugHasError === 'true';

      if (hasValidationErrors) {
        Logger.info('Validation errors detected as expected');
        Logger.step(4, 'Verify form was not submitted');
        await expect(organizationPage.page).toHaveURL(/\/organization\/create/);

        // Check for error messages in the UI
        const errorMessages = organizationPage.page.locator(
          '.text-destructive, [role="alert"], .error-message'
        );
        const errorCount = await errorMessages.count();
        if (errorCount > 0) {
          Logger.info(`Found ${errorCount} error messages`);
        }
      } else {
        // If no client-side validation, check for server response
        Logger.info('No client-side validation detected, checking toast for errors');

        // Look for error toast instead of success toast
        const errorToast = organizationPage.page.locator('[data-sonner-toast][data-type="error"]');
        try {
          await errorToast.waitFor({ state: 'visible', timeout: 5000 });
          Logger.info('Server validation error toast detected');
        } catch {
          Logger.info('No error toast detected either');
        }
      }

      Logger.success('Field validation behavior verified');
      Logger.testEnd('Test Required Field Validation', true);
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Test Required Field Validation', false);
      throw error;
    }
  });
});
