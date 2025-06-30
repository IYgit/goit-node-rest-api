export default {
  // Indicates that the environment is Node.js
  testEnvironment: 'node',
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // A preset that is used as a base for Jest's configuration
  // This preset is recommended for projects using Babel for transpilation
                               // Or we can remove it if babel.config.js is sufficient

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.test.js?(x)',
    '**/?(*.)+(spec|test).js?(x)',
  ],

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$',
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Support for ES modules
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Ensure babel-jest processes js/jsx files
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  // This line is crucial for ES Modules support in Node.js when running Jest
  // It tells Jest to use Node's own ESM loader for .js files.
  // However, if you're using Babel to transpile ESM to CJS for Jest,
  // you might not need this or it might conflict.
  // For now, let's rely on Babel via babel-jest.
  // experimentalVmModules: true, // This can be an alternative if NODE_OPTIONS doesn't work from package.json

  // If you're using `import.meta.url` and other ESM features that Babel might not transpile
  // perfectly for Jest's environment, ensuring Node handles it is key.
  // The combination of babel.config.js for syntax and this for module resolution should work.
};
