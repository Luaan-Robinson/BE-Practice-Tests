/**
 * Test Configuration
 * Central configuration for test data, timeouts, and credentials
 */

export const testConfig = {
  // Test users (use environment variables in production)
  testUsers: {
    validUser: {
      email: process.env.TEST_USER_EMAIL || 'dummydumdopple@gmail.com',
      password: process.env.TEST_USER_PASSWORD || 'dummy@123',
    },
  },

  // Timeouts (in milliseconds)
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
    extraLong: 60000,
  },

  // Test data settings
  testData: {
    passwordLength: 12,
    passwordPattern: /[A-Za-z\d!@#$%^&*]/,
  },

  // Retry settings
  retries: {
    flaky: 2,
    stable: 0,
  },
};

export default testConfig;
