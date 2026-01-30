import { test as base } from '@playwright/test';
import { SignInPage } from '../pages/SignInPage';
import { SignUpPage } from '../pages/SignUpPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OrganizationPage } from '../pages/OrganizationPage'; // Only this one now

type CustomFixtures = {
  signInPage: SignInPage;
  signUpPage: SignUpPage;
  dashboardPage: DashboardPage;
  organizationPage: OrganizationPage; // Single organization fixture
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
});

export { expect } from '@playwright/test';
