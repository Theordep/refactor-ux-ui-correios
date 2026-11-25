// Motor de simulação de frete. Os valores são FICTÍCIOS, calibrados apenas para
// ficarem próximos de uma consulta real (SP → RJ, 1 kg, em 25/11/2026:
// PAC R$ 30,50 · SEDEX R$ 46,80 · SEDEX 12 R$ 69,20). Projeto acadêmico.

import type { LocalCep, Regiao } from "./cep";

export type ServicoId = "pac" | "sedex" | "sedex12" | "sedex10" | "sedexhoje";

export interface Servico {
  id: ServicoId;
  nome: string;
  resumo: string;
  pesoMaxKg: number;
}

export const SERVICOS: Servico[] = [
  { id: "pac", nome: "PAC", resumo: "Econômico, para quem não tem pressa", pesoMaxKg: 30 },
  { id: "sedex", nome: "SEDEX", resumo: "Expresso, entrega mais rápida", pesoMaxKg: 30 },
  { id: "sedex12", nome: "SEDEX 12", resumo: "Chega até as 12h do dia útil seguinte", pesoMaxKg: 10 },
  { id: "sedex10", nome: "SEDEX 10", resumo: "Chega até as 10h do dia útil seguinte", pesoMaxKg: 10 },
  { id: "sedexhoje", nome: "SEDEX Hoje", resumo: "Entrega no mesmo dia, na mesma cidade", pesoMaxKg: 10 },
];

export type FormatoId = "envelope" | "caixa-p" | "caixa-m" | "caixa-g" | "personalizado";

export interface Formato {
  id: FormatoId;
  nome: string;
  detalhe: string;
  dimensoes?: { comprimento: number; largura: number; altura: number };
  precoEmbalagem: number;
}

export const FORMATOS: Formato[] = [
  { id: "envelope", nome: "Envelope", detalhe: "Documentos e papéis", dimensoes: { comprimento: 32, largura: 23, altura: 2 }, precoEmbalagem: 2.9 },
  { id: "caixa-p", nome: "Caixa pequena", detalhe: "24 × 16 × 8 cm · celular, livro", dimensoes: { comprimento: 24, largura: 16, altura: 8 }, precoEmbalagem: 7.4 },
  { id: "caixa-m", nome: "Caixa média", detalhe: "30 × 22 × 12 cm · roupas, calçado", dimensoes: { comprimento: 30, largura: 22, altura: 12 }, precoEmbalagem: 9.9 },
  { id: "caixa-g", nome: "Caixa grande", detalhe: "40 × 30 × 20 cm · eletrônicos", dimensoes: { comprimento: 40, largura: 30, altura: 20 }, precoEmbalagem: 14.5 },
  { id: "personalizado", nome: "Outras medidas", detalhe: "Informe as medidas do seu pacote", precoEmbalagem: 0 },
];

export const PRECO_MAO_PROPRIA = 9.2;
export const PRECO_AVISO_RECEBIMENTO = 8.5;
export const TAXA_VALOR_DECLARADO = 0.015;
export const VALOR_DECLARADO_MAX = 10000;

export interface PedidoFrete {
  origem: LocalCep;
  destino: LocalCep;
  dataPostagem: Date;
  pesoKg: number;
  dimensoes: { comprimento: number; largura: number; altura: number };
  formato: FormatoId;
  comprarEmbalagem: boolean;
  maoPropria: boolean;
  avisoRecebimento: boolean;
  valorDeclarado: number; // 0 = sem declaração
}

export interface ItemPreco {
  rotulo: string;
  valor: number;
}

export interface Cotacao {
  servico: Servico;
  disponivel: boolean;
  motivo?: string;
  diasUteis?: number;
  entregaAte?: Date;
  horario?: string;
  itens: ItemPreco[];
  total: number;
}

export interface ResultadoFrete {
  cotacoes: Cotacao[];
  pesoInformado: number;
  pesoConsiderado: number;
  pesoCubico: number;
  maisBarato?: ServicoId;
  maisRapido?: ServicoId;
}

// --- Distância -----------------------------------------------------------------

/** 0 = mesmo estado · 1 = mesma região · 2 = regiões vizinhas · 3 = regiões distantes */
type Faixa = 0 | 1 | 2 | 3;

const DISTANTES = new Set(["S-N", "N-S", "S-NE", "NE-S", "SE-N", "N-SE"]);

function faixaDistancia(a: LocalCep, b: LocalCep): Faixa {
  if (a.uf === b.uf) return 0;
  if (a.regiao === b.regiao) return 1;
  return DISTANTES.has(`${a.regiao}-${b.regiao}` as `${Regiao}-${Regiao}`) ? 3 : 2;
}

function mesmaCidade(a: LocalCep, b: LocalCep): boolean {
  if (a.cidade && b.cidade) return a.cidade === b.cidade;
  return a.cep.slice(0, 3) === b.cep.slice(0, 3);
}

// --- Tabelas fictícias (por faixa de distância) --------------------------------

const TABELA: Record<ServicoId, { base: (number | null)[]; porKg: (number | null)[]; dias: (number | null)[] }> = {
  pac: { base: [22.4, 30.5, 38.9, 52.3], porKg: [3.1, 5.2, 8.4, 12.6], dias: [3, 5, 7, 10] },
  sedex: { base: [28.9, 46.8, 61.7, 84.2], porKg: [4.2, 8.9, 13.5, 19.8], dias: [1, 1, 3, 4] },
  sedex12: { base: [52.1, 69.2, null, null], porKg: [6.1, 11.3, null, null], dias: [1, 1, null, null] },
  sedex10: { base: [58.4, null, null, null], porKg: [7.2, null, null, null], dias: [1, null, null, null] },
  sedexhoje: { base: [64.9, null, null, null], porKg: [8, null, null, null], dias: [0, null, null, null] },
};

// --- Datas -----------------------------------------------------------------------

const FERIADOS = new Set([
  "2026-12-25",
  "2027-01-01", "2027-03-26", "2027-04-21", "2027-05-01", "2027-09-07",
  "2027-10-12", "2027-11-02", "2027-11-15", "2027-11-20", "2027-12-25",
]);

function chave(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function ehDiaUtil(d: Date): boolean {
  const semana = d.getDay();
  return semana !== 0 && semana !== 6 && !FERIADOS.has(chave(d));
}

function proximoDiaUtil(d: Date): Date {
  const r = new Date(d);
  while (!ehDiaUtil(r)) r.setDate(r.getDate() + 1);
  return r;
}

/** O prazo conta a partir do primeiro dia útil seguinte ao da postagem. */
export function somarDiasUteis(postagem: Date, dias: number): Date {
  let r = proximoDiaUtil(postagem);
  for (let i = 0; i < dias; i++) {
    r = new Date(r);
    r.setDate(r.getDate() + 1);
    r = proximoDiaUtil(r);
  }
  return r;
}

// --- Cálculo ---------------------------------------------------------------------

const arred = (v: number) => Math.round(v * 100) / 100;

export function calcularPesoCubico(d: { comprimento: number; largura: number; altura: number }): number {
  return arred((d.comprimento * d.largura * d.altura) / 6000);
}

export function calcularFrete(p: PedidoFrete): ResultadoFrete {
  const faixa = faixaDistancia(p.origem, p.destino);
  const pesoCubico = calcularPesoCubico(p.dimensoes);
  // Abaixo de 5 kg, os Correios consideram só o peso real; acima, o maior entre real e cúbico.
  const pesoConsiderado = p.pesoKg > 5 ? Math.max(p.pesoKg, pesoCubico) : p.pesoKg;
  const kgAdicionais = Math.max(0, Math.ceil(pesoConsiderado) - 1);
  const formato = FORMATOS.find((f) => f.id === p.formato);

  const cotacoes: Cotacao[] = SERVICOS.map((servico) => {
    const t = TABELA[servico.id];
    const base = t.base[faixa];
    const porKg = t.porKg[faixa];
    const dias = t.dias[faixa];

    const indisponivel = (motivo: string): Cotacao => ({ servico, disponivel: false, motivo, itens: [], total: 0 });

    if (servico.id === "sedexhoje" && !mesmaCidade(p.origem, p.destino)) {
      return indisponivel("Só funciona quando origem e destino ficam na mesma cidade.");
    }
    if (base === null || porKg === null || dias === null) {
      return indisponivel(
        servico.id === "sedex10"
          ? "Só disponível para entregas dentro do mesmo estado."
          : "Não atende a distância entre esses dois CEPs.",
      );
    }
    if (pesoConsiderado > servico.pesoMaxKg) {
      return indisponivel(`Aceita até ${servico.pesoMaxKg} kg. Seu pacote conta como ${formatarPeso(pesoConsiderado)}.`);
    }

    const itens: ItemPreco[] = [{ rotulo: `Frete ${servico.nome}`, valor: arred(base + porKg * kgAdicionais) }];
    if (p.comprarEmbalagem && formato && formato.precoEmbalagem > 0) {
      itens.push({ rotulo: `Embalagem (${formato.nome.toLowerCase()})`, valor: formato.precoEmbalagem });
    }
    if (p.valorDeclarado > 0) {
      itens.push({ rotulo: "Seguro (valor declarado)", valor: arred(p.valorDeclarado * TAXA_VALOR_DECLARADO) });
    }
    if (p.avisoRecebimento) itens.push({ rotulo: "Aviso de recebimento", valor: PRECO_AVISO_RECEBIMENTO });
    if (p.maoPropria) itens.push({ rotulo: "Mão própria", valor: PRECO_MAO_PROPRIA });

    const horario = servico.id === "sedex10" ? "até as 10h" : servico.id === "sedex12" ? "até as 12h" : undefined;

    return {
      servico,
      disponivel: true,
      diasUteis: dias,
      entregaAte: dias === 0 ? proximoDiaUtil(p.dataPostagem) : somarDiasUteis(p.dataPostagem, dias),
      horario,
      itens,
      total: arred(itens.reduce((s, i) => s + i.valor, 0)),
    };
  });

  const disponiveis = cotacoes.filter((c) => c.disponivel);
  const maisBarato = [...disponiveis].sort((a, b) => a.total - b.total)[0]?.servico.id;
  const maisRapido = [...disponiveis].sort(
    (a, b) => a.entregaAte!.getTime() - b.entregaAte!.getTime() || a.total - b.total,
  )[0]?.servico.id;

  return { cotacoes, pesoInformado: p.pesoKg, pesoConsiderado, pesoCubico, maisBarato, maisRapido };
}

// --- Formatação ------------------------------------------------------------------

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatarMoeda = (v: number) => moeda.format(v);

export function formatarPeso(kg: number): string {
  return kg < 1 ? `${Math.round(kg * 1000)} g` : `${kg.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`;
}

export function formatarData(d: Date): string {
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

export function formatarDataCurta(d: Date): string {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }).replace(".", "");
}
