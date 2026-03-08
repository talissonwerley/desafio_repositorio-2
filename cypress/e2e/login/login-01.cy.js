/**
 * LOGIN-01 - Login válido com usuário padrão
 */
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';

const loginPage = new LoginPage();
const inventoryPage = new InventoryPage();

describe('Login', () => {
  it('LOGIN-01 - Login válido com usuário padrão', () => {
    cy.visit('/');
    cy.fixture('users').then(({ standard }) => {
      loginPage.getUsernameInput().type(standard.username);
      loginPage.getPasswordInput().type(standard.password);
      loginPage.getLoginButton().click();
    });
    inventoryPage.getInventoryList().should('be.visible');
    cy.url().should('include', '/inventory.html');
  });
});
