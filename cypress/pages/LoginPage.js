/**
 * Page Object: Login (SauceDemo)
 * Seletores estáveis: data-test (recomendado pela doc Cypress)
 */
export class LoginPage {
  getLoginForm() {
    return cy.get('[data-test="login-container"]');
  }

  getUsernameInput() {
    return cy.get('[data-test="username"]');
  }

  getPasswordInput() {
    return cy.get('[data-test="password"]');
  }

  getLoginButton() {
    return cy.get('[data-test="login-button"]');
  }

  /** Mensagem de erro: SauceDemo usa .error-message-container (pode conter h3) */
  getErrorMessage() {
    return cy.get('.error-message-container').first();
  }

  /** Ação: preencher usuário e senha e clicar em Login */
  login(username, password) {
    this.getUsernameInput().clear().type(username);
    this.getPasswordInput().clear().type(password);
    this.getLoginButton().click();
  }
}
