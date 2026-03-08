/**
 * Page Object: Checkout Complete - Thank you
 */
export class CheckoutCompletePage {
  getCompleteContainer() {
    return cy.get('[data-test="checkout-complete-container"]');
  }

  getThankYouHeader() {
    return cy.get('[data-test="complete-header"]');
  }

  getCompleteText() {
    return cy.get('[data-test="complete-text"]');
  }

  getBackHomeButton() {
    return cy.get('[data-test="back-to-products"]');
  }
}
