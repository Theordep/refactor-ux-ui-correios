// Simulação local de consulta de CEP: sem banco de dados e sem API.
// As faixas por estado seguem a divisão real dos CEPs brasileiros; a cidade só
// é reconhecida para as capitais listadas abaixo.

export type UF =
  | "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO" | "MA"
  | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI" | "RJ" | "RN"
  | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO";

export type Regiao = "N" | "NE" | "CO" | "SE" | "S";

export interface LocalCep {
  cep: string; // 8 dígitos
  uf: UF;
  estado: string;
  regiao: Regiao;
  cidade?: string;
}

const FAIXAS_UF: [number, number, UF][] = [
  [1000, 19999, "SP"],
  [20000, 28999, "RJ"],
  [29000, 29999, "ES"],
  [30000, 39999, "MG"],
  [40000, 48999, "BA"],
  [49000, 49999, "SE"],
  [50000, 56999, "PE"],
  [57000, 57999, "AL"],
  [58000, 58999, "PB"],
  [59000, 59999, "RN"],
  [60000, 63999, "CE"],
  [64000, 64999, "PI"],
  [65000, 65999, "MA"],
  [66000, 68899, "PA"],
  [68900, 68999, "AP"],
  [69000, 69299, "AM"],
  [69300, 69399, "RR"],
  [69400, 69899, "AM"],
  [69900, 69999, "AC"],
  [70000, 72799, "DF"],
  [72800, 72999, "GO"],
  [73000, 73699, "DF"],
  [73700, 76799, "GO"],
  [76800, 76999, "RO"],
  [77000, 77999, "TO"],
  [78000, 78899, "MT"],
  [79000, 79999, "MS"],
  [80000, 87999, "PR"],
  [88000, 89999, "SC"],
  [90000, 99999, "RS"],
];

const ESTADOS: Record<UF, { nome: string; regiao: Regiao }> = {
  AC: { nome: "Acre", regiao: "N" },
  AL: { nome: "Alagoas", regiao: "NE" },
  AP: { nome: "Amapá", regiao: "N" },
  AM: { nome: "Amazonas", regiao: "N" },
  BA: { nome: "Bahia", regiao: "NE" },
  CE: { nome: "Ceará", regiao: "NE" },
  DF: { nome: "Distrito Federal", regiao: "CO" },
  ES: { nome: "Espírito Santo", regiao: "SE" },
  GO: { nome: "Goiás", regiao: "CO" },
  MA: { nome: "Maranhão", regiao: "NE" },
  MT: { nome: "Mato Grosso", regiao: "CO" },
  MS: { nome: "Mato Grosso do Sul", regiao: "CO" },
  MG: { nome: "Minas Gerais", regiao: "SE" },
  PA: { nome: "Pará", regiao: "N" },
  PB: { nome: "Paraíba", regiao: "NE" },
  PR: { nome: "Paraná", regiao: "S" },
  PE: { nome: "Pernambuco", regiao: "NE" },
  PI: { nome: "Piauí", regiao: "NE" },
  RJ: { nome: "Rio de Janeiro", regiao: "SE" },
  RN: { nome: "Rio Grande do Norte", regiao: "NE" },
  RS: { nome: "Rio Grande do Sul", regiao: "S" },
  RO: { nome: "Rondônia", regiao: "N" },
  RR: { nome: "Roraima", regiao: "N" },
  SC: { nome: "Santa Catarina", regiao: "S" },
  SP: { nome: "São Paulo", regiao: "SE" },
  SE: { nome: "Sergipe", regiao: "NE" },
  TO: { nome: "Tocantins", regiao: "N" },
};

/** Capitais com faixas de CEP aproximadas e um CEP de exemplo (centro). */
export const CAPITAIS: { cidade: string; uf: UF; de: number; ate: number; exemplo: string }[] = [
  { cidade: "São Paulo", uf: "SP", de: 1000, ate: 5999, exemplo: "01310100" },
  { cidade: "Rio de Janeiro", uf: "RJ", de: 20000, ate: 23799, exemplo: "20040020" },
  { cidade: "Belo Horizonte", uf: "MG", de: 30000, ate: 31999, exemplo: "30130010" },
  { cidade: "Vitória", uf: "ES", de: 29000, ate: 29099, exemplo: "29010120" },
  { cidade: "Salvador", uf: "BA", de: 40000, ate: 42599, exemplo: "40020000" },
  { cidade: "Recife", uf: "PE", de: 50000, ate: 52999, exemplo: "50010000" },
  { cidade: "Fortaleza", uf: "CE", de: 60000, ate: 61599, exemplo: "60060000" },
  { cidade: "Belém", uf: "PA", de: 66000, ate: 66999, exemplo: "66010000" },
  { cidade: "Manaus", uf: "AM", de: 69000, ate: 69099, exemplo: "69005000" },
  { cidade: "Brasília", uf: "DF", de: 70000, ate: 72799, exemplo: "70040010" },
  { cidade: "Goiânia", uf: "GO", de: 74000, ate: 74899, exemplo: "74003010" },
  { cidade: "Curitiba", uf: "PR", de: 80000, ate: 82999, exemplo: "80010000" },
  { cidade: "Florianópolis", uf: "SC", de: 88000, ate: 88099, exemplo: "88010000" },
  { cidade: "Porto Alegre", uf: "RS", de: 90000, ate: 91999, exemplo: "90010000" },
];

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 8);
}

export function formatarCep(valor: string): string {
  const d = apenasDigitos(valor);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function consultarCep(valor: string): LocalCep | null {
  const cep = apenasDigitos(valor);
  if (cep.length !== 8) return null;
  const prefixo = Number(cep.slice(0, 5));
  const faixa = FAIXAS_UF.find(([de, ate]) => prefixo >= de && prefixo <= ate);
  if (!faixa) return null;
  const uf = faixa[2];
  const capital = CAPITAIS.find((c) => c.uf === uf && prefixo >= c.de && prefixo <= c.ate);
  return { cep, uf, estado: ESTADOS[uf].nome, regiao: ESTADOS[uf].regiao, cidade: capital?.cidade };
}

export function descreverLocal(local: LocalCep): string {
  return local.cidade ? `${local.cidade} (${local.uf})` : `${local.estado} (${local.uf})`;
}
