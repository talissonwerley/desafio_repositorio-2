/**
 * CHECKOUT-03 - Checkout sem preencher primeiro nome
 */
import { CheckoutStepOnePage } from '../../pages/CheckoutStepOnePage';

const checkoutOne = new CheckoutStepOnePage();

describe('Checkout', () => {
  it('CHECKOUT-03 - Checkout sem preencher primeiro nome', () => {
    cy.addOneProductAndGoToCheckout();
    cy.fixture('checkout').then(({ valid }) => {
      checkoutOne.fillLastname(valid.lastName);
      checkoutOne.fillPostalCode(valid.postalCode);
    });
    checkoutOne.getContinueButton().click();
    cy.fixture('messages').then(({ checkout: msg }) => {
      checkoutOne.getErrorMessage().should('be.visible').and('include.text', msg.firstNameRequired);
    });
    cy.url().should('include', 'checkout-step-one');
  });
});
