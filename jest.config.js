module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(^src.*/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  setupFiles: ['jest-webextension-mock'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
}
