# Prompt inicial para o Claude Code – App para Cortineiros

> Cole tudo abaixo da linha no Claude Code, dentro de uma pasta vazia do projeto.
> Dica: comece em modo de planejamento (Shift+Tab até "plan mode") para revisar o plano antes de qualquer código.

---

Você vai me ajudar a construir o MVP de um app para cortineiros (profissionais e pequenas lojas que medem, orçam, fabricam e instalam cortinas e persianas no Brasil). O concorrente de referência é o Decorsoft, um ERP web de nicho. Nosso diferencial é o trabalho em campo: medir e orçar na casa do cliente, pelo celular, em menos de 10 minutos, e fechar a venda pelo WhatsApp.

## Objetivo do MVP

Um único fluxo de ponta a ponta, funcionando bem:

**medir → calcular → enviar proposta → cliente aceitar**

Critério de pronto: um cortineiro faz um orçamento real de 3 ambientes em menos de 10 minutos, sem ajuda, inclusive sem internet.

## Escopo do MVP (só isto)

1. **Autenticação**: cadastro e login por e-mail/senha (depois telefone). Cada usuário tem sua "empresa" (nome, logo, telefone, CNPJ opcional).
2. **Clientes**: cadastro rápido (nome, telefone/WhatsApp, endereço).
3. **Orçamento**: um orçamento tem vários **ambientes** (Sala, Quarto 1…), e cada ambiente tem um ou mais **itens**.
4. **Medição por item**: largura, altura, recuo/profundidade, tipo de instalação (teto, parede, dentro do vão), observações e fotos da janela. Campos obrigatórios validados, com alertas para medidas improváveis.
5. **Motor de cálculo** (o coração do produto) para:
   - Cortina de tecido: franzido, prega americana (macho/fêmea), wave
   - Persiana rolô, double vision (rolô duplo), horizontal e vertical
   - Calcula consumo de tecido (largura do rolo, fator de franzimento, barras, emendas, repetição de estampa), trilho/varão, acessórios, mão de obra de costura e instalação
6. **Tabela de preços** própria do usuário (tecidos, trilhos, varões, persianas por m², acessórios, serviços), com **markup** configurável global e por categoria.
7. **Proposta**: PDF e página pública por link, com a logo da empresa, ambientes, itens, fotos e 2 ou 3 opções lado a lado (ex.: econômica / intermediária / premium). Botão para compartilhar no WhatsApp.
8. **Aceite**: o cliente abre o link, escolhe a opção e aceita. Status do orçamento: rascunho, enviado, visualizado, aceito, recusado.
9. **Offline-first**: todo o fluxo de medição e orçamento funciona sem internet; sincroniza automaticamente ao reconectar.

**Fora do MVP** (não implemente agora, mas não feche portas na arquitetura): trena laser Bluetooth, simulação da cortina na foto, Pix, agenda e rotas de instalação, ordens de produção, estoque, financeiro, NF-e, multi-loja.

## Stack

- **App**: React Native com Expo (TypeScript, expo-router). Android é prioridade; iOS vem junto pelo mesmo código.
- **Offline**: expo-sqlite (ou WatermelonDB, se você justificar) como fonte local, com fila de sincronização.
- **Backend**: Supabase (Postgres, Auth, Storage para fotos e logos, Row Level Security por empresa).
- **Proposta pública**: página web leve (pode ser Next.js ou uma Edge Function do Supabase servindo HTML) + geração de PDF.
- **Motor de cálculo**: pacote TypeScript puro e isolado (sem dependência de React ou banco), 100% coberto por testes com Vitest.
- **Monorepo** com pnpm workspaces: `apps/mobile`, `apps/web` (proposta pública), `packages/calc` (motor de cálculo), `packages/shared` (tipos e schemas Zod).

Se discordar de alguma escolha, explique o motivo antes de trocar.

## Regras de trabalho

- **Idioma**: toda a interface, mensagens e textos voltados ao usuário em português do Brasil. Código, nomes de variáveis e commits em inglês.
- **Formatos brasileiros**: moeda em R$ (vírgula decimal), medidas em metros/centímetros, telefone com DDD.
- **Dinheiro**: nunca use float para valores monetários; trabalhe em centavos (inteiros).
- **Não invente fórmulas de cálculo.** Onde a regra do ofício não estiver clara (fator de franzimento padrão, barra, sobra de trilho, arredondamentos, mínimo de m² em persianas), deixe configurável, use um valor padrão marcado como `// TODO: validar com cortineiro` e me pergunte. Vou trazer planilhas e casos reais.
- **Testes do motor de cálculo**: cada tipo de produto precisa de casos de teste com valores conferidos à mão. Quando eu passar exemplos reais, transforme em testes.
- **UX de campo**: botões grandes, poucos toques, teclado numérico nos campos de medida, funciona com uma mão, legível no sol.
- **Commits pequenos** e frequentes, com mensagens claras. Rode lint, typecheck e testes antes de cada commit.
- Ao terminar cada etapa, pare, resuma o que foi feito e o que falta, e espere meu ok para a próxima.

## Ordem das etapas

1. **Plano**: leia este prompt, proponha a estrutura de pastas, o modelo de dados (tabelas e relações) e o plano de etapas. Crie o `CLAUDE.md` do projeto resumindo contexto, stack, regras e comandos. Espere minha aprovação.
2. **Setup**: monorepo, Expo, Supabase local, lint/format/typecheck, Vitest, CI simples (GitHub Actions).
3. **Motor de cálculo** (`packages/calc`): tipos, fórmulas por produto, testes. Comece por cortina franzida e persiana rolô.
4. **Modelo de dados e sync**: schema no Supabase com RLS, banco local, fila de sincronização offline.
5. **Telas do app**: login → lista de orçamentos → novo orçamento → cliente → ambientes → itens/medição → resumo com totais.
6. **Tabela de preços e markup**: CRUD e importação por CSV.
7. **Proposta**: geração de PDF, página pública por link, compartilhamento no WhatsApp, aceite e status.
8. **Polimento para os pilotos**: onboarding em até 5 minutos, dados de exemplo, tratamento de erros, build de teste para Android (EAS).

Comece pela etapa 1.
