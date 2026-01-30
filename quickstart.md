# Quick Start Guide

Get up and running with the test suite in 5 minutes!

## ⚡ Super Quick Setup

```bash
# 1. Clone and install
git clone <your-repo-url>
cd playwright-test-framework
npm install

# 2. Install browsers
npm run install:browsers

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Run tests
npm test
```

## 🎯 Common Commands

### Running Tests

```bash
npm test                    # Run all tests
npm run test:headed         # See browser
npm run test:ui             # Interactive mode
npm run test:debug          # Debug mode
npm run test:chrome         # Chrome only
```

### Specific Tests

```bash
npm run test:signin         # Sign in tests only
npm run test:signup         # Sign up tests only
npm run test:auth           # All auth tests
```

### Reports

```bash
npm run report              # View HTML report
```

## 📝 Writing Your First Test

1. **Copy the template:**

   ```bash
   cp tests/example.template.spec.ts tests/my-feature/my-test.spec.ts
   ```

2. **Edit the test:**

   ```typescript
   import { test, expect } from '../fixtures/test-fixtures';

   test.describe('My Feature', () => {
     test('should do something', async ({ homePage }) => {
       await homePage.navigateToHome();
       // Add your test steps
     });
   });
   ```

3. **Run your test:**
   ```bash
   npx playwright test tests/my-feature/my-test.spec.ts
   ```

## 🏗️ Creating a Page Object

1. **Create the page class:**

   ```typescript
   // pages/MyPage.ts
   import { Page, Locator } from '@playwright/test';
   import { BasePage } from './BasePage';

   export class MyPage extends BasePage {
     private readonly myButton: Locator;

     constructor(page: Page) {
       super(page);
       this.myButton = page.locator('#my-button');
     }

     async clickMyButton(): Promise<void> {
       await this.clickElement(this.myButton, 'My Button');
     }
   }
   ```

2. **Add to fixtures:**

   ```typescript
   // fixtures/test-fixtures.ts
   import { MyPage } from '../pages/MyPage';

   type CustomFixtures = {
     // ... existing
     myPage: MyPage;
   };

   export const test = base.extend<CustomFixtures>({
     // ... existing fixtures
     myPage: async ({ page }, use) => {
       await use(new MyPage(page));
     },
   });
   ```

3. **Use in tests:**
   ```typescript
   test('should use my page', async ({ myPage }) => {
     await myPage.clickMyButton();
   });
   ```

## 🔍 Debugging

### Option 1: Headed Mode

```bash
npm run test:headed
```

- See the browser
- Watch test execution

### Option 2: Debug Mode

```bash
npm run test:debug
```

- Step through tests
- Inspect elements
- Set breakpoints

### Option 3: UI Mode

```bash
npm run test:ui
```

- Interactive test runner
- Watch tests
- Time travel debugging

## 📊 Viewing Reports

After running tests:

```bash
npm run report
```

This opens an HTML report showing:

- ✅ Passed tests
- ❌ Failed tests
- 📸 Screenshots
- 🎥 Videos
- ⏱️ Duration

## 🆘 Common Issues

### "Cannot find module"

```bash
npm install
```

### "Browser not found"

```bash
npm run install:browsers
```

### "Tests failing"

1. Check `.env` file exists
2. Verify application is running
3. Run in headed mode to see what's happening

### "Permission denied"

```bash
chmod +x node_modules/.bin/playwright
```

## 📚 Next Steps

1. Read the [README.md](README.md) for full documentation
2. Check [CONTRIBUTING.md](CONTRIBUTING.md) for best practices
3. Look at existing tests in `tests/auth/` for examples
4. Start writing your own tests!

## 🎯 Pro Tips

- Use `test.only()` to run a single test
- Use `test.skip()` to skip a test
- Add `test.slow()` for tests that need more time
- Use `Logger` for better debugging output
- Generate test data with `TestDataGenerator`
- Keep tests independent (no dependencies between tests)

---

Need help? Check the README or ask the team! 🚀
