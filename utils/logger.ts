/**
 * Test Logger
 * Provides consistent logging throughout test execution
 */

export class Logger {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  static info(message: string, data?: any): void {
    console.log(`[${this.getTimestamp()}] ℹ️  INFO: ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
  }

  static success(message: string, data?: any): void {
    console.log(`[${this.getTimestamp()}] ✅ SUCCESS: ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
  }

  static warning(message: string, data?: any): void {
    console.warn(`[${this.getTimestamp()}] ⚠️  WARNING: ${message}`);
    if (data) console.warn(JSON.stringify(data, null, 2));
  }

  static error(message: string, error?: any): void {
    console.error(`[${this.getTimestamp()}] ❌ ERROR: ${message}`);
    if (error) console.error(error);
  }

  static step(stepNumber: number, description: string): void {
    console.log(`[${this.getTimestamp()}] 📍 STEP ${stepNumber}: ${description}`);
  }

  static testStart(testName: string): void {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[${this.getTimestamp()}] 🚀 Starting Test: ${testName}`);
    console.log(`${'='.repeat(80)}\n`);
  }

  static testEnd(testName: string, passed: boolean): void {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[${this.getTimestamp()}] ${passed ? '✅ PASSED' : '❌ FAILED'}: ${testName}`);
    console.log(`${'='.repeat(80)}\n`);
  }
}
