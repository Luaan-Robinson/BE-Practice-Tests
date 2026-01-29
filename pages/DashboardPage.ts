import { Page, Locator } from '@playwright/test';
import { Logger } from '../utils/logger';

export class DashboardPage {
  // Sidebar navigation links
  private readonly dashboardLink: Locator;
  private readonly organizationLink: Locator;
  private readonly usersLink: Locator;
  
  // Organization page elements
  private readonly createButton: Locator;
  private readonly createLink: Locator;  // ← ADD THIS

  constructor(public page: Page) {
    // Use getByRole to be more specific and avoid duplicates
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard' }).first();
    this.organizationLink = page.getByRole('link', { name: 'Organization' }).first();
    this.usersLink = page.getByRole('link', { name: 'Users' }).first();
    
    // ← FIX: Target the LINK that contains the button, not the button itself
    this.createLink = page.locator('a[href="/organization/create"]');
    this.createButton = page.locator('a[href="/organization/create"] button');
  }

  // ===== NAVIGATION METHODS =====
  
  async navigateToDashboard(): Promise<void> {
    Logger.info('Navigating to Dashboard');
    await this.dashboardLink.click();
    await this.page.waitForURL('**/dashboard');
  }

  async navigateToOrganization(): Promise<void> {
    Logger.info('Navigating to Organization page');
    await this.organizationLink.click();
    await this.page.waitForURL('**/organization');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(500); // Small buffer for rendering
  }

  async navigateToUsers(): Promise<void> {
    Logger.info('Navigating to Users page');
    await this.usersLink.click();
    await this.page.waitForURL('**/members');
  }

  // ===== VERIFICATION METHODS =====
  
  async isOnDashboard(): Promise<boolean> {
    try {
      await this.dashboardLink.waitFor({ state: 'visible', timeout: 5000 });
      return this.page.url().includes('/dashboard');
    } catch {
      return false;
    }
  }

  async isDashboardLinkActive(): Promise<boolean> {
    const dataActive = await this.dashboardLink.getAttribute('data-active');
    const ariaCurrent = await this.dashboardLink.getAttribute('aria-current');
    return dataActive === 'true' || ariaCurrent === 'page';
  }

  async isOrganizationLinkActive(): Promise<boolean> {
    const dataActive = await this.organizationLink.getAttribute('data-active');
    const ariaCurrent = await this.organizationLink.getAttribute('aria-current');
    return dataActive === 'true' || ariaCurrent === 'page';
  }

  async isUsersLinkActive(): Promise<boolean> {
    const dataActive = await this.usersLink.getAttribute('data-active');
    const ariaCurrent = await this.usersLink.getAttribute('aria-current');
    return dataActive === 'true' || ariaCurrent === 'page';
  }

  // ===== ELEMENT VISIBILITY CHECKS =====
  
  async verifyDashboardLink(): Promise<Locator> {
    Logger.info('Verifying Dashboard link is visible');
    return this.dashboardLink;
  }

  async verifyOrganizationLink(): Promise<Locator> {
    Logger.info('Verifying Organization link is visible');
    return this.organizationLink;
  }

  async verifyUsersLink(): Promise<Locator> {
    Logger.info('Verifying Users link is visible');
    return this.usersLink;
  }

  // ===== ORGANIZATION PAGE ACTIONS ===== ← UPDATED SECTION
  
  async clickCreateButton(): Promise<void> {
    Logger.info('Clicking Create button on Organization page');
    // Click the link, not the button (the button is inside the link)
    await this.createLink.click();
  }

  async isCreateButtonVisible(): Promise<boolean> {
    try {
      // Check if the CREATE LINK is visible (which contains the button)
      await this.createLink.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
  
  // ← ADD THIS: Alternative method to verify by button text
  async isCreateButtonVisibleByText(): Promise<boolean> {
    try {
      await this.createButton.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}