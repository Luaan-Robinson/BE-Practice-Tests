import { faker } from '@faker-js/faker';
import testConfig from '../config/test-config';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  fullName: string;
}

export interface OrganizationData {
  name: string;
  slug: string;
}

export class TestDataGenerator {
  static generateUser(): UserData {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = this.generatePassword();

    return {
      firstName,
      lastName,
      email,
      password,
      fullName: `${firstName} ${lastName}`,
    };
  }

  static generatePassword(): string {
    return (
      faker.internet.password({
        length: testConfig.testData.passwordLength,
        memorable: false,
      }) + '!1Aa'
    ); // Ensure it has special characters, numbers, uppercase
  }

  static generateOrganization(): OrganizationData {
    const companyName = faker.company.name();
    const slug = this.generateSlug(companyName);

    return {
      name: companyName,
      slug: slug,
    };
  }

  static generateSlug(text: string): string {
    // Convert to lowercase, replace spaces and special characters with hyphens
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
      .substring(0, 50); // Limit length
  }
}
