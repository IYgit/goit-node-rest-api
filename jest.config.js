export default {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "clover"
  ],

  // The test environment that will be used for testing
  testEnvironment: "node",

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Setup files after the environment is setup
  // setupFilesAfterEnv: ['./jest.setup.js'], // If we need a setup file later

  // Transform ES modules if needed (though modern Jest might handle this with Node's capabilities)
  // transform: {}, // Leaving default for now, may need babel-jest if issues arise
};
