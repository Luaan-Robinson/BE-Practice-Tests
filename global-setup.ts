/**
 * Global Setup
 * Runs once before all tests
 * - Connects to database
 * - Optionally cleans up old test data
 */

import { DatabaseHelper } from './utils/database-helper';
import { Logger } from './utils/logger';
import testConfig from './config/test-config';

async function globalSetup() {
  Logger.info('🚀 Starting global setup...');

  // Only connect to database if DATABASE_URL is provided
  if (process.env.DATABASE_URL) {
    try {
      // Connect to database
      await DatabaseHelper.connect();
      Logger.success('Database connected');

      // Optional: Clean up old test data before running tests
      if (testConfig.database.cleanupOnStart) {
        Logger.info('Cleaning up old test data...');

        const usersDeleted = await DatabaseHelper.cleanupTestUsers(
          `%@${testConfig.testData.testEmailDomain}`
        );

        const orgsDeleted = await DatabaseHelper.cleanupTestOrganizations(
          `${testConfig.testData.testOrgPrefix}%`
        );

        Logger.success(`Cleaned up ${usersDeleted} test users, ${orgsDeleted} test organizations`);
      }
    } catch (error) {
      Logger.warning('Database connection failed, continuing without database...', error);
      // Don't throw - allow tests to run without database
    }
  } else {
    Logger.info('No DATABASE_URL provided, skipping database setup');
  }

  Logger.success('✅ Global setup complete');
}

export default globalSetup;
