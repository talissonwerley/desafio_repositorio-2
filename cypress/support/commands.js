/**
 * Comandos customizados - fluxos reutilizáveis (espelho das keywords do RF)
 * Evita duplicação e garante testes independentes.
 */

import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

const loginPage = new LoginPage();
const inventoryPage = new InventoryPage();
const cartPage = new CartPage();
const checkoutOne = new CheckoutStepOnePage();
const checkoutTwo = new CheckoutStepTwoPage();
const checkoutComplete = new CheckoutCompletePage();

/**
 * Visita a base URL e força o evento "load" para evitar timeout quando o site
 * tem scripts de tracking que nunca completam. Dispara load no DOMContentLoaded
 * ou após 2s como fallback.
 */
Cypress.Commands.add('visitBase', () => {
  cy.visit('/', {
    onBeforeLoad(win) {
      let fired = false;
      const fireLoad = () => {
        if (fired) return;
        fired = true;
        win.dispatchEvent(new Event('load'));
      };
      if (win.document.readyState !== 'loading') {
        fireLoad();
      } else {
        win.addEventListener('DOMContentLoaded', fireLoad);
      }
      // Fallback: dispara load após 2s para desbloquear visit quando o site não coopera
      win.setTimeout(fireLoad, 2000);
    },
  });
});

/**
 * Dado: estar na página de login
 */
Cypress.Commands.add('visitLogin', () => {
  cy.visitBase();
  loginPage.getLoginForm().should('be.visible');
});

/**
 * Dado/Quando: fazer login com usuário e senha (dados do fixture ou parâmetros)
 * @param {string} username
 * @param {string} password
 */
Cypress.Commands.add('login', (username, password) => {
  cy.visitBase();
  loginPage.getUsernameInput().clear().type(username);
  loginPage.getPasswordInput().clear().type(password);
  loginPage.getLoginButton().click();
});

/**
 * Dado: estar logado como usuário padrão (para cenários de checkout)
 * Garante estado limpo: visita login e faz login.
 */
Cypress.Commands.add('loginAsStandardUser', () => {
  cy.visitBase();
  cy.fixture('users').then(({ standard }) => {
    loginPage.getUsernameInput().clear().type(standard.username);
    loginPage.getPasswordInput().clear().type(standard.password);
    loginPage.getLoginButton().click();
  });
  inventoryPage.getInventoryList().should('be.visible');
});

/**
 * Dado: ter um produto no carrinho e estar na tela de checkout step one
 * Adiciona 1 produto (Backpack), vai ao carrinho, inicia checkout.
 */
Cypress.Commands.add('addOneProductAndGoToCheckout', () => {
  cy.loginAsStandardUser();
  inventoryPage.addProductByDataTestId('sauce-labs-backpack');
  inventoryPage.getShoppingCartLink().click();
  cartPage.getCheckoutButton().should('be.visible').click();
  checkoutOne.getForm().should('be.visible');
});

/**
 * Dado: ter dois produtos no carrinho e estar na tela de checkout step one
 */
Cypress.Commands.add('addTwoProductsAndGoToCheckout', () => {
  cy.loginAsStandardUser();
  inventoryPage.addProductByDataTestId('sauce-labs-backpack');
  inventoryPage.addProductByDataTestId('sauce-labs-bike-light');
  inventoryPage.getShoppingCartLink().click();
  cartPage.getCheckoutButton().click();
  checkoutOne.getForm().should('be.visible');
});

/**
 * Quando: preencher dados de checkout válidos e continuar
 */
Cypress.Commands.add('fillCheckoutAndContinue', (data = {}) => {
  cy.fixture('checkout').then((defaults) => {
    const first = data.firstName ?? defaults.valid.firstName;
    const last = data.lastName ?? defaults.valid.lastName;
    const zip = data.postalCode ?? defaults.valid.postalCode;
    checkoutOne.fillFirstname(first);
    checkoutOne.fillLastname(last);
    checkoutOne.fillPostalCode(zip);
    checkoutOne.getContinueButton().click();
  });
});
