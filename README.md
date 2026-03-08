# Testes de Interface com Cypress — SauceDemo

Este repositório contém os **testes automatizados de interface (UI)** com **Cypress** para o [SauceDemo](https://www.saucedemo.com). Os cenários cobrem os fluxos:

- **Login** — credenciais válidas, inválidas, usuário bloqueado e campos vazios
- **Checkout** — fluxo completo, múltiplos itens, validação de campos obrigatórios e cancelamento

---

## Estrutura do projeto

| Pasta / arquivo      | Descrição                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `cypress/e2e/`       | Specs por fluxo — `login/*.cy.js` (LOGIN-01 a 05, 6 specs), `checkout/*.cy.js` (CHECKOUT-01 a 06); um spec por cenário para estabilidade |
| `cypress/fixtures/`  | Dados externalizados — usuários/senhas (`users.json`), dados e totais de checkout (`checkout.json`), mensagens de erro (`messages.json`) |
| `cypress/pages/`     | Page Objects — login, inventário, carrinho, checkout (informações, overview, conclusão)                                                  |
| `cypress/support/`   | Configuração global (`e2e.js`), filtro por nome/tags (`@cypress/grep`), comandos reutilizáveis (`commands.js`)                           |
| `cypress/results/`   | Saída da execução — `videos/`, `screenshots/`, `reports/` (Mochawesome + `.jsons/`), `metrics.json` (gerado por `npm run metrics`)       |
| `scripts/`           | `collect-metrics.js` (métricas), `merge-metrics-summary.js` (resumo e tendência no CI), `cypress-run.js` (Windows)                       |
| `.github/workflows/` | CI — `cypress.yml`: jobs paralelos (login + checkout), métricas e artefatos **cypress-results-login** e **cypress-results-checkout**     |
| `cypress.config.js`  | Base URL, viewport 1280×720, vídeo, screenshot em falha, reporter Mochawesome                                                            |

Estrutura de pastas:

```
saucedemo-cy/
├── cypress/
│   ├── e2e/
│   │   ├── login/          # LOGIN-01 a LOGIN-05 (6 specs)
│   │   └── checkout/       # CHECKOUT-01 a CHECKOUT-06 (6 specs)
│   ├── fixtures/
│   │   ├── users.json
│   │   ├── checkout.json
│   │   └── messages.json
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── InventoryPage.js
│   │   ├── CartPage.js
│   │   ├── CheckoutStepOnePage.js
│   │   ├── CheckoutStepTwoPage.js
│   │   └── CheckoutCompletePage.js
│   ├── support/
│   │   ├── e2e.js
│   │   └── commands.js
│   └── results/            # gerada ao rodar os testes
│       ├── videos/
│       ├── screenshots/
│       ├── reports/
│       └── metrics.json    # npm run metrics
├── .github/workflows/
│   └── cypress.yml
├── scripts/
│   ├── cypress-run.js
│   ├── collect-metrics.js
│   └── merge-metrics-summary.js
├── cypress.config.js
├── package.json
└── docs/
    ├── ARCHITECTURE.md
    └── relatorio-automacao-cypress.md
```

A configuração central está em `cypress.config.js`: viewport 1280×720, gravação de vídeo, screenshot automático em falha e execução headless no CI (Cypress em `cypress run`).

---

## Pré-requisitos

- **Node.js** LTS (v18 ou v20 recomendado)
- **npm** 9+
- Acesso à internet para execução dos testes contra o SauceDemo

---

## Configuração do ambiente local

1. **Clonar o repositório**

```bash
git clone <url-do-repositorio>
cd saucedemo-cy
```

2. **Instalar dependências**

```bash
npm install
```

---

## Executando os testes

Com o **PATH configurado** (recomendado no Windows), `npx cypress run` e `npm run cy:run` são equivalentes.

Todos os testes (login + checkout):

```bash
npx cypress run
# ou
npm run cy:run
```

Apenas uma suite:

```bash
npm run cy:run:login
npm run cy:run:checkout
# ou
npx cypress run --spec "cypress/e2e/login/*.cy.js"
npx cypress run --spec "cypress/e2e/checkout/*.cy.js"
```

Um teste específico (por ID ou trecho do nome, via `@cypress/grep`):

```bash
npm run cy:run -- --env grep="LOGIN-01"
npm run cy:run -- --env grep="CHECKOUT-01"
# ou
npx cypress run --env grep="LOGIN-01"
```

Modo interativo (abre o Cypress UI):

```bash
npm run cy:open
```

No Windows, se houver erro de PATH (`chcp` ou PowerShell não reconhecido):

```bash
npm run cy:run:win
```

Gerar métricas após rodar os testes (duração por spec, taxa de sucesso/falha):

```bash
npm run metrics
```

---

## Estrutura de resultados

A execução gera a pasta `cypress/results/` com:

- **reports/** — relatório HTML (Mochawesome) e JSON — resumo e evidências em um único lugar
- **screenshots/** — capturas de tela em caso de falha
- **videos/** — gravações da execução por spec
- **metrics.json** — gerado por `npm run metrics` (duração por spec, taxa de sucesso/falha)

Para gerar métricas após rodar os testes localmente: execute os testes e em seguida `npm run metrics`.

Os relatórios e mídias ficam na mesma pasta para uso local ou após download do artefato no GitHub Actions.

---

## Integração contínua (GitHub Actions)

O workflow em `.github/workflows/cypress.yml`:

- **Execução paralela:** dois jobs independentes — **Cypress (Login)** e **Cypress (Checkout)** — rodam ao mesmo tempo, reduzindo o tempo total da suíte.
- Usa Node.js LTS e instala dependências com `npm ci`.
- Cada job executa apenas sua suite (`--spec "cypress/e2e/login/*.cy.js"` ou `cypress/e2e/checkout/*.cy.js`), gera **métricas** com `scripts/collect-metrics.js` e faz upload do artefato:
  - **cypress-results-login** — vídeos, screenshots, reports e `metrics.json` da suite de login
  - **cypress-results-checkout** — idem para checkout
- Um job **Resumo de métricas** consolida as métricas das duas suites, exibe no _Step Summary_ da run (duração por spec, taxa de sucesso/falha) e calcula **tendência** em relação à execução anterior (cache por branch).

Disparo: em **push** e **pull_request** para os branches `main` e `master`.

Na aba **Actions**, em cada execução é possível baixar os artefatos e ver o resumo de métricas (e tendência) no job _Resumo de métricas_.

---
