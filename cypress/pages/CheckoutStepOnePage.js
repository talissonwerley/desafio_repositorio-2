/**
 * Page Object: Checkout Step One - Your Information (SauceDemo)
 */
export class CheckoutStepOnePage {
  getForm() {
    return cy.get('[data-test="checkout-info-container"]');
  }

  getFirstnameInput() {
    return cy.get('[data-test="firstName"]');
  }

  getLastnameInput() {
    return cy.get('[data-test="lastName"]');
  }

  getPostalCodeInput() {
    return cy.get('[data-test="postalCode"]');
  }

  getContinueButton() {
    return cy.get('[data-test="continue"]');
  }

  getCancelButton() {
    return cy.get('[data-test="cancel"]');
  }

  /** Mensagem de erro: SauceDemo usa .error-message-container */
  getErrorMessage() {
    return cy.get('.error-message-container').first();
  }

  fillFirstname(value) {
    this.getFirstnameInput().clear().type(value);
  }

  fillLastname(value) {
    this.getLastnameInput().clear().type(value);
  }

  fillPostalCode(value) {
    this.getPostalCodeInput().clear().type(value);
  }
}
