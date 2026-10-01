# CLAUDE.md – App para Cortineiros

## Contexto

MVP de app mobile para cortineiros no Brasil (profissionais e pequenas lojas que medem, orçam, fabricam e instalam cortinas e persianas). Concorrente de referência: Decorsoft (ERP web). Diferencial: trabalho em campo, offline, orçamento em menos de 10 minutos pelo celular, fechamento pelo WhatsApp.

**Fluxo do MVP:** medir → calcular → enviar proposta → cliente aceitar.
**Critério de pronto:** orçamento real de 3 ambientes em menos de 10 min, sem ajuda, sem internet.

**Fora do MVP** (não implementar, mas não fechar portas): trena laser Bluetooth, simulação na foto, Pix, agenda/rotas, ordens de produção, estoque, financeiro, NF-e, multiloja.

Plano detalhado, modelo de dados e perguntas abertas: `docs/PLANO.md`.

## Stack

- `apps/mobile`: Expo + React Native + TypeScript + expo-router. Android prioritário.
- Offline: expo-sqlite + Drizzle ORM; fila de sync própria (`outbox`). PDF no aparelho via expo-print.
- Backend: Supabase (Postgres, Auth, Storage, RLS por `company_id`).
- `apps/web`: Next.js – página pública da proposta (`/p/[token]`) e aceite.
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

_A definir na etapa 2 (setup). Previstos:_

```
pnpm install
pnpm lint
pnpm typecheck
pnpm test                       # Vitest em todos os pacotes
pnpm --filter calc test -- --coverage
pnpm --filter mobile start      # Expo
pnpm --filter web dev           # Next.js
```

## Ambiente (Windows, PowerShell)

Node 24 instalado. Faltam: git, pnpm (via `corepack enable`), Docker (para Supabase local) ou projeto Supabase de desenvolvimento na nuvem.
