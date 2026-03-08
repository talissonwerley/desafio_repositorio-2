/**
 * CHECKOUT-02 - Checkout de múltiplos produtos com dados válidos
 */
import { CheckoutStepTwoPage } from '../../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../../pages/CheckoutCompletePage';

const checkoutTwo = new CheckoutStepTwoPage();
const checkoutComplete = new CheckoutCompletePage();

describe('Checkout', () => {
  it('CHECKOUT-02 - Checkout de múltiplos produtos com dados válidos', () => {
    cy.addTwoProductsAndGoToCheckout();
    cy.fillCheckoutAndContinue();
    cy.fixture('checkout').then(({ expectedSummary }) => {
      const two = expectedSummary.twoItems;
      checkoutTwo.getSubtotalLabel().should('contain', two.subtotal);
      checkoutTwo.getTaxLabel().should('contain', two.tax);
      checkoutTwo.getTotalLabel().should('contain', two.total);
    });
    checkoutTwo.getFinishButton().click();
    checkoutComplete.getThankYouHeader().should('be.visible');
    cy.url().should('include', 'checkout-complete.html');
  });
});
