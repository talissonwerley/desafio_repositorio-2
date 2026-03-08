/**
 * LOGIN-04 - Login com usuário bloqueado
 */
import { LoginPage } from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Login', () => {
  it('LOGIN-04 - Login com usuário bloqueado', () => {
    cy.visit('/');
    cy.fixture('users').then(({ locked }) => {
      loginPage.getUsernameInput().type(locked.username);
      loginPage.getPasswordInput().type(locked.password);
      loginPage.getLoginButton().click();
    });
    loginPage.getErrorMessage().should('be.visible').and('include.text', 'Sorry, this user has been locked out');
    cy.url().should('not.include', '/inventory.html');
  });
});
