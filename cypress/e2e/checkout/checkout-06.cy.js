/**
 * CHECKOUT-06 - Cancelar checkout na tela de overview
 * No SauceDemo, Cancel no overview redireciona para a página de inventário (inventory.html).
 */
import { CheckoutStepTwoPage } from '../../pages/CheckoutStepTwoPage';
import { InventoryPage } from '../../pages/InventoryPage';

const checkoutTwo = new CheckoutStepTwoPage();
const inventoryPage = new InventoryPage();

describe('Checkout', () => {
  it('CHECKOUT-06 - Cancelar checkout na tela de overview', () => {
    cy.addOneProductAndGoToCheckout();
    cy.fillCheckoutAndContinue();
    checkoutTwo.getTitle().should('contain', 'Overview');
    checkoutTwo.getCancelButton().click();
    cy.url().should('include', 'inventory.html');
    inventoryPage.getInventoryList().should('be.visible');
  });
});
