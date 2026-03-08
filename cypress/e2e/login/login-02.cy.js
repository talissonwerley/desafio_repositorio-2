/**
 * LOGIN-02 - Login com senha inválida
 */
import { LoginPage } from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Login', () => {
  it('LOGIN-02 - Login com senha inválida', () => {
    cy.visit('/');
    cy.fixture('users').then(({ invalidPassword }) => {
      loginPage.getUsernameInput().type(invalidPassword.username);
      loginPage.getPasswordInput().type(invalidPassword.password);
      loginPage.getLoginButton().click();
    });
    loginPage.getErrorMessage().should('be.visible').and('include.text', 'Username and password do not match');
    cy.url().should('not.include', '/inventory.html');
  });
});
