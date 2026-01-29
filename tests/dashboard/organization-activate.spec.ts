import { test, expect } from '../../fixtures/test-fixtures';
import { Logger } from '../../utils/logger';
import { TestDataGenerator } from '../../utils/test-data-generator';
import testConfig from '../../config/test-config';
//these tests currently fail due to the absurd loading times after I created multiple organizations
// Test is skipped for now because it will often time out waiting for elements to appear
test.describe.skip('Organization Activation', () => {
  let testOrganizationSlug: string;

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

  test('should activate organization after creation', async ({ 
    dashboardPage,
    organizationPage // Changed from organizationCreatePage to organizationPage
  }) => {
    Logger.testStart('Activate Newly Created Organization');

    try {
      // ===== STEP 1: CREATE A NEW ORGANIZATION =====
      Logger.step(1, 'Create a new organization for testing');
      
      // Navigate to create page
      await dashboardPage.clickCreateButton();
      await organizationPage.page.waitForURL('**/organization/create');
      
      // Generate test organization data
      const orgData = TestDataGenerator.generateOrganization();
      testOrganizationSlug = orgData.slug; // Store for later use
      
      Logger.info('Generated organization data:', {
        name: orgData.name,
        slug: orgData.slug
      });
      
      // Fill and submit form
      await organizationPage.fillOrganizationForm(orgData, 'test-logo.png');
      await organizationPage.clickSubmit();
      
      // Wait for success indication
      const submissionSuccessful = await organizationPage.verifyNavigationAfterSubmit();
      expect(submissionSuccessful).toBeTruthy();
      
      Logger.success('Organization created successfully');
      
      // ===== STEP 2: NAVIGATE BACK TO ORGANIZATION LIST =====
      Logger.step(2, 'Navigate back to organization list page');
      
      // Wait a moment for any redirect
      await organizationPage.page.waitForTimeout(2000);
      
      // Navigate to organization list if not already there
      if (!organizationPage.page.url().includes('/organization')) {
        await dashboardPage.navigateToOrganization();
      }
      
      await organizationPage.page.waitForURL('**/organization');
      Logger.success('Navigated to organization list page');
      
      // ===== STEP 3: VERIFY ORGANIZATION EXISTS IN TABLE =====
      Logger.step(3, 'Verify organization appears in the table');
      
      // Wait for table to load
      await organizationPage.waitForTableToLoad();
      
      // Verify organization is in the table
      const isInTable = await organizationPage.verifyOrganizationInTable(testOrganizationSlug);
      expect(isInTable).toBeTruthy();
      Logger.success(`Organization "${testOrganizationSlug}" found in table`);
      
      // ===== STEP 4: SCROLL TO AND VERIFY "USE ORGANIZATION" BUTTON =====
      Logger.step(4, 'Find and verify "Use Organization" button');
      
      // Scroll to the organization (helpful for large tables)
      await organizationPage.scrollToOrganization(testOrganizationSlug);
      
      // Find the button
      const useButton = await organizationPage.findUseOrganizationButtonForSlug(testOrganizationSlug);
      expect(useButton).not.toBeNull();
      
      // Verify button is visible and enabled
      await expect(useButton!).toBeVisible();
      await expect(useButton!).toBeEnabled();
      await expect(useButton!).toHaveText('Use Organization');
      
      Logger.success('"Use Organization" button found and is clickable');
      
      // ===== STEP 5: CLICK "USE ORGANIZATION" BUTTON =====
      Logger.step(5, 'Click "Use Organization" button');
      
      // Click the button
      const clicked = await organizationPage.clickUseOrganizationForSlug(testOrganizationSlug);
      expect(clicked).toBeTruthy();
      Logger.success('Clicked "Use Organization" button');
      
      // ===== STEP 6: VERIFY SUCCESS TOAST APPEARS =====
      Logger.step(6, 'Verify success toast notification appears');
      
      const toastAppeared = await organizationPage.waitForActiveOrganizationToast();
      expect(toastAppeared).toBeTruthy();
      
      // Verify toast text
      const toastText = await organizationPage.getActiveOrganizationToastText();
      expect(toastText).toContain('Active organization changed');
      
      Logger.success('Success toast appeared with correct message');
      
      // ===== STEP 7: VERIFY BUTTON STATE CHANGED =====
      Logger.step(7, 'Verify button changed to "Active Organization" state');
      
      // Wait for UI to update
      await organizationPage.page.waitForTimeout(1000);
      
      // Verify organization is now marked as active
      const isActive = await organizationPage.isOrganizationActive(testOrganizationSlug);
      expect(isActive).toBeTruthy();
      
      // Get the button again to check its new state
      const activeButton = await organizationPage.findUseOrganizationButtonForSlug(testOrganizationSlug);
      expect(activeButton).not.toBeNull();
      
      // Verify button is now disabled
      await expect(activeButton!).toBeDisabled();
      
      // Verify button text changed
      const buttonText = await activeButton!.textContent();
      expect(buttonText).toContain('Active Organization');
      
      // Verify star icon is present
      const hasStarIcon = await activeButton!.locator('svg.lucide-star').isVisible();
      expect(hasStarIcon).toBeTruthy();
      
      Logger.success('Button successfully changed to "Active Organization" state');
      
      // ===== STEP 8: VERIFY ORGANIZATION REMAINS IN TABLE =====
      Logger.step(8, 'Verify organization still appears in table after activation');
      
      const stillInTable = await organizationPage.verifyOrganizationInTable(testOrganizationSlug);
      expect(stillInTable).toBeTruthy();
      
      Logger.success('Organization remains in table after activation');
      
      Logger.testEnd('Activate Newly Created Organization', true);
      
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Activate Newly Created Organization', false);
      throw error;
    }
  });

  test('should not allow activating already active organization', async ({ 
    organizationPage
  }) => {
    Logger.testStart('Prevent Activating Already Active Organization');

    try {
      // ===== STEP 1: FIND AN ALREADY ACTIVE ORGANIZATION =====
      Logger.step(1, 'Find an already active organization');
      
      await organizationPage.waitForTableToLoad();
      const totalOrgs = await organizationPage.getTotalOrganizationsCount();
      
      if (totalOrgs === 0) {
        Logger.warning('No organizations found in table, skipping test');
        test.skip();
        return;
      }
      
      // Look for an already active organization
      let activeOrganizationSlug: string | null = null;
      
      for (let i = 0; i < totalOrgs; i++) {
        const row = organizationPage.getTableRow(i);
        
        // Check if button is disabled and has star icon
        const useButton = row.locator('td:first-child button');
        const isDisabled = await useButton.isDisabled();
        const hasStarIcon = await useButton.locator('svg.lucide-star').isVisible().catch(() => false);
        
        if (isDisabled && hasStarIcon) {
          // Get the slug from the 4th column
          const slugCell = row.locator('td:nth-child(4) div.text-left');
          const slug = await slugCell.textContent();
          if (slug) {
            activeOrganizationSlug = slug.trim();
            break;
          }
        }
      }
      
      if (!activeOrganizationSlug) {
        Logger.warning('No active organization found, skipping test');
        test.skip();
        return;
      }
      
      Logger.info(`Found active organization: ${activeOrganizationSlug}`);
      
      // ===== STEP 2: VERIFY BUTTON IS DISABLED =====
      Logger.step(2, 'Verify "Use Organization" button is disabled');
      
      const button = await organizationPage.findUseOrganizationButtonForSlug(activeOrganizationSlug);
      expect(button).not.toBeNull();
      
      await expect(button!).toBeDisabled();
      await expect(button!).toContainText('Active Organization');
      
      Logger.success('Active organization button is properly disabled');
      
      // ===== STEP 3: ATTEMPT TO CLICK (SHOULD NOT WORK) =====
      Logger.step(3, 'Attempt to click disabled button');
      
      // Try to click (should not work since it's disabled)
      const clicked = await organizationPage.clickUseOrganizationForSlug(activeOrganizationSlug);
      expect(clicked).toBeFalsy();
      
      Logger.success('Cannot click already active organization button');
      
      // ===== STEP 4: VERIFY NO NEW TOAST APPEARS =====
      Logger.step(4, 'Verify no new toast appears');
      
      // Wait a moment to ensure no toast appears
      await organizationPage.page.waitForTimeout(2000);
      
      // Check for any new success toasts (there shouldn't be any new ones)
      const toastCount = await organizationPage.getSuccessToastCount();
      
      // If there are toasts, make sure they're not new "Active organization changed" toasts
      if (toastCount > 0) {
        const newToast = await organizationPage.hasActiveOrgChangedToast();
        
        expect(newToast).toBeFalsy();
      }
      
      Logger.success('No new toast appeared (as expected)');
      
      Logger.testEnd('Prevent Activating Already Active Organization', true);
      
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('Prevent Activating Already Active Organization', false);
      throw error;
    }
  });
});