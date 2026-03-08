/**
 * Page Object: Carrinho (Your Cart) - SauceDemo
 */
export class CartPage {
  getCartList() {
    return cy.get('[data-test="cart-list"]');
  }

  getCheckoutButton() {
    return cy.get('[data-test="checkout"]');
  }

  getContinueShoppingButton() {
    return cy.get('[data-test="continue-shopping"]');
  }

  getTitle() {
    return cy.get('[data-test="title"]');
  }
}
