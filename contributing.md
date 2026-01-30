# BE POR Automation Test Suite

Practice Playwright automation tests for the BE POR web application.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD](#cicd)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This test suite provides comprehensive end-to-end testing for the BE POR application using the Page Object Model (POM) design pattern. It includes:

- ✅ User authentication (sign in/sign up)
- ✅ Organization management (create, activate)
- ✅ Dashboard navigation
- ✅ Cross-browser testing (Chromium, Firefox, WebKit)
- ✅ Automatic test reporting
- ✅ CI/CD ready configuration

## 🛠 Tech Stack

- **Test Framework**: [Playwright](https://playwright.dev/) v1.58.0
- **Language**: TypeScript
- **Test Data**: Faker.js for dynamic test data generation
- **Logging**: Custom Logger utility
- **CI/CD**: GitHub Actions ready

## 📁 Project Structure

playwright-test-framework/
├── config/
│ ├── environments.ts # Environment configurations
│ └── test-config.ts # Test settings and credentials
├── fixtures/
│ └── test-fixtures.ts # Custom Playwright fixtures
├── pages/
│ ├── DashboardPage.ts # Dashboard page object model
│ ├── SignInPage.ts # Sign in page object model
│ ├── SignUpPage.ts # Sign up page object model
│ ├── OrganizationCreatePage.ts # Organization creation page
│ └── OrganizationPage.ts # Organization management page
├── tests/
│ ├── dashboard/
│ │ ├── navigation.spec.ts # Navigation tests
│ │ ├── organization-create.spec.ts # Organization creation tests
│ │ └── organization-activate.spec.ts # Organization activation tests
│ └── auth/
│ ├── signin.spec.ts # Sign in test suite
│ └── signup.spec.ts # Sign up test suite
├── utils/
│ ├── logger.ts # Logging utility
│ └── test-data-generator.ts # Test data generation utility
├── .env.example # Environment variables template
├── package.json # Project dependencies
├── playwright.config.ts # Playwright configuration
├── tsconfig.json # TypeScript configuration
└── README.md # This file
