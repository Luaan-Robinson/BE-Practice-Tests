import { Page, Locator } from '@playwright/test';
import { Logger } from '../utils/logger';
import { OrganizationData } from '../utils/test-data-generator';
import path from 'path';

export class OrganizationPage {
  // ===== FORM FIELDS (Create Organization) =====
  private readonly nameInput: Locator;
  private readonly slugInput: Locator;
  private readonly logoInput: Locator;
  
  // ===== BUTTONS (Create Organization) =====
  private readonly submitButton: Locator;
  private readonly resetButton: Locator;
  
  // ===== NOTIFICATION/TOAST =====
  private readonly successToast: Locator;
  private readonly pageTitle: Locator;
  private readonly form: Locator;

  // ===== ORGANIZATION LIST TABLE ELEMENTS =====
  private readonly organizationsTable: Locator;
  private readonly tableRows: Locator;
  private readonly createButton: Locator;

  constructor(public page: Page) {
    // ===== CREATE FORM ELEMENTS =====
    // Target inputs by ID for specificity
    this.nameInput = page.locator('input#name');
    this.slugInput = page.locator('input#slug');
    this.logoInput = page.locator('input#logo[type="file"]');
    
    // Target buttons by text content within specific sections
    this.submitButton = page.locator('button[type="submit"]:has-text("Submit")').first();
    this.resetButton = page.locator('button[type="button"]:has-text("Reset")').first();
    
    // Toast notification
    this.successToast = page.locator('[data-sonner-toast][data-type="success"]');
    this.pageTitle = page.locator('h1, [data-slot="title"]').first();
    this.form = page.locator('form#organization-form');

    // ===== ORGANIZATION LIST ELEMENTS =====
    this.organizationsTable = page.locator('table[data-slot="table"]');
    this.tableRows = page.locator('table[data-slot="table"] tbody tr');
    this.createButton = page.locator('a[href="/organization/create"] button');
  }

  // ===== HELPER METHODS FOR TABLE =====
  public getTableRow(index: number): Locator {
    return this.tableRows.nth(index);
  }

  public async getSuccessToastCount(): Promise<number> {
    return this.successToast.count();
  }

  public async hasActiveOrgChangedToast(): Promise<boolean> {
    const newToast = this.successToast.filter({ hasText: 'Active organization changed' });
    return (await newToast.count()) > 0;
  }

  // ===== ORGANIZATION LIST METHODS =====
  
  async waitForTableToLoad(): Promise<void> {
    Logger.info('Waiting for organizations table to load');
    await this.organizationsTable.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getOrganizationRowBySlug(slug: string): Promise<Locator | null> {
    Logger.info(`Looking for organization with slug: ${slug}`);
    
    await this.waitForTableToLoad();
    
    // Get all rows
    const rows = this.tableRows;
    const rowCount = await rows.count();
    
    Logger.info(`Found ${rowCount} organization rows in table`);
    
    // Search for the row containing the slug in the 4th column
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      
      // Look for the slug in the 4th column (index 3) - specific selector from your HTML
      const slugCell = row.locator('td:nth-child(4) div.text-left');
      
      try {
        const cellText = await slugCell.textContent({ timeout: 2000 });
        if (cellText && cellText.trim() === slug) {
          Logger.info(`Found organization row for slug: ${slug} at row ${i + 1}`);
          return row;
        }
      } catch {
        // Cell not found or timeout, continue to next row
        continue;
      }
    }
    
    Logger.warning(`Organization with slug "${slug}" not found in table`);
    return null;
  }

  async findUseOrganizationButtonForSlug(slug: string): Promise<Locator | null> {
    Logger.info(`Looking for "Use Organization" button for slug: ${slug}`);
    
    const row = await this.getOrganizationRowBySlug(slug);
    if (!row) {
      return null;
    }
    
    // Find the "Use Organization" button in the first column - very specific selector
    const useButton = row.locator('td:first-child button:has-text("Use Organization")');
    
    try {
      await useButton.waitFor({ state: 'visible', timeout: 5000 });
      Logger.info(`Found "Use Organization" button for slug: ${slug}`);
      return useButton;
    } catch {
      Logger.warning(`"Use Organization" button not found for slug: ${slug}`);
      return null;
    }
  }

  async clickUseOrganizationForSlug(slug: string): Promise<boolean> {
    Logger.info(`Clicking "Use Organization" for slug: ${slug}`);
    
    const button = await this.findUseOrganizationButtonForSlug(slug);
    if (!button) {
      return false;
    }
    
    // Check if button is already disabled (already active organization)
    const isDisabled = await button.isDisabled();
    if (isDisabled) {
      Logger.info(`Organization "${slug}" is already active`);
      return false;
    }
    
    // Click the button
    await button.click();
    return true;
  }

  async isOrganizationActive(slug: string): Promise<boolean> {
    Logger.info(`Checking if organization "${slug}" is active`);
    
    const button = await this.findUseOrganizationButtonForSlug(slug);
    if (!button) {
      return false;
    }
    
    // Check if button is disabled and has star icon (active state)
    const isDisabled = await button.isDisabled();
    const hasStarIcon = await button.locator('svg.lucide-star').isVisible();
    const buttonText = await button.textContent();
    const isActiveText = buttonText?.includes('Active Organization') || false;
    
    return isDisabled && hasStarIcon && isActiveText;
  }

  async verifyOrganizationInTable(slug: string): Promise<boolean> {
    Logger.info(`Verifying organization "${slug}" exists in table`);
    
    const row = await this.getOrganizationRowBySlug(slug);
    return row !== null;
  }

  async waitForActiveOrganizationToast(): Promise<boolean> {
    Logger.info('Waiting for "Active organization changed" toast');
    
    try {
      // Look for the specific success toast with title "Active organization changed"
      const toast = this.successToast.filter({ hasText: 'Active organization changed' });
      await toast.waitFor({ state: 'visible', timeout: 10000 });
      
      // Also wait for the checkmark icon to appear
      const checkIcon = toast.locator('.lucide-circle-check');
      await checkIcon.waitFor({ state: 'visible', timeout: 5000 });
      
      Logger.success('Active organization toast appeared');
      return true;
    } catch (error) {
      Logger.warning('Active organization toast not found', error);
      return false;
    }
  }

  async getActiveOrganizationToastText(): Promise<string> {
    try {
      const toast = this.successToast.filter({ hasText: 'Active organization changed' });
      const titleElement = toast.locator('[data-title]');
      return await titleElement.textContent() || '';
    } catch {
      return '';
    }
  }

  async getTotalOrganizationsCount(): Promise<number> {
    await this.waitForTableToLoad();
    return await this.tableRows.count();
  }

  async scrollToOrganization(slug: string): Promise<void> {
    const row = await this.getOrganizationRowBySlug(slug);
    if (row) {
      Logger.info(`Scrolling to organization row for slug: ${slug}`);
      await row.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500); // Allow time for UI to settle
    }
  }

  // ===== CREATE FORM METHODS =====
  
  // Public methods for test access
  public async isLogoInputVisible(): Promise<boolean> {
    return this.logoInput.isVisible();
  }

  public async getNameInputAriaInvalid(): Promise<string | null> {
    return this.nameInput.getAttribute('aria-invalid');
  }

  public async getSlugInputAriaInvalid(): Promise<string | null> {
    return this.slugInput.getAttribute('aria-invalid');
  }

  async fillName(name: string): Promise<void> {
    Logger.info(`Filling organization name with: ${name}`);
    await this.nameInput.fill(name);
  }

  async fillSlug(slug: string): Promise<void> {
    Logger.info(`Filling organization slug with: ${slug}`);
    await this.slugInput.fill(slug);
  }

  async uploadLogo(imagePath: string): Promise<void> {
    Logger.info(`Uploading logo from: ${imagePath}`);
    
    const absolutePath = path.resolve(process.cwd(), imagePath);
    Logger.info(`Absolute path: ${absolutePath}`);
    
    await this.logoInput.setInputFiles(absolutePath);
    await this.page.waitForTimeout(1000);
  }

  async clickSubmit(): Promise<void> {
    Logger.info('Clicking Submit button');
    await this.submitButton.click();
  }

  async clickReset(): Promise<void> {
    Logger.info('Clicking Reset button');
    await this.resetButton.click();
  }

  async fillOrganizationForm(orgData: OrganizationData, logoPath: string = 'test-logo.png'): Promise<void> {
    Logger.step(1, 'Fill organization name');
    await this.fillName(orgData.name);
    
    Logger.step(2, 'Fill organization slug');
    await this.fillSlug(orgData.slug);
    
    Logger.step(3, 'Upload organization logo');
    await this.uploadLogo(logoPath);
  }

  async createOrganization(orgData: OrganizationData, logoPath: string = 'test-logo.png'): Promise<void> {
    Logger.info(`Creating organization: ${orgData.name}`);
    
    await this.fillOrganizationForm(orgData, logoPath);
    await this.clickSubmit();
  }

  async isOnCreatePage(): Promise<boolean> {
    try {
      await this.page.waitForURL('**/organization/create', { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async verifyPageTitle(): Promise<Locator> {
    Logger.info('Verifying page title');
    return this.pageTitle;
  }

  async isSuccessToastVisible(): Promise<boolean> {
    try {
      await this.successToast.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async waitForSuccessToast(): Promise<void> {
    Logger.info('Waiting for success toast');
    await this.successToast.waitFor({ state: 'visible', timeout: 20000 });
  }

  async getSuccessToastText(): Promise<string> {
    try {
      const titleElement = this.successToast.locator('[data-title]');
      return await titleElement.textContent() || '';
    } catch {
      return '';
    }
  }

  async getNameValue(): Promise<string> {
    return await this.nameInput.inputValue();
  }

  async getSlugValue(): Promise<string> {
    return await this.slugInput.inputValue();
  }

  async isLogoUploaded(): Promise<boolean> {
    const files = await this.logoInput.inputValue();
    return files.length > 0;
  }

  async isSubmitButtonVisible(): Promise<boolean> {
    try {
      await this.submitButton.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async isResetButtonVisible(): Promise<boolean> {
    try {
      await this.resetButton.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async verifyFormReset(): Promise<boolean> {
    const nameValue = await this.getNameValue();
    const slugValue = await this.getSlugValue();
    
    return nameValue === '' && slugValue === '';
  }

  async verifyNavigationAfterSubmit(): Promise<boolean> {
    try {
      try {
        await this.successToast.waitFor({ state: 'visible', timeout: 5000 });
        Logger.info('Success toast appeared');
        return true;
      } catch {
        await this.page.waitForURL('**/organization', { timeout: 10000 });
        Logger.info('Redirected to organization list');
        return true;
      }
    } catch (error) {
      Logger.error('Neither success toast nor redirect occurred', error);
      return false;
    }
  }

  async areFieldsCleared(): Promise<boolean> {
    const nameValue = await this.getNameValue();
    const slugValue = await this.getSlugValue();
    
    return nameValue === '' && slugValue === '';
  }

  // ===== NAVIGATION METHODS =====
  
  async navigateToOrganizationList(): Promise<void> {
    Logger.info('Navigating to organization list page');
    await this.page.goto('/organization');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickCreateOrganization(): Promise<void> {
    Logger.info('Clicking Create Organization button');
    await this.createButton.click();
  }

  async isCreateButtonVisible(): Promise<boolean> {
    try {
      await this.createButton.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}