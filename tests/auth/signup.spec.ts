import { test, expect } from '../../fixtures/test-fixtures';
import { Logger } from '../../utils/logger';
import { TestDataGenerator } from '../../utils/test-data-generator'; // ADD THIS

test.describe('User Registration', () => {
  test.beforeEach(async ({ signInPage }) => {
    await signInPage.navigateToHome();
    await signInPage.page.click('a:has-text("Sign In")');
    await signInPage.navigateToSignUp();
  });

  test('should successfully create a new user account', async ({ 
    signUpPage, 
    signInPage,
  }) => {
    Logger.testStart('User Sign Up Process');

    try {
      // ===== VERIFY SIGN UP PAGE IS DISPLAYED =====
      Logger.step(1, 'Verify Sign Up page is displayed');
      await expect(await signUpPage.verifySignUpTitle()).toBeVisible();
      Logger.success('Sign Up page is displayed');

      // ===== ACTUALLY GENERATE UNIQUE USER DATA =====
      Logger.step(2, 'Generate unique test user data');
      const userData = TestDataGenerator.generateUser(); // ✅ FIXED!
      
      Logger.info('Generated test user', {
        email: userData.email,
        name: userData.fullName,
      });

      // ===== FILL AND SUBMIT SIGN UP FORM =====
      Logger.step(3, 'Complete sign up form');
      await signUpPage.signUp(userData);
      Logger.success('Sign up form submitted');

      // ===== VERIFY SUCCESSFUL REGISTRATION =====
      Logger.step(4, 'Verify successful registration');
      
      // Should be redirected to Sign In page
      await expect(await signInPage.verifySignInTitle()).toBeVisible();
      
      Logger.success('User successfully registered and redirected to Sign In page');
      Logger.testEnd('User Sign Up Process', true);
      
    } catch (error) {
      Logger.error('Test failed', error);
      Logger.testEnd('User Sign Up Process', false);
      throw error;
    }
  });
});