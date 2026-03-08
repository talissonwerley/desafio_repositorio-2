/**
 * CHECKOUT-04 - Checkout sem preencher sobrenome
 */
import { CheckoutStepOnePage } from '../../pages/CheckoutStepOnePage';

const checkoutOne = new CheckoutStepOnePage();

describe('Checkout', () => {
  it('CHECKOUT-04 - Checkout sem preencher sobrenome', () => {
    cy.addOneProductAndGoToCheckout();
    cy.fixture('checkout').then(({ valid }) => {
      checkoutOne.fillFirstname(valid.firstName);
      checkoutOne.fillPostalCode(valid.postalCode);
    });
    checkoutOne.getContinueButton().click();
    cy.fixture('messages').then(({ checkout: msg }) => {
      checkoutOne.getErrorMessage().should('be.visible').and('include.text', msg.lastNameRequired);
    });
    cy.url().should('include', 'checkout-step-one');
  });
});
