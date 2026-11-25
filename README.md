# refactor-ux-ui-correios

Protótipo da disciplina **Projeto Integrador de UX/UI**: um redesign da consulta de **preços e prazos de entrega** do site dos Correios, pensado para quem entra no site só para saber quanto custa enviar um pacote e quando ele chega.

> Projeto acadêmico. Não é o site oficial dos Correios. Não há banco de dados nem integração com sistemas reais: preços, prazos e CEPs são simulados localmente.

## Páginas

| Rota | O que tem |
| --- | --- |
| `/` | A calculadora de frete (o protótipo em si) |
| `/melhorias` | Os 9 problemas encontrados no site atual, com o princípio de usabilidade envolvido, a solução e capturas de antes e depois. Use na apresentação. |

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev        # http://localhost:3000
```

Outros comandos: `npm run build` (build de produção), `npm start` (serve o build) e `npm run lint`.

## Deploy na Vercel

1. Envie o repositório para o GitHub.
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. Mantenha as configurações padrão (o framework Next.js é detectado sozinho) e clique em **Deploy**.

Não há variáveis de ambiente.

## Como a simulação funciona

- **CEP** ([lib/cep.ts](lib/cep.ts)): o estado vem da faixa real de CEP de cada UF. A cidade só é reconhecida para 14 capitais; nos outros casos, aparece o nome do estado.
- **Preço e prazo** ([lib/frete.ts](lib/frete.ts)): os valores dependem da distância (mesmo estado, mesma região, regiões vizinhas ou distantes), do peso e dos adicionais. A tabela é fictícia, mas foi calibrada para coincidir com uma consulta real feita em 25/11/2026 (São Paulo → Rio de Janeiro, 1 kg, caixa P: PAC R$ 30,50, SEDEX R$ 46,80 e SEDEX 12 R$ 69,20).
- **Peso cúbico**: acima de 5 kg, cobra-se o maior valor entre o peso real e comprimento × largura × altura ÷ 6.000.
- **Datas**: o prazo começa a contar no dia útil seguinte à postagem e pula fins de semana e os feriados nacionais de 2026–2027.

## Estrutura

```
app/
  page.tsx               página inicial (calculadora)
  melhorias/page.tsx     análise de UX: antes e depois
  layout.tsx, globals.css  fonte, tokens de cor e layout base
components/
  calculadora.tsx        formulário, validação e link compartilhável
  resultados.tsx         cartões de resultado e ordenação
  campo-cep.tsx          campo de CEP que confirma a cidade
  dialogo-cep.tsx        busca "Não sei o CEP"
  cabecalho.tsx, rodape.tsx
lib/
  cep.ts, frete.ts       a simulação
public/
  analise/               capturas do site atual (antes)
  prototipo/             capturas do protótipo (depois)
design-system/           design system gerado com a skill ui-ux-pro-max
```

## Decisões de design

- **Fonte**: Atkinson Hyperlegible, criada para leitura por pessoas com baixa visão.
- **Cores**: azul `#00416B` e amarelo `#FFD400`, que remetem à marca, com contraste AA verificado em todos os textos.
- **Layout**: uma coluna, pensada primeiro para o celular. Campos e botões têm pelo menos 44 px de altura, e o texto base tem 16 px ou mais.
- **Formulário**: três etapas fixas (trajeto, pacote e data) e serviços adicionais recolhidos por padrão.
- **Acessibilidade**: rótulos visíveis, erros anunciados para leitores de tela, foco visível, link "Pular para o conteúdo" e respeito à preferência por menos movimento (`prefers-reduced-motion`).

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 e ícones lucide-react.
