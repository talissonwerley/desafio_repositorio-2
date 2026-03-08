/**
 * LOGIN-05 - Login com campos vazios (Username required)
 */
import { LoginPage } from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Login', () => {
  it('LOGIN-05 - Login com campos vazios (Username required)', () => {
    cy.visit('/');
    loginPage.getLoginButton().click();
    loginPage.getErrorMessage().should('be.visible').and('include.text', 'Username is required');
  });
});
