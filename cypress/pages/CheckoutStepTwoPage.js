/**
 * Page Object: Checkout Step Two - Overview (resumo do pedido)
 */
export class CheckoutStepTwoPage {
  getTitle() {
    return cy.get('[data-test="title"]');
  }

  getSummary() {
    return cy.get('[data-test="checkout-summary-container"]');
  }

  getFinishButton() {
    return cy.get('[data-test="finish"]');
  }

  getCancelButton() {
    return cy.get('[data-test="cancel"]');
  }

  getSubtotalLabel() {
    return cy.get('[data-test="subtotal-label"]');
  }

  getTaxLabel() {
    return cy.get('[data-test="tax-label"]');
  }

  getTotalLabel() {
    return cy.get('[data-test="total-label"]');
  }

  /**
   * Retorna o valor do subtotal (texto do elemento, ex.: "Item total: $29.99")
   */
  getSubtotalValue() {
    return this.getSubtotalLabel().invoke('text');
  }

  getTaxValue() {
    return this.getTaxLabel().invoke('text');
  }

  getTotalValue() {
    return this.getTotalLabel().invoke('text');
  }
}
