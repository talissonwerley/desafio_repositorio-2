/**
 * LOGIN-03 - Login com usuário inválido
 */
import { LoginPage } from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Login', () => {
  it('LOGIN-03 - Login com usuário inválido', () => {
    cy.visit('/');
    cy.fixture('users').then(({ invalidUser }) => {
      loginPage.getUsernameInput().type(invalidUser.username);
      loginPage.getPasswordInput().type(invalidUser.password);
      loginPage.getLoginButton().click();
    });
    loginPage.getErrorMessage().should('be.visible').and('include.text', 'Username and password do not match');
    cy.url().should('not.include', '/inventory.html');
  });
});
