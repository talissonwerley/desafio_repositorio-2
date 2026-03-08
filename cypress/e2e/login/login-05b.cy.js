/**
 * LOGIN-05 - Login com campos vazios (Password required)
 */
import { LoginPage } from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Login', () => {
  it('LOGIN-05 - Login com campos vazios (Password required)', () => {
    cy.visit('/');
    cy.fixture('users').then(({ standard }) => {
      loginPage.getUsernameInput().type(standard.username);
      loginPage.getLoginButton().click();
    });
    loginPage.getErrorMessage().should('be.visible').and('include.text', 'Password is required');
  });
});
