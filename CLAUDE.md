# CLAUDE.md – App para Cortineiros

## Contexto

MVP de app web instalável (PWA, uso principal no celular) para cortineiros no Brasil (profissionais e pequenas lojas que medem, orçam, fabricam e instalam cortinas e persianas). Concorrente de referência: Decorsoft (ERP web). Diferencial: trabalho em campo, offline, orçamento em menos de 10 minutos pelo celular, fechamento pelo WhatsApp.

**Fluxo do MVP:** medir → calcular → enviar proposta → cliente aceitar.
**Critério de pronto:** orçamento real de 3 ambientes em menos de 10 min, sem ajuda, sem internet.

**Fora do MVP** (não implementar, mas não fechar portas): trena laser Bluetooth, simulação na foto, Pix, agenda/rotas, ordens de produção, estoque, financeiro, NF-e, multiloja.

Plano detalhado, modelo de dados e perguntas abertas: `docs/PLANO.md`.

## Stack

- `apps/web`: **PWA** com Vite + React + React Router (HashRouter) + Tailwind 4 + vite-plugin-pwa. Um app só: telas do cortineiro e proposta pública (`#/p/<token>`). Android Chrome é o alvo principal.
- Hospedagem: GitHub Pages, deploy automático pelo GitHub Actions a cada push na `main` (`BASE_PATH=/<repo>/`).
- Offline: service worker (cache do app) + IndexedDB via Dexie; fila de sync própria (`outbox`). PDF gerado no navegador.
- Backend: Supabase (Postgres, Auth, Storage, RLS por `company_id`).
- `packages/calc`: motor de cálculo em TS puro (sem React, sem banco), Vitest com 100% de cobertura.
- `packages/shared`: schemas Zod, tipos, formatadores BR.
- Monorepo com pnpm workspaces. CI no GitHub Actions.

## Regras

- **Idioma:** interface e textos ao usuário em pt-BR. Código, identificadores e commits em inglês.
- **Formatos BR:** `R$ 1.234,56`, medidas exibidas em m/cm com vírgula, telefone com DDD.
- **Sem float** em dinheiro e medidas: dinheiro em centavos (`*_cents`), medidas em milímetros (`*_mm`), percentuais/fatores em pontos-base (`*_bps`, 10000 = 100%). Converter só na borda da interface.
- **Não inventar fórmulas.** Regra do ofício incerta → configurável, valor padrão com `// TODO: validar com cortineiro` e perguntar ao usuário.
- Motor de cálculo: cada produto com testes de valores conferidos à mão; exemplos reais do usuário viram testes. Todo resultado lista `assumptions` e grava `calc_version`.
- Toda tabela de domínio: `id uuid` gerado no cliente, `company_id`, `created_at`, `updated_at`, `deleted_at`, `server_seq`. Nunca apagar fisicamente dados sincronizáveis.
- Escrita local sempre grava a linha + `outbox` na mesma transação.
- Proposta enviada é imutável: o cliente vê o snapshot em `quote_versions`.
- **UX de campo:** botões grandes, poucos toques, teclado numérico em medidas, uso com uma mão, alto contraste (legível no sol).
- Commits pequenos e claros (inglês). Antes de cada commit: lint, typecheck e testes.
- Ao fim de cada etapa: parar, resumir feito/pendente e esperar o ok do usuário.

## Comandos

```
pnpm install
pnpm check                          # format:check + lint + typecheck + test (rodar antes de commitar)
pnpm lint
pnpm typecheck
pnpm test                           # Vitest; calc exige 100% de cobertura
pnpm format
pnpm --filter @cortinas/web dev     # http://localhost:5173 (também na rede local, para testar no celular)
pnpm --filter @cortinas/web build   # gera apps/web/dist (com service worker)
```

## Versões e armadilhas

- Vite 8, React 19, React Router 8, Tailwind 4, vite-plugin-pwa 1, TypeScript 6.0, ESLint 9, Vitest 5, Zod 4, pnpm 12.
- **TypeScript fixo em 6.0**: typescript-eslint ainda não suporta TS 7.
- **ESLint em 9** (o ecossistema de plugins ainda não acompanha o 10).
- **HashRouter** é proposital: GitHub Pages não reescreve rotas de SPA. Links de proposta ficam `…/#/p/<token>`.
- Pacotes `@cortinas/*` exportam o `src/*.ts` direto (sem build); o Vite transpila.

## Ambiente (Windows, PowerShell)

Node 24, git e pnpm instalados. Sem Docker: Supabase de desenvolvimento será um projeto na nuvem (URL + anon key em `apps/web/.env.local`, ver `.env.example`).
