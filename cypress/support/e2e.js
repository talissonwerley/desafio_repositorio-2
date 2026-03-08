// ***********************************************************
// Suporte E2E - imports e configuração global
// ***********************************************************
import 'cypress-mochawesome-reporter/register';
import registerCypressGrep from '@cypress/grep/src/support';
registerCypressGrep();
import './commands';

// Intercepta requisições de tracking/analytics do SauceDemo que podem nunca completar e atrasar o evento "load"
const trackingResponse = { statusCode: 200, body: {} };
beforeEach(() => {
  cy.intercept(/unique-events|summed-events|submit\?universe|analytics|tracking/i, trackingResponse);
});

// Falha o teste em requisições não tratadas (ex.: 404)
Cypress.on('uncaught:exception', (err) => {
  if (err.message?.includes('Failed to load resource') && err.message?.includes('unique-events')) {
    return false;
  }
  return true;
});
