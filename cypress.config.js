const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    viewportWidth: 1280,
    viewportHeight: 720,
    pageLoadTimeout: 120000,
    defaultCommandTimeout: 15000,
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/results/videos',
    screenshotsFolder: 'cypress/results/screenshots',
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/results/reports',
      overwrite: false,
      html: true,
      json: true,
      charts: true,
      reportPageTitle: 'SauceDemo - Relatório de Testes Cypress',
      embeddedScreenshots: true,
      inlineAssets: true,
      removeJsonsFolderAfterMerge: false, // mantém .jsons para scripts/collect-metrics.js
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      require('@cypress/grep/src/plugin')(config);
      return config;
    },
  },
  env: {
    // CI detection (GitHub Actions define GITHUB_ACTIONS)
    isCI: process.env.GITHUB_ACTIONS === 'true',
  },
});
