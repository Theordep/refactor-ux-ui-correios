import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleCheck, TriangleAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "O que melhoramos · Redesign Correios (protótipo acadêmico)",
  description: "Problemas de UX encontrados na consulta de preços e prazos dos Correios e as soluções aplicadas no protótipo.",
};

interface Evidencia {
  src: string;
  largura: number;
  altura: number;
  alt: string;
}

interface Melhoria {
  titulo: string;
  heuristica: string;
  problemas: string[];
  solucoes: string[];
  ondeAplicado: string;
  antes?: Evidencia;
  depois?: Evidencia;
}

function Captura({ evidencia, legenda }: { evidencia: Evidencia; legenda: string }) {
  const estreita = evidencia.largura < 500;
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm font-bold uppercase tracking-wide text-texto-suave">{legenda}</figcaption>
      <a
        href={evidencia.src}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-lg border border-borda bg-superficie shadow-sm"
        aria-label={`${legenda}: ampliar imagem`}
      >
        <Image
          src={evidencia.src}
          width={evidencia.largura}
          height={evidencia.altura}
          alt={evidencia.alt}
          sizes="(min-width: 768px) 460px, 100vw"
          className={`mx-auto h-auto ${estreita ? "max-w-60" : "max-h-[420px] w-full object-cover object-top"}`}
        />
      </a>
    </figure>
  );
}

const MELHORIAS: Melhoria[] = [
  {
    titulo: "A consulta some no meio de distrações",
    heuristica: "Estética e design minimalista (Nielsen #8)",
    problemas: [
      "A parte de cima da página inicial é ocupada por um banner de promoção (Best Friday) que não tem relação com envio.",
      "O assistente virtual aparece por cima dos atalhos e cobre parte deles.",
      "O aviso de cookies ocupa cerca de um quarto da tela até ser aceito.",
      "“Preços e Prazos” é um ícone pequeno dentro de um carrossel, ao lado de outros 6 atalhos.",
    ],
    solucoes: [
      "A calculadora é a própria página inicial: quem entra já começa a preencher.",
      "Nada cobre o formulário: sem pop-ups, carrosséis nem banners.",
    ],
    ondeAplicado: "Página inicial",
    antes: { src: "/analise/01-home-desktop.png", largura: 1366, altura: 800, alt: "Página inicial dos Correios com banner da Best Friday, assistente virtual sobre os atalhos e aviso de cookies cobrindo a parte de baixo" },
    depois: { src: "/prototipo/home-desktop.png", largura: 1366, altura: 800, alt: "Protótipo: a página inicial abre direto na calculadora, sem banners nem pop-ups" },
  },
  {
    titulo: "Não funciona no celular",
    heuristica: "Flexibilidade e eficiência de uso (Nielsen #7) · WCAG 1.4.10 e 2.5.8",
    problemas: [
      "A página não tem a meta tag de viewport: numa tela de 390 px, ela mede 995 px e obriga a rolar para os lados.",
      "Os campos e botões têm 21 px de altura, menos da metade dos 44 px recomendados para toque.",
      "O texto dos campos tem 11 a 12 px.",
    ],
    solucoes: [
      "Layout pensado primeiro para o celular, sem rolagem horizontal.",
      "Campos e botões com pelo menos 44 a 48 px de altura e texto base de 16 px ou mais.",
      "Teclado numérico abre automaticamente nos campos de CEP, peso e medidas.",
    ],
    ondeAplicado: "Todo o protótipo",
    antes: { src: "/analise/05-precos-prazos-mobile.png", largura: 390, altura: 844, alt: "Calculadora atual vista no celular: a página está cortada à direita e tem barra de rolagem horizontal" },
    depois: { src: "/prototipo/home-mobile.png", largura: 390, altura: 844, alt: "Protótipo no celular: uma coluna, sem rolagem lateral, campos grandes" },
  },
  {
    titulo: "É preciso escolher o serviço antes de saber o preço",
    heuristica: "Correspondência com o mundo real (Nielsen #2) · Reconhecer em vez de lembrar (#6)",
    problemas: [
      "O primeiro passo é escolher numa lista de 32 serviços, com nomes internos como “FAC Simples”, “Malote” e “SEDEX COVID A FATURAR”.",
      "A opção de comparar todos os serviços fica escondida num checkbox, que só aparece depois de escolher um serviço.",
    ],
    solucoes: [
      "Não é preciso escolher nada: o resultado compara automaticamente os 5 serviços de encomenda para pessoas físicas.",
      "Cada serviço vem com uma frase simples (“Econômico, para quem não tem pressa”).",
    ],
    ondeAplicado: "Formulário e resultado",
    antes: { src: "/analise/02-precos-prazos-desktop.png", largura: 1351, altura: 1058, alt: "Calculadora atual: data, CEPs e um menu de tipo de serviço, com anúncios de lojas de aplicativo ao lado" },
    depois: { src: "/prototipo/resultado-desktop.png", largura: 1366, altura: 800, alt: "Protótipo: resultado comparando PAC, SEDEX e SEDEX 12 lado a lado, sem precisar escolher o serviço antes" },
  },
  {
    titulo: "O formulário muda de forma no meio do caminho",
    heuristica: "Consistência e padrões (Nielsen #4)",
    problemas: [
      "Ao escolher o serviço, surgem de repente quatro seções novas: formato, embalagem em carrossel, serviços opcionais e peso.",
      "O peso é escolhido numa lista fechada de valores, sem campo livre.",
      "As embalagens aparecem uma de cada vez num carrossel.",
    ],
    solucoes: [
      "Três etapas numeradas e fixas: trajeto, pacote e data.",
      "Os formatos aparecem todos de uma vez, como cartões com as medidas.",
      "O peso aceita qualquer valor e tem atalhos para os pesos mais comuns.",
    ],
    ondeAplicado: "Formulário",
    antes: { src: "/analise/03-form-apos-servico.png", largura: 1351, altura: 1661, alt: "Formulário atual depois de escolher SEDEX: surgem seções de formato, carrossel de embalagens, serviços opcionais e peso" },
    depois: { src: "/prototipo/formulario-completo.png", largura: 1351, altura: 1583, alt: "Protótipo: formulário em três etapas numeradas, com formatos em cartões e atalhos de peso" },
  },
  {
    titulo: "Termos técnicos sem explicação",
    heuristica: "Correspondência com o mundo real (Nielsen #2) · Ajuda e documentação (#10)",
    problemas: [
      "“Mão própria”, “Aviso de recebimento - AR” e “Declaração de valor” aparecem sem dizer o que fazem nem quanto custam.",
      "O aviso fala em “horário limite de postagem (DH)” sem explicar a sigla.",
    ],
    solucoes: [
      "Cada opção diz o que faz em linguagem simples, com o nome oficial entre parênteses e o preço junto.",
      "As opções ficam recolhidas em “Serviços adicionais”, já que a maioria das pessoas não precisa delas (revelação progressiva).",
    ],
    ondeAplicado: "Serviços adicionais",
    antes: { src: "/analise/06-termos-tecnicos.png", largura: 698, altura: 219, alt: "Recortes do site atual: as opções Mão própria, Aviso de recebimento - AR e Declaração de Valor aparecem sem explicação nem preço, e o aviso lateral usa a sigla DH sem explicar" },
    depois: { src: "/prototipo/servicos-adicionais.png", largura: 769, altura: 381, alt: "Protótipo: serviços adicionais explicados em linguagem simples, com o preço de cada um" },
  },
  {
    titulo: "O resultado é difícil de ler",
    heuristica: "Visibilidade do estado do sistema (Nielsen #1) · Ajudar a reconhecer e corrigir erros (#9)",
    problemas: [
      "O resultado abre numa nova aba, e a pessoa perde o formulário de vista.",
      "O prazo aparece como conta (“Dia da Postagem + 5 dias úteis”), e não como uma data.",
      "Serviços indisponíveis ficam como colunas com “-” e um código de erro técnico (“PRZ-008”).",
      "Não há indicação de qual opção é a mais barata ou a mais rápida.",
    ],
    solucoes: [
      "O resultado aparece logo abaixo do formulário, e o foco vai até ele (útil para leitores de tela).",
      "O prazo vira uma data: “Chega até sexta-feira, 27 de novembro”, já descontando fins de semana e feriados.",
      "Selos de “Mais barato” e “Mais rápido”, além de ordenação por preço ou por prazo.",
      "Os serviços indisponíveis ficam numa lista à parte, com o motivo explicado em linguagem simples.",
      "O preço pode ser aberto para mostrar do que é composto: frete, embalagem e adicionais.",
    ],
    ondeAplicado: "Resultado",
    antes: { src: "/analise/04-resultado.png", largura: 995, altura: 1155, alt: "Resultado atual em tabela: colunas vazias para SEDEX Hoje e SEDEX 10, mensagem de erro PRZ-008 e prazos como “Dia da Postagem + 1 dia útil”" },
    depois: { src: "/prototipo/resultado-desktop.png", largura: 1366, altura: 800, alt: "Protótipo: resultado com data real de entrega, selos de mais barato e mais rápido e ordenação" },
  },
  {
    titulo: "Pouca ajuda para evitar erros",
    heuristica: "Prevenção de erros (Nielsen #5) · Ajudar a reconhecer e corrigir erros (#9)",
    problemas: [
      "Ao digitar um CEP incompleto (01310) ou inexistente (99999999) e sair do campo, nada acontece: não há aviso nem confirmação do lugar.",
      "Os erros só aparecem depois de clicar em “Calcular”, um de cada vez, em caixas de alerta do navegador: primeiro “Selecione o tipo de serviço desejado.”, depois “Cep de Origem Inválido!”, depois “Informe o peso para o cálculo de preços da sua encomenda.”",
      "“Cep de Origem Inválido!” não diz o que está errado nem como corrigir.",
      "“Não sei o CEP” abre outro sistema inteiro numa janela por cima, com menu próprio e um CAPTCHA para resolver antes de buscar.",
    ],
    solucoes: [
      "Ao completar o CEP, a cidade ou o estado aparece logo abaixo do campo.",
      "Todos os erros aparecem de uma vez: ao lado de cada campo e num resumo no topo, com links que levam direto ao campo.",
      "As mensagens dizem o que fazer (“O CEP tem 8 números. Confira se faltou algum.”).",
      "“Não sei o CEP” abre uma busca simples por cidade, sem CAPTCHA, e preenche o campo com um clique. Há também um botão para inverter origem e destino.",
      "Se o envio der errado, o que foi preenchido continua no formulário.",
    ],
    ondeAplicado: "Campos de CEP e validação",
    antes: { src: "/analise/07-validacao-cep.png", largura: 1046, altura: 378, alt: "Site atual: formulário com CEP incompleto e CEP inválido sem nenhum aviso, e a janela do “Não sei o CEP” com o sistema Busca CEP e um CAPTCHA" },
    depois: { src: "/prototipo/validacao.png", largura: 1366, altura: 800, alt: "Protótipo: resumo de erros no topo com links para cada campo e mensagens ao lado dos campos" },
  },
  {
    titulo: "Não dá para compartilhar ou guardar a consulta",
    heuristica: "Flexibilidade e eficiência de uso (Nielsen #7)",
    problemas: ["O endereço do resultado não guarda os dados da consulta: para mostrar a alguém, é preciso refazer tudo."],
    solucoes: ["A URL guarda a consulta. O botão “Copiar link desta consulta” gera um link que abre o mesmo resultado."],
    ondeAplicado: "Resultado",
  },
  {
    titulo: "Acessibilidade",
    heuristica: "WCAG 2.2 (níveis A e AA)",
    problemas: [
      "Os controles da barra de acessibilidade são links com “javascript:void(0)” em vez de botões.",
      "Os avisos importantes ficam numa coluna lateral com letra pequena.",
    ],
    solucoes: [
      "Fonte Atkinson Hyperlegible, criada para leitura por pessoas com baixa visão.",
      "Contraste de pelo menos 4,5:1 em todo texto, foco do teclado sempre visível e link “Pular para o conteúdo”.",
      "Rótulos visíveis em todos os campos, erros anunciados para leitores de tela e animações desligadas para quem pede menos movimento.",
      "Bordas de campos e botões com contraste de pelo menos 3:1, e a opção escolhida marcada com um ícone, não só pela cor.",
      "Funciona com o texto ampliado em 200% e com o celular deitado, sem cortar conteúdo.",
    ],
    ondeAplicado: "Todo o protótipo",
  },
];

export default function MelhoriasPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="flex max-w-3xl flex-col gap-3">
        <h1 className="text-3xl font-bold leading-tight text-azul-escuro sm:text-4xl">O que melhoramos</h1>
        <p className="text-lg text-texto-suave">
          Analisamos a consulta de preços e prazos do site dos Correios do ponto de vista de quem só quer saber quanto custa
          enviar um pacote e quando ele chega. As capturas abaixo foram feitas em 25/11/2026, numa simulação real de São
          Paulo para o Rio de Janeiro com 1 kg.
        </p>
        <p>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 font-bold text-azul underline underline-offset-2">
            Testar o protótipo
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </p>
      </div>

      <nav aria-label="Problemas analisados" className="rounded-2xl border border-borda-suave bg-superficie p-5 sm:p-6">
        <h2 className="font-bold">{MELHORIAS.length} problemas analisados</h2>
        <ol className="mt-3 grid list-decimal gap-x-8 gap-y-1 pl-5 sm:grid-cols-2">
          {MELHORIAS.map((m, i) => (
            <li key={m.titulo}>
              <a href={`#melhoria-${i + 1}`} className="text-azul underline underline-offset-2">
                {m.titulo}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <ol className="flex flex-col gap-8">
        {MELHORIAS.map((m, i) => (
          <li key={m.titulo}>
            <article
              id={`melhoria-${i + 1}`}
              aria-labelledby={`titulo-melhoria-${i + 1}`}
              className="scroll-mt-4 overflow-hidden rounded-2xl border border-borda-suave bg-superficie shadow-sm"
            >
              <header className="flex flex-col gap-1 border-b border-borda-suave p-5 sm:p-6">
                <p className="text-sm font-bold uppercase tracking-wide text-texto-suave">Problema {i + 1}</p>
                <h2 id={`titulo-melhoria-${i + 1}`} className="text-2xl font-bold">
                  {m.titulo}
                </h2>
                <p className="text-texto-suave">
                  <span className="font-bold text-texto">Princípio:</span> {m.heuristica}
                  {" · "}
                  <span className="font-bold text-texto">Onde aplicamos:</span> {m.ondeAplicado}
                </p>
              </header>

              <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-erro">
                    <TriangleAlert aria-hidden="true" className="size-5" />
                    No site atual
                  </h3>
                  <ul className="mt-3 flex list-disc flex-col gap-2 pl-5">
                    {m.problemas.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-sucesso">
                    <CircleCheck aria-hidden="true" className="size-5" />
                    No protótipo
                  </h3>
                  <ul className="mt-3 flex list-disc flex-col gap-2 pl-5">
                    {m.solucoes.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {(m.antes || m.depois) && (
                <div className="grid items-start gap-6 border-t border-borda-suave bg-fundo p-5 sm:p-6 md:grid-cols-2">
                  {m.antes && <Captura evidencia={m.antes} legenda="Antes · site atual" />}
                  {m.depois && <Captura evidencia={m.depois} legenda="Depois · protótipo" />}
                  <p className="text-sm text-texto-suave md:col-span-2">Clique numa imagem para ver em tamanho real.</p>
                </div>
              )}
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
