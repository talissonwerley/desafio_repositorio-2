/**
 * CHECKOUT-05 - Checkout sem preencher CEP
 */
import { CheckoutStepOnePage } from '../../pages/CheckoutStepOnePage';

const checkoutOne = new CheckoutStepOnePage();

describe('Checkout', () => {
  it('CHECKOUT-05 - Checkout sem preencher CEP', () => {
    cy.addOneProductAndGoToCheckout();
    cy.fixture('checkout').then(({ valid }) => {
      checkoutOne.fillFirstname(valid.firstName);
      checkoutOne.fillLastname(valid.lastName);
    });
    checkoutOne.getContinueButton().click();
    cy.fixture('messages').then(({ checkout: msg }) => {
      checkoutOne.getErrorMessage().should('be.visible').and('include.text', msg.postalCodeRequired);
    });
    cy.url().should('include', 'checkout-step-one');
  });
});
