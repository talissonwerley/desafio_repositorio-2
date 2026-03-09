# Relatório Técnico — Automação de Testes Cypress (SauceDemo)

**Documento:** Relatório técnico da automação de testes de interface  
**Aplicação alvo:** [SauceDemo](https://www.saucedemo.com)  
**Ferramenta:** Cypress  
**Data de referência:** Estrutura e código do repositório atual

---

## 1. Visão Geral da Automação

### 1.1 Objetivo da automação

O projeto tem como objetivo **automatizar testes de interface (UI)** do site **SauceDemo** utilizando **Cypress**, garantindo cobertura dos fluxos críticos de **login** e **checkout** de forma repetível, documentada e integrada à entrega contínua.

A automação foi desenhada para espelhar conceitualmente as boas práticas de um projeto de referência em Robot Framework (Page Object Model, separação entre testes e lógica reutilizável, dados em fixtures, pipeline CI com relatórios e artefatos), traduzidas para o ecossistema Cypress e JavaScript.

### 1.2 Aplicação testada

- **SauceDemo** — site público de e-commerce de demonstração, usado como alvo estável para testes E2E.
- **URL base:** `https://www.saucedemo.com` (configurada em `cypress.config.js`).

### 1.3 Estratégia utilizada

- **Page Object Model (POM):** cada tela ou etapa do fluxo possui um Page Object em `cypress/pages/`, encapsulando seletores e ações.
- **Comandos customizados:** fluxos reutilizáveis (login, adicionar produto, ir ao checkout, preencher dados) implementados em `cypress/support/commands.js`, mantendo os specs enxutos.
- **Dados externalizados:** usuários, dados de checkout e mensagens de erro em fixtures (`cypress/fixtures/`), sem dados sensíveis ou literais nos testes.
- **Um spec por cenário:** os arquivos de teste estão organizados em um arquivo por cenário (ex.: `login-01.cy.js`, `checkout-03.cy.js`) para evitar timeouts em visitas repetidas no mesmo browser e facilitar execução isolada.
- **Testes independentes:** cada cenário monta seu próprio estado (login, carrinho, etc.), sem depender da ordem de execução.

### 1.4 Escopo da automação

| Área         | Cenários                                                                                                                                        | Arquivos                                           |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Login**    | Credenciais válidas, senha inválida, usuário inválido, usuário bloqueado, campos vazios (username e password)                                   | `login/login-01.cy.js` a `login-05b.cy.js`         |
| **Checkout** | Checkout com 1 produto (dados válidos), com 2 produtos, validação de campos obrigatórios (first name, last name, CEP), cancelamento no overview | `checkout/checkout-01.cy.js` a `checkout-06.cy.js` |

Total: **11 cenários** automatizados (5 de login + 6 de checkout), cobrindo fluxos positivos, negativos e validações de formulário.

---

## 2. Arquitetura do Projeto de Automação

### 2.1 Estrutura de pastas

A organização segue as diretrizes descritas em `docs/ARCHITECTURE.md`:

```
saucedemo-cy/
├── cypress/
│   ├── e2e/                    # Specs por fluxo
│   │   ├── login/              # LOGIN-01 a LOGIN-05 (6 specs)
│   │   └── checkout/           # CHECKOUT-01 a CHECKOUT-06 (6 specs)
│   ├── fixtures/               # Dados externalizados
│   │   ├── users.json
│   │   ├── checkout.json
│   │   └── messages.json
│   ├── pages/                  # Page Objects
│   │   ├── LoginPage.js
│   │   ├── InventoryPage.js
│   │   ├── CartPage.js
│   │   ├── CheckoutStepOnePage.js
│   │   ├── CheckoutStepTwoPage.js
│   │   └── CheckoutCompletePage.js
│   ├── support/
│   │   ├── e2e.js              # Imports, intercepts, uncaught exception
│   │   └── commands.js         # Comandos customizados
│   └── results/                # Saída da execução (gerada ao rodar)
│       ├── videos/
│       ├── screenshots/
│       ├── reports/            # Mochawesome HTML/JSON e .jsons/
│       └── metrics.json        # Gerado por scripts/collect-metrics.js
├── .github/workflows/
│   └── cypress.yml             # Pipeline CI (jobs paralelos + métricas)
├── scripts/
│   ├── cypress-run.js         # Runner no Windows (PATH)
│   ├── collect-metrics.js     # Métricas a partir dos JSONs Mochawesome
│   └── merge-metrics-summary.js # Resumo consolidado e tendência (CI)
├── cypress.config.js
├── package.json
└── docs/
    ├── ARCHITECTURE.md
    └── relatorio-automacao-cypress.md
```

### 2.2 Organização dos testes

- **`cypress/e2e/login/`** — specs `login-01.cy.js` a `login-05b.cy.js`, um cenário por arquivo.
- **`cypress/e2e/checkout/`** — specs `checkout-01.cy.js` a `checkout-06.cy.js`, um cenário por arquivo.

O padrão de specs é `cypress/e2e/**/*.cy.{js,ts}` (definido em `cypress.config.js`). A opção de filtrar por nome ou tag é feita via **@cypress/grep** (ex.: `--env grep="LOGIN-01"`).

### 2.3 Page Object Model

Cada página ou etapa do fluxo possui uma classe que encapsula seletores e, quando útil, ações. Os seletores preferenciais são **data-test** (ex.: `[data-test="username"]`), com fallback para mensagens de erro em `.error-message-container`.

| Page Object              | Responsabilidade                                                          |
| ------------------------ | ------------------------------------------------------------------------- |
| **LoginPage**            | Formulário de login, campos usuário/senha, botão Login, mensagem de erro  |
| **InventoryPage**        | Lista de produtos, botões "Add to cart" por `data-test`, link do carrinho |
| **CartPage**             | Lista do carrinho, botão Checkout, Continue Shopping                      |
| **CheckoutStepOnePage**  | First Name, Last Name, Postal Code, Continue, Cancel, mensagem de erro    |
| **CheckoutStepTwoPage**  | Resumo (subtotal, tax, total via data-test), Finish, Cancel               |
| **CheckoutCompletePage** | Container de conclusão, título "Thank you", texto, Back Home              |

Exemplo real — `cypress/pages/LoginPage.js`:

```javascript
export class LoginPage {
  getLoginForm() {
    return cy.get('[data-test="login-container"]')
  }
  getUsernameInput() {
    return cy.get('[data-test="username"]')
  }
  getPasswordInput() {
    return cy.get('[data-test="password"]')
  }
  getLoginButton() {
    return cy.get('[data-test="login-button"]')
  }
  getErrorMessage() {
    return cy.get('.error-message-container').first()
  }
  // ...
}
```

Exemplo de uso em Page Object de inventário — adicionar produto por slug do `data-test` (`cypress/pages/InventoryPage.js`):

```javascript
addProductByDataTestId(productSlug) {
  cy.get(`[data-test="add-to-cart-${productSlug}"]`).click();
}
```

### 2.4 Separação entre testes e lógica reutilizável

- **Testes:** apenas orquestram passos (visit, login, preencher, clicar, asserções), usando Page Objects e comandos customizados.
- **Lógica reutilizável:**
  - **Page Objects** — seletores e ações por tela.
  - **Comandos customizados** — fluxos como “estar na tela de login”, “logar como standard user”, “adicionar um produto e ir ao checkout”, “preencher checkout e continuar”.

Nenhum dado sensível ou texto de asserção fica nos specs; tudo vem de fixtures ou dos Page Objects.

### 2.5 Comandos customizados

Definidos em `cypress/support/commands.js`, importando os Page Objects e expondo fluxos como comandos Cypress:

| Comando                              | Função                                                               |
| ------------------------------------ | -------------------------------------------------------------------- |
| `cy.visitBase()`                     | Visita a base URL e trata evento `load` (evita timeout com tracking) |
| `cy.visitLogin()`                    | Garante estar na tela de login (visitBase + form visível)            |
| `cy.login(user, pass)`               | Preenche usuário/senha e submete login                               |
| `cy.loginAsStandardUser()`           | Login com usuário padrão do fixture; aguarda inventário visível      |
| `cy.addOneProductAndGoToCheckout()`  | Login padrão, adiciona 1 produto (Backpack), carrinho, Checkout      |
| `cy.addTwoProductsAndGoToCheckout()` | Idem com 2 produtos (Backpack + Bike Light)                          |
| `cy.fillCheckoutAndContinue(data?)`  | Preenche dados de checkout (fixture ou parâmetro) e clica Continue   |

Exemplo de uso nos specs — `checkout-01.cy.js`:

```javascript
cy.addOneProductAndGoToCheckout()
cy.fillCheckoutAndContinue()
// asserções no overview e conclusão
```

---

## 3. Tecnologias Utilizadas

| Tecnologia / ferramenta          | Papel no projeto                                                                                                                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cypress**                      | Framework de testes E2E: execução dos testes, comandos, assertions, gravação de vídeo e screenshots. Versão: ^13.6.0 (package.json).                                                                |
| **Node.js**                      | Runtime para executar Cypress e scripts (npm). CI usa `lts/*`.                                                                                                                                      |
| **JavaScript (ESM)**             | Linguagem dos specs, Page Objects, support e config. Imports em `support/e2e.js` e nos specs.                                                                                                       |
| **GitHub Actions**               | Pipeline de CI: dois jobs paralelos (login e checkout), coleta de métricas, artefatos **cypress-results-login** e **cypress-results-checkout**, job de resumo com tendência.                        |
| **cypress-mochawesome-reporter** | Geração de relatório HTML e JSON em `cypress/results/reports/`, com gráficos e screenshots embutidos. Opção `removeJsonsFolderAfterMerge: false` mantém a pasta `.jsons` para o script de métricas. |
| **@cypress/grep**                | Filtro de testes por nome ou tag (ex.: `--env grep="LOGIN-01"`).                                                                                                                                    |
| **rimraf**                       | Script `clean:results` para limpar `cypress/results`, `cypress/videos`, `cypress/screenshots`.                                                                                                      |

Configuração relevante em `cypress.config.js`:

- **Vídeo:** `video: true`, gravado em `cypress/results/videos`.
- **Screenshot em falha:** `screenshotOnRunFailure: true`, em `cypress/results/screenshots`.
- **Reporter:** `cypress-mochawesome-reporter` com `reportDir: 'cypress/results/reports'`, HTML, JSON, charts, título "SauceDemo - Relatório de Testes Cypress", screenshots embutidos. A opção `removeJsonsFolderAfterMerge: false` mantém a pasta `reports/.jsons/` após o merge, permitindo que `scripts/collect-metrics.js` leia os JSONs e gere as métricas.

---

## 4. Estrutura de Testes Automatizados

### 4.1 Cenários automatizados

**Login (`cypress/e2e/login/`):**

| ID       | Descrição                         | Arquivo           |
| -------- | --------------------------------- | ----------------- |
| LOGIN-01 | Login válido com usuário padrão   | `login-01.cy.js`  |
| LOGIN-02 | Login com senha inválida          | `login-02.cy.js`  |
| LOGIN-03 | Login com usuário inválido        | `login-03.cy.js`  |
| LOGIN-04 | Login com usuário bloqueado       | `login-04.cy.js`  |
| LOGIN-05 | Campos vazios — Username required | `login-05a.cy.js` |
| LOGIN-05 | Campos vazios — Password required | `login-05b.cy.js` |

**Checkout (`cypress/e2e/checkout/`):**

| ID          | Descrição                                        | Arquivo             |
| ----------- | ------------------------------------------------ | ------------------- |
| CHECKOUT-01 | Checkout de um produto com dados válidos         | `checkout-01.cy.js` |
| CHECKOUT-02 | Checkout de múltiplos produtos com dados válidos | `checkout-02.cy.js` |
| CHECKOUT-03 | Checkout sem preencher primeiro nome             | `checkout-03.cy.js` |
| CHECKOUT-04 | Checkout sem preencher sobrenome                 | `checkout-04.cy.js` |
| CHECKOUT-05 | Checkout sem preencher CEP                       | `checkout-05.cy.js` |
| CHECKOUT-06 | Cancelar checkout na tela de overview            | `checkout-06.cy.js` |

### 4.2 Funcionalidades cobertas

- **Login:** sucesso, credenciais inválidas (usuário e senha), usuário bloqueado, validação de campos obrigatórios (username e password).
- **Checkout:** fluxo completo com 1 e 2 produtos, validação de First Name, Last Name e Postal Code, verificação de totais no overview, conclusão (“Thank you”) e cancelamento no overview (retorno ao inventário).

### 4.3 Organização das suítes

- Uma **describe** por arquivo (ex.: `describe('Login', () => { ... })` ou `describe('Checkout', () => { ... })`).
- Um **it** por arquivo, com nome alinhado ao ID (LOGIN-01, CHECKOUT-03, etc.).
- Suítes por pasta: `login/*.cy.js` e `checkout/*.cy.js`, permitindo rodar apenas login ou apenas checkout via `--spec`.

### 4.4 Uso de Page Objects nos testes

- **Login:** os specs importam `LoginPage` (e quando necessário `InventoryPage`), usam `getUsernameInput()`, `getPasswordInput()`, `getLoginButton()`, `getErrorMessage()` e `getInventoryList()` para asserções.
- **Checkout:** importam `CheckoutStepOnePage`, `CheckoutStepTwoPage`, `CheckoutCompletePage`, `InventoryPage`; usam comandos `cy.addOneProductAndGoToCheckout()`, `cy.addTwoProductsAndGoToCheckout()`, `cy.fillCheckoutAndContinue()` que internamente usam os Page Objects; nos testes usam métodos como `getSubtotalLabel()`, `getFinishButton()`, `getThankYouHeader()`, `getErrorMessage()`, etc.

Dados de usuário, checkout e mensagens vêm de `cy.fixture('users')`, `cy.fixture('checkout')` e `cy.fixture('messages')`.

---

## 5. Fluxo de Execução dos Testes

### 5.1 Execução local

**Pré-requisitos:** Node.js LTS (v18 ou v20 recomendado), npm 9+, acesso à internet.

1. **Instalação de dependências**

   ```bash
   npm install
   ```

2. **Execução dos testes**
   - Todos os testes:
     ```bash
     npx cypress run
     # ou
     npm run cy:run
     ```
   - Apenas login ou checkout:
     ```bash
     npm run cy:run:login
     npm run cy:run:checkout
     ```
     (equivalentes a `--spec "cypress/e2e/login/*.cy.js"` e `--spec "cypress/e2e/checkout/*.cy.js"`).
   - Teste específico (via @cypress/grep):
     ```bash
     npm run cy:run -- --env grep="LOGIN-01"
     npm run cy:run -- --env grep="CHECKOUT-01"
     ```
   - Modo interativo (Cypress UI):
     ```bash
     npm run cy:open
     ```
   - No Windows, se houver problema de PATH com `chcp`/PowerShell:
     ```bash
     npm run cy:run:win
     ```
     (usa `scripts/cypress-run.js`, que ajusta `PATH` e chama `npx cypress run`).
   - Gerar métricas após a execução (duração por spec, taxa de sucesso):
     ```bash
     npm run metrics
     ```
     (gera `cypress/results/metrics.json` a partir dos JSONs em `cypress/results/reports/.jsons/`).

### 5.2 Execução em CI

- O workflow `.github/workflows/cypress.yml` é disparado em **push** e **pull_request** para os branches **main** e **master**.
- **Execução paralela:** dois jobs rodam ao mesmo tempo:
  - **Cypress (Login):** `npx cypress run --spec "cypress/e2e/login/*.cy.js"`.
  - **Cypress (Checkout):** `npx cypress run --spec "cypress/e2e/checkout/*.cy.js"`.
- Em cada job de testes: checkout, setup Node.js LTS, `npm ci`, criação das pastas de resultados, execução do Cypress, **coleta de métricas** (`node scripts/collect-metrics.js`), upload do artefato (**cypress-results-login** ou **cypress-results-checkout**) com `cypress/results/` (vídeos, screenshots, reports, `metrics.json`), com `if: always()` e `retention-days: 10`.
- Um terceiro job, **Resumo de métricas**, depende dos dois anteriores: baixa os dois artefatos, restaura o cache de métricas da execução anterior (para tendência), executa `node scripts/merge-metrics-summary.js` (consolida métricas e escreve no _Step Summary_ do GitHub Actions) e grava o cache para a próxima execução.

Os relatórios Mochawesome são gerados durante o `cypress run`; o script `collect-metrics.js` lê os JSONs em `cypress/results/reports/.jsons/` (mantidos graças a `removeJsonsFolderAfterMerge: false` em `cypress.config.js`) e gera `cypress/results/metrics.json`.

---

## 6. Observabilidade e Debug

### 6.1 Screenshots automáticos

- **Configuração:** `screenshotOnRunFailure: true` em `cypress.config.js`.
- **Pasta:** `cypress/results/screenshots/`.
- Em caso de falha, o Cypress grava o screenshot nessa pasta; o Mochawesome pode embutir screenshots no relatório (`embeddedScreenshots: true`).

### 6.2 Gravação de vídeos

- **Configuração:** `video: true`, `videosFolder: 'cypress/results/videos'`.
- Cada spec gera um vídeo da execução, disponível localmente em `cypress/results/videos/` e no artefato **cypress-results** no CI.

### 6.3 Métricas de qualidade

- **Script `scripts/collect-metrics.js`:** lê os JSONs do Mochawesome em `cypress/results/reports/.jsons/` e gera **`cypress/results/metrics.json`** com duração por spec, quantidade de testes passados/falhos e taxa de sucesso. Em CI, preenche o _Step Summary_ do job com uma tabela em Markdown.
- **Script `scripts/merge-metrics-summary.js`:** usado no job **Resumo de métricas** do CI; consolida as métricas dos artefatos login e checkout, exibe no _Step Summary_ e calcula **tendência** (variação de duração e taxa de sucesso em relação à execução anterior), usando cache por branch (`test-metrics-${{ github.ref }}`).
- Comando local: `npm run metrics` (ou `node scripts/collect-metrics.js`) após rodar os testes.

### 6.4 Logs de execução

- Saída padrão do `cypress run` no terminal (e no log do job do GitHub Actions).
- O reporter Mochawesome gera relatório HTML e JSON em `cypress/results/reports/`, com resumo, gráficos e evidências.

### 6.5 Relatórios gerados pelo Cypress

- **Ferramenta:** `cypress-mochawesome-reporter`.
- **Opções em uso:** `reportDir: 'cypress/results/reports'`, `html: true`, `json: true`, `charts: true`, `reportPageTitle: 'SauceDemo - Relatório de Testes Cypress'`, `embeddedScreenshots: true`, `inlineAssets: true`.
- O plugin é registrado em `setupNodeEvents` e o suporte em `cypress/support/e2e.js` com `import 'cypress-mochawesome-reporter/register'`.

Além disso, o projeto trata estabilidade e ruído de rede no `support/e2e.js`:

- Intercept de URLs de tracking/analytics do SauceDemo para evitar que o evento `load` nunca dispare (timeout).
- `Cypress.on('uncaught:exception')` para não falhar o teste em erros conhecidos de recurso (ex.: unique-events).

---

## 7. Integração Contínua (CI)

### 7.1 Quando o pipeline é executado

- **Eventos:** `push` e `pull_request`.
- **Branches:** `main` e `master`.

Definição em `.github/workflows/cypress.yml`:

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
```

### 7.2 Jobs e execução paralela

O pipeline possui **três jobs**:

| Job                    | Descrição                                                                  |
| ---------------------- | -------------------------------------------------------------------------- |
| **Cypress (Login)**    | Roda em paralelo com Checkout; executa apenas `cypress/e2e/login/*.cy.js`. |
| **Cypress (Checkout)** | Roda em paralelo com Login; executa apenas `cypress/e2e/checkout/*.cy.js`. |
| **Resumo de métricas** | Depende dos dois anteriores; consolida métricas e tendência.               |

Os jobs **cypress-login** e **cypress-checkout** não dependem um do outro, reduzindo o tempo total da suíte.

### 7.3 Etapas de cada job de testes (Login e Checkout)

| Ordem | Nome do step                          | Ação                                                                                                                                                       |
| ----- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Checkout repository                   | `actions/checkout@v4`                                                                                                                                      |
| 2     | Set up Node.js                        | `actions/setup-node@v4`, `node-version: 'lts/*'`, `cache: 'npm'`                                                                                           |
| 3     | Install dependencies                  | `npm ci`                                                                                                                                                   |
| 4     | Create results directory              | `mkdir -p cypress/results/videos cypress/results/screenshots cypress/results/reports`                                                                      |
| 5     | Run Cypress tests (login ou checkout) | `npx cypress run --spec "cypress/e2e/login/*.cy.js"` ou `cypress/e2e/checkout/*.cy.js`                                                                     |
| 6     | Collect metrics                       | `node scripts/collect-metrics.js` (`if: always()`)                                                                                                         |
| 7     | Upload Cypress results                | `actions/upload-artifact@v4`, nome **cypress-results-login** ou **cypress-results-checkout**, path `cypress/results`, `if: always()`, `retention-days: 10` |

### 7.4 Etapas do job Resumo de métricas

| Ordem | Nome do step                    | Ação                                                                                   |
| ----- | ------------------------------- | -------------------------------------------------------------------------------------- |
| 1     | Checkout repository             | `actions/checkout@v4`                                                                  |
| 2     | Restore previous metrics        | `actions/cache/restore@v4`, path `metrics-cache`, key `test-metrics-${{ github.ref }}` |
| 3     | Download results (login)        | `actions/download-artifact@v4`, name `cypress-results-login`                           |
| 4     | Download results (checkout)     | `actions/download-artifact@v4`, name `cypress-results-checkout`                        |
| 5     | Merge metrics and write summary | `node scripts/merge-metrics-summary.js` (escreve no _Step Summary_)                    |
| 6     | Save metrics for next run       | `actions/cache/save@v4`, path `metrics-cache`, key `test-metrics-${{ github.ref }}`    |

O job **Resumo de métricas** só roda se ambos os jobs de teste tiverem concluído (sucesso ou falha). A tendência (variação de duração e taxa de sucesso) é exibida a partir da segunda execução na mesma branch.

### 7.5 Artefatos

| Artefato                     | Conteúdo                                                                     | Retenção |
| ---------------------------- | ---------------------------------------------------------------------------- | -------- |
| **cypress-results-login**    | `cypress/results/` do job Login (videos, screenshots, reports, metrics.json) | 10 dias  |
| **cypress-results-checkout** | `cypress/results/` do job Checkout (idem)                                    | 10 dias  |

Ambos os uploads usam `if: always()`, de modo que os artefatos são gerados mesmo quando os testes falham, permitindo análise pelos relatórios, vídeos e screenshots.

---

## 8. Benefícios da Automação

- **Execução automática:** testes rodam em todo push/PR para main/master, sem intervenção manual.
- **Execução paralela no CI:** dois jobs (login e checkout) rodam ao mesmo tempo, reduzindo o tempo total da suíte em relação à execução sequencial.
- **Métricas de qualidade:** duração por spec, taxa de sucesso/falha e tendência ao longo do tempo (via cache por branch) ficam visíveis no _Step Summary_ do job **Resumo de métricas** e no arquivo `metrics.json` em cada artefato.
- **Maior confiabilidade:** cenários de login e checkout são exercitados de forma repetível; uso de seletores estáveis (data-test) e esperas implícitas do Cypress reduz flakiness.
- **Feedback rápido:** o time recebe resultado do pipeline e, em caso de falha, acessa relatório, vídeos e screenshots pelos artefatos **cypress-results-login** e **cypress-results-checkout**.
- **Facilidade de manutenção:** Page Objects centralizam seletores; alterações na aplicação são refletidas em poucos arquivos; comandos customizados evitam duplicação nos specs.
- **Escalabilidade:** estrutura por fluxo (login, checkout), um spec por cenário e comandos reutilizáveis permitem adicionar novos cenários ou fluxos sem desorganizar o projeto.

---
