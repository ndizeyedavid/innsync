/** Jest config for contract tests. */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/test/contract/**/*.spec.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleNameMapper: { '^src/(.*)$': '<rootDir>/src/$1' },
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/setup-env.ts'],
};
