# Plano do MVP – App para Cortineiros

Etapa 1 – proposta para aprovação. Nada de código ainda.

## 1. Decisões de stack (e onde divirjo do prompt)

| Tema                 | Decisão                                                              | Por quê                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Banco local          | **expo-sqlite + Drizzle ORM** + fila de sync própria                 | Drizzle dá schema tipado e migrations no SQLite do Expo, sem plugin nativo extra. WatermelonDB exige configuração nativa própria, o desenvolvimento dele desacelerou e o protocolo de sync dele obriga a escrever endpoints de push/pull do mesmo jeito. **Plano B:** PowerSync (sync Supabase↔SQLite pronto) se a sync própria der trabalho demais. |
| Medidas              | Guardadas em **milímetros inteiros**                                 | Mesmo princípio do dinheiro em centavos: sem float no banco nem no motor. A interface mostra e aceita cm/m (ex.: "1,85 m" ou "185 cm").                                                                                                                                                                                                              |
| Percentuais          | **Pontos-base inteiros** (10000 = 100%)                              | Markup e fatores sem float. Fator de franzimento 2,5× = `25000`.                                                                                                                                                                                                                                                                                     |
| PDF                  | Gerado **no próprio celular** com `expo-print` (HTML → PDF)          | Funciona offline; o cortineiro pode entregar o PDF na hora.                                                                                                                                                                                                                                                                                          |
| Página pública       | **Next.js** em `apps/web` (deploy na Vercel)                         | Edge Functions do Supabase não servem `text/html` no domínio padrão (o Supabase reescreve para `text/plain`), então não servem para a página do cliente.                                                                                                                                                                                             |
| Aceite               | Funções Postgres `SECURITY DEFINER` chamadas pela página com o token | Cliente não precisa de login e não enxerga nada além da proposta dele.                                                                                                                                                                                                                                                                               |
| Snapshot da proposta | Ao enviar, o orçamento é **congelado** em um JSON versionado         | O cliente vê exatamente o que foi enviado, mesmo que o cortineiro edite depois (uma edição gera nova versão).                                                                                                                                                                                                                                        |
| IDs                  | **UUID gerado no aparelho**                                          | Necessário para criar registros offline sem colisão.                                                                                                                                                                                                                                                                                                 |
| Número do orçamento  | Atribuído pelo servidor na primeira sincronização                    | Numeração sequencial por empresa não dá para garantir offline. Até sincronizar, aparece como "Rascunho". Enviar link exige internet de qualquer forma.                                                                                                                                                                                               |

Resto do stack conforme o prompt: Expo + expo-router + TypeScript, Supabase (Postgres, Auth, Storage, RLS), pnpm workspaces, Vitest, Zod.

## 2. Estrutura de pastas

```
app-cortinas/
├─ apps/
│  ├─ mobile/                    # Expo (Android prioridade)
│  │  ├─ app/                    # rotas expo-router
│  │  │  ├─ (auth)/login.tsx, cadastro.tsx
│  │  │  └─ (app)/
│  │  │     ├─ orcamentos/index.tsx          # lista
│  │  │     ├─ orcamentos/[id]/index.tsx     # resumo com totais
│  │  │     ├─ orcamentos/[id]/cliente.tsx
│  │  │     ├─ orcamentos/[id]/ambientes/[roomId].tsx
│  │  │     ├─ orcamentos/[id]/itens/[itemId].tsx   # medição + produto
│  │  │     ├─ clientes/…
│  │  │     └─ ajustes/ (empresa, precos, markup)
│  │  └─ src/
│  │     ├─ db/                  # schema Drizzle, migrations SQLite, repositórios
│  │     ├─ sync/                # outbox, push/pull, upload de fotos
│  │     ├─ features/            # lógica por domínio (quotes, customers, pricing…)
│  │     ├─ pdf/                 # template HTML da proposta
│  │     └─ ui/                  # componentes grandes p/ campo (MeasureInput, BigButton…)
│  └─ web/                       # Next.js – proposta pública
│     └─ app/p/[token]/page.tsx
├─ packages/
│  ├─ calc/                      # motor de cálculo – TS puro, sem React/banco
│  │  ├─ src/
│  │  │  ├─ types.ts
│  │  │  ├─ config.ts            # padrões do ofício (TODO: validar com cortineiro)
│  │  │  ├─ rounding.ts, fabric.ts, pricing.ts
│  │  │  └─ products/ gathered.ts, pinch-pleat.ts, wave.ts,
│  │  │                roller.ts, double-vision.ts, horizontal.ts, vertical.ts
│  │  └─ test/                   # casos conferidos à mão + casos reais
│  └─ shared/                    # schemas Zod, tipos, formatadores BR (R$, cm, telefone)
├─ supabase/
│  ├─ migrations/                # schema + RLS + funções
│  └─ seed.sql
├─ docs/  PLANO.md, decisoes/ (registro curto de decisões)
├─ .github/workflows/ci.yml
├─ CLAUDE.md
└─ pnpm-workspace.yaml
```

## 3. Modelo de dados

Convenções em **todas** as tabelas de domínio: `id uuid` (gerado no app), `company_id` (para RLS, mesmo quando derivável), `created_at`, `updated_at`, `deleted_at` (exclusão lógica, necessária para a sync) e `server_seq bigint` (preenchido pelo servidor, cursor do pull).

```
auth.users ─┐
            └─< company_members >── companies ──< customers
                                        │
                                        ├──< price_items (categoria, custo, atributos)
                                        ├──< category_markups
                                        │
                                        └──< quotes >── customers
                                               ├──< quote_options   (Econômica / Intermediária / Premium)
                                               ├──< rooms           (Sala, Quarto 1…)
                                               │      └──< items    (medição)
                                               │             ├──< item_photos
                                               │             └──< item_lines >── quote_options
                                               ├──< quote_versions  (snapshot enviado)
                                               └──< quote_events    (enviado, visualizado, aceito…)
```

**companies** – `name`, `logo_path`, `phone`, `cnpj` (opcional), `default_markup_bps`, `calc_settings jsonb` (padrões do ofício por empresa: fator de franzimento, barras, sobras…), `next_quote_number`.

**company_members** – `company_id`, `user_id`, `role` (`owner` por enquanto). Já prepara multiusuário/multiloja. Uma função `create_company_for_user()` roda no cadastro.

**customers** – `name`, `phone` (com DDD, só dígitos), `address_*` (logradouro, número, complemento, bairro, cidade, UF, CEP), `notes`.

**price_items** – tabela de preços do usuário.

- `category`: `fabric | track | rod | roller_blind | double_vision | horizontal_blind | vertical_blind | accessory | sewing | installation | other`
- `name`, `sku`, `unit` (`m`, `m2`, `un`, `ml`), `cost_cents`, `markup_bps` (opcional, sobrepõe a categoria), `active`
- `attributes jsonb`, validado por Zod conforme a categoria: tecido → `roll_width_mm`, `pattern_repeat_mm`, `railroadable`; persiana → `min_area_mm2`, `max_width_mm`, `max_height_mm`; trilho → `bar_length_mm`…

**category_markups** – `category`, `markup_bps`. Preço de venda = custo × (1 + markup). Prioridade: item > categoria > global.

**quotes** – `customer_id`, `number` (servidor), `status` (`draft | sent | viewed | accepted | rejected`), `public_token` (aleatório, longo), `valid_until`, `notes`, `accepted_option_id`, `sent_at`, `viewed_at`, `decided_at`, `current_version`.

**quote_options** – `label`, `position`. Duas ou três por orçamento; uma só se não houver comparação.

**rooms** – `quote_id`, `name`, `position`.

**items** – a janela/vão medido. `room_id`, `position`, `width_mm`, `height_mm`, `depth_mm` (recuo), `installation` (`ceiling | wall | recess`), `notes`.

**item_photos** – `item_id`, `storage_path`, `local_uri` (só no aparelho), `upload_status`.

**item_lines** – o produto proposto para aquele vão **em cada opção**. `item_id`, `option_id`, `product_type`, `config jsonb` (tecido escolhido, fator, tipo de prega, trilho…), `calc_result jsonb` (consumos, preços unitários usados e premissas), `total_cents`, `calc_version`.
→ Assim, "Sala / janela 1" pode ter rolô básico na opção Econômica e wave com blackout na Premium.

**quote_versions** – `quote_id`, `version`, `snapshot jsonb` (tudo o que a página pública e o PDF mostram, incluindo nome/logo da empresa e preços), `created_at`.

**quote_events** – `quote_id`, `type`, `payload`, `created_at`. Histórico e auditoria; base para notificações no futuro.

**Somente no aparelho (SQLite):** `outbox` (mutações pendentes: tabela, id, operação, payload, tentativas), `sync_state` (último `server_seq` por tabela), `photo_uploads`.

### RLS e acesso público

- Toda tabela: `company_id in (select company_id from company_members where user_id = auth.uid())`.
- Storage: buckets `logos` e `photos`, caminho `{company_id}/…`, com a mesma regra.
- Cliente final (anon): só via `get_public_quote(token)` (devolve o snapshot e marca `viewed`) e `respond_to_quote(token, option_id, accept bool)`. Fotos públicas por URLs assinadas geradas nessa função.

### Sync (resumo)

1. Toda escrita local grava a linha **e** um registro na `outbox` na mesma transação.
2. Com internet: envia a outbox em lote (upsert); o servidor aplica "última escrita vence" por linha comparando `updated_at`.
3. Pull: busca linhas com `server_seq` maior que o último visto, por tabela.
4. Fotos: fila separada; comprime (`expo-image-manipulator`) e sobe ao Storage.
5. Gatilhos: ao abrir o app, ao reconectar (NetInfo), após salvar e periodicamente em primeiro plano.

Conflito real só acontece se a mesma pessoa editar o mesmo orçamento em dois aparelhos offline; "última escrita vence" basta para o MVP.

## 4. Motor de cálculo – contrato

```ts
calculate(input: { product, measurement, config, prices, settings }): CalcResult
// CalcResult = { lines: [{ kind, description, quantity, unit, unitPriceCents, totalCents }],
//                totalCents, assumptions: string[], warnings: string[] }
```

- Funções puras, determinísticas, só inteiros (mm, centavos, pontos-base). Arredondamentos explícitos e configuráveis.
- `assumptions` lista cada padrão usado ("fator 2,5× – padrão da empresa"), para o cortineiro conferir e para ser exibido no app.
- `calc_version` gravado em cada linha: mudar a fórmula não altera orçamentos já enviados.
- Cobertura de 100% exigida no Vitest.

## 5. Etapas

| #   | Etapa                | Entregas                                                                                                                     | Depende de você                                    |
| --- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 1   | **Plano**            | Este documento + `CLAUDE.md`                                                                                                 | Aprovação                                          |
| 2   | **Setup**            | git, pnpm workspaces, Expo (Android), Next.js, Supabase, ESLint/Prettier/TS strict, Vitest, CI no GitHub Actions             | Instalar ferramentas (abaixo); conta GitHub        |
| 3   | **Motor de cálculo** | Cortina franzida e rolô primeiro, depois prega americana, wave, double vision, horizontal, vertical. Testes conferidos à mão | Respostas às perguntas da seção 6; planilhas reais |
| 4   | **Dados e sync**     | Migrations + RLS + testes de RLS; SQLite/Drizzle; outbox; upload de fotos                                                    | —                                                  |
| 5   | **Telas**            | login → lista → novo orçamento → cliente → ambientes → item/medição → resumo                                                 | Feedback de uso                                    |
| 6   | **Preços e markup**  | CRUD, markup global/categoria/item, importação CSV                                                                           | Exemplo da sua tabela atual                        |
| 7   | **Proposta**         | PDF no aparelho, página `/p/[token]`, WhatsApp, aceite/recusa, status                                                        | Domínio (opcional)                                 |
| 8   | **Polimento**        | Onboarding ≤ 5 min, dados de exemplo, erros, build Android (EAS)                                                             | Cortineiros piloto                                 |

### Ambiente desta máquina (verificado agora)

- ✅ Node 24 e npm
- ❌ **git** – necessário para os commits: instalar Git for Windows.
- ❌ **pnpm** – resolvo na etapa 2 via `corepack enable`.
- ❌ **Docker** – o Supabase local precisa dele. Alternativa: usar um **projeto Supabase na nuvem (plano grátis)** só para desenvolvimento, sem Docker.
- ❌ Supabase CLI – instalo como dependência de desenvolvimento do repositório.

## 6. Perguntas do ofício (para a etapa 3)

Vou usar padrões marcados `// TODO: validar com cortineiro` até você responder.

**Cortina de tecido**

1. Fator de franzimento padrão: franzido, prega americana e wave (ex.: 2×, 2,5×, 3×)? Varia conforme o tecido (voil × blackout)?
2. Largura acabada = largura do vão + quanto de sobra de cada lado? Muda com a instalação (teto/parede/vão)?
3. Altura: quanto de barra embaixo, de bainha/cabeçote em cima e quanto de folga do chão?
4. Tecido com largura do rolo maior que a altura (ex.: 2,80 m) é usado "deitado" (sem emendas)? Quando não dá, como conta os panos: arredonda para cima sempre?
5. Repetição de estampa: arredonda cada pano para o múltiplo da repetição?
6. O tecido é vendido em quais incrementos (10 cm, 50 cm, metro inteiro)?
7. Costura: cobra por metro de tecido, por metro de largura acabada ou por pano? Muda com o tipo de prega?
8. Instalação: por peça, por metro de trilho ou por visita?

**Trilho/varão** 9. Sobra de trilho além da largura? Venda em barras de tamanho fixo ou por metro cortado? 10. Acessórios por metro (suportes a cada X cm, deslizantes/ganchos por metro, ponteiras, emendas)?

**Persianas** 11. Área mínima cobrada (ex.: 1 m² ou 1,5 m²)? Largura mínima? 12. Arredonda largura/altura antes de multiplicar (ex.: para os 10 cm seguintes)? 13. Dentro do vão: desconta alguma folga na largura? 14. Tamanhos máximos por modelo, para alertas?

**Comercial** 15. Markup é sobre o custo (custo × 1,8) ou margem sobre a venda? 16. Arredonda o preço final (ex.: para o real ou para os 10 reais seguintes)? 17. Validade padrão da proposta (dias)?

**Medidas improváveis** (para os alertas) 18. Que faixas considera normais? Proposta: largura 30 cm–8 m, altura 30 cm–5 m.
