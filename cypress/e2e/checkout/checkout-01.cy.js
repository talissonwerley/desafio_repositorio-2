/**
 * CHECKOUT-01 - Checkout de um produto com dados válidos
 */
import { CheckoutStepOnePage } from '../../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../../pages/CheckoutCompletePage';

const checkoutOne = new CheckoutStepOnePage();
const checkoutTwo = new CheckoutStepTwoPage();
const checkoutComplete = new CheckoutCompletePage();

describe('Checkout', () => {
  it('CHECKOUT-01 - Checkout de um produto com dados válidos', () => {
    cy.addOneProductAndGoToCheckout();
    cy.fillCheckoutAndContinue();
    cy.fixture('checkout').then(({ expectedSummary }) => {
      const one = expectedSummary.oneItem;
      checkoutTwo.getSubtotalLabel().should('contain', one.subtotal);
      checkoutTwo.getTaxLabel().should('contain', one.tax);
      checkoutTwo.getTotalLabel().should('contain', one.total);
    });
    checkoutTwo.getFinishButton().click();
    cy.fixture('messages').then(({ checkoutComplete: msg }) => {
      checkoutComplete.getThankYouHeader().should('have.text', msg.thankYou);
    });
    cy.url().should('include', 'checkout-complete.html');
  });
});
