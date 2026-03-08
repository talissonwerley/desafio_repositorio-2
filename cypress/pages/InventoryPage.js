/**
 * Page Object: Inventory / Listagem de produtos (SauceDemo)
 */
export class InventoryPage {
  getInventoryList() {
    return cy.get('[data-test="inventory-list"]');
  }

  getShoppingCartLink() {
    return cy.get('[data-test="shopping-cart-link"]');
  }

  getInventoryContainer() {
    return cy.get('[data-test="inventory-container"]');
  }

  /**
   * Adiciona ao carrinho pelo data-test do botão (ex.: sauce-labs-backpack -> add-to-cart-sauce-labs-backpack)
   * @param {string} productSlug - parte do data-test após "add-to-cart-" (ex.: sauce-labs-backpack)
   */
  addProductByDataTestId(productSlug) {
    cy.get(`[data-test="add-to-cart-${productSlug}"]`).click();
  }

  getProductSortContainer() {
    return cy.get('[data-test="product-sort-container"]');
  }
}
