/**
 * Jest config — runs only the pure-TypeScript utility tests.
 *
 * We deliberately do NOT use the `react-native` jest preset here. That preset
 * pulls in the full RN module mock graph and is overkill for the small set of
 * pure utilities we test (PhoneNumberFormatter, etc). If/when component tests
 * are added, switch to `preset: 'react-native'` and add the appropriate setup.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  // Don't transform node_modules — our tests only import from src/.
  transformIgnorePatterns: ['/node_modules/'],
};
