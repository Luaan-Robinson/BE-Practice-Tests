/**
 * Database Migration Script
 * Run this script to create database tables in CI environment
 *
 * Usage: npm run db:migrate
 */

import { Pool } from 'pg';
import { Logger } from '../utils/logger';

async function migrateDatabase() {
  Logger.info('🔄 Starting database migration...');

  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:testpassword123@localhost:5432/be_por_test';

  const pool = new Pool({
    connectionString,
    max: 1,
  });

  try {
    // Test connection
    await pool.query('SELECT 1');
    Logger.success('Database connected');

    // Create tables based on auth-schema.ts
    Logger.info('Creating tables...');

    // Create user table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id text PRIMARY KEY,
        name text NOT NULL,
        surname text NOT NULL,
        email text NOT NULL UNIQUE,
        email_verified boolean DEFAULT false NOT NULL,
        image text,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL,
        role text,
        banned boolean DEFAULT false,
        ban_reason text,
        ban_expires timestamp
      );
    `);
    Logger.success('Created user table');

    // Create organization table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organization (
        id text PRIMARY KEY,
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        logo text,
        created_at timestamp NOT NULL,
        metadata text
      );
    `);
    Logger.success('Created organization table');

    // Create member table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS member (
        id text PRIMARY KEY,
        organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
        user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        role text DEFAULT 'member' NOT NULL,
        created_at timestamp NOT NULL
      );
    `);
    Logger.success('Created member table');

    // Create session table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        id text PRIMARY KEY,
        expires_at timestamp NOT NULL,
        token text NOT NULL UNIQUE,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL,
        ip_address text,
        user_agent text,
        user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        impersonated_by text,
        active_organization_id text
      );
    `);
    Logger.success('Created session table');

    // Create account table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS account (
        id text PRIMARY KEY,
        account_id text NOT NULL,
        provider_id text NOT NULL,
        user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        access_token text,
        refresh_token text,
        id_token text,
        access_token_expires_at timestamp,
        refresh_token_expires_at timestamp,
        scope text,
        password text,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);
    Logger.success('Created account table');

    // Create verification table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification (
        id text PRIMARY KEY,
        identifier text NOT NULL,
        value text NOT NULL,
        expires_at timestamp NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);
    Logger.success('Created verification table');

    // Create organization_role table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organization_role (
        id text PRIMARY KEY,
        organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
        role text NOT NULL,
        permission text NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);
    Logger.success('Created organization_role table');

    // Create invitation table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invitation (
        id text PRIMARY KEY,
        organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
        email text NOT NULL,
        role text,
        status text DEFAULT 'pending' NOT NULL,
        expires_at timestamp NOT NULL,
        inviter_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
      );
    `);
    Logger.success('Created invitation table');

    Logger.success('✅ Database migration completed successfully');
  } catch (error) {
    Logger.error('❌ Database migration failed', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
migrateDatabase();
