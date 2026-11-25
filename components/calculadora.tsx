"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowDownUp, Check, ChevronDown, CircleAlert, Mail, Package, Ruler, Search } from "lucide-react";
import { CampoCep } from "./campo-cep";
import { DialogoCep } from "./dialogo-cep";
import { Resultados, resumirPacote } from "./resultados";
import { consultarCep, type LocalCep } from "@/lib/cep";
import {
  FORMATOS,
  PRECO_AVISO_RECEBIMENTO,
  PRECO_MAO_PROPRIA,
  TAXA_VALOR_DECLARADO,
  VALOR_DECLARADO_MAX,
  calcularFrete,
  formatarMoeda,
  type FormatoId,
  type ResultadoFrete,
} from "@/lib/frete";

// --- Estado do formulário ------------------------------------------------------

type Quando = "hoje" | "amanha" | "outra";

interface Dados {
  origem: string;
  destino: string;
  formato: FormatoId;
  peso: string;
  comprimento: string;
  largura: string;
  altura: string;
  quando: Quando;
  data: string; // aaaa-mm-dd, só quando "outra"
  comprarEmbalagem: boolean;
  seguro: boolean;
  valorDeclarado: string;
  avisoRecebimento: boolean;
  maoPropria: boolean;
}

const PADRAO: Dados = {
  origem: "",
  destino: "",
  formato: "caixa-p",
  peso: "",
  comprimento: "",
  largura: "",
  altura: "",
  quando: "hoje",
  data: "",
  comprarEmbalagem: false,
  seguro: false,
  valorDeclarado: "",
  avisoRecebimento: false,
  maoPropria: false,
};

type Erros = Partial<Record<keyof Dados, string>>;

interface Consulta {
  resultado: ResultadoFrete;
  origem: LocalCep;
  destino: LocalCep;
  resumo: string;
  dataPostagem: Date;
}

const numero = (s: string) => Number(s.replace(",", "."));

function hojeMeiaNoite(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function dataPostagem(d: Dados): Date {
  const base = hojeMeiaNoite();
  if (d.quando === "amanha") base.setDate(base.getDate() + 1);
  if (d.quando === "outra" && d.data) {
    const [a, m, dia] = d.data.split("-").map(Number);
    return new Date(a, m - 1, dia);
  }
  return base;
}

/** Rolagem suave, exceto para quem pediu menos movimento no sistema. */
function comportamentoRolagem(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function paraIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function validarCep(valor: string, qual: "origem" | "destino"): string | undefined {
  if (!valor) return `Informe o CEP de ${qual}.`;
  if (valor.length < 8) return "O CEP tem 8 números. Confira se faltou algum.";
  if (!consultarCep(valor)) return "Não encontramos esse CEP. Confira os números.";
}

function validar(d: Dados): Erros {
  const e: Erros = {};
  e.origem = validarCep(d.origem, "origem");
  e.destino = validarCep(d.destino, "destino");

  const peso = numero(d.peso);
  if (!d.peso) e.peso = "Informe o peso do pacote.";
  else if (!Number.isFinite(peso) || peso <= 0) e.peso = "Use só números, por exemplo 1,5.";
  else if (peso > 30) e.peso = "O limite é 30 kg por pacote.";

  if (d.formato === "personalizado") {
    const medidas = [
      ["comprimento", d.comprimento, "Informe o comprimento."],
      ["largura", d.largura, "Informe a largura."],
      ["altura", d.altura, "Informe a altura."],
    ] as const;
    for (const [campo, valor, faltando] of medidas) {
      const n = numero(valor);
      if (!valor) e[campo] = faltando;
      else if (!Number.isFinite(n) || n <= 0) e[campo] = "Use só números.";
      else if (n > 100) e[campo] = "Máximo de 100 cm por lado.";
    }
    const soma = numero(d.comprimento) + numero(d.largura) + numero(d.altura);
    if (!e.comprimento && !e.largura && !e.altura && soma > 200) {
      e.altura = `A soma das medidas (${soma} cm) passa do limite de 200 cm.`;
    }
  }

  if (d.quando === "outra") {
    if (!d.data) e.data = "Escolha a data da postagem.";
    else if (dataPostagem(d) < hojeMeiaNoite()) e.data = "A data não pode estar no passado.";
  }

  if (d.seguro) {
    const v = numero(d.valorDeclarado);
    if (!d.valorDeclarado) e.valorDeclarado = "Informe quanto vale o conteúdo.";
    else if (!Number.isFinite(v) || v <= 0) e.valorDeclarado = "Use só números, por exemplo 150.";
    else if (v > VALOR_DECLARADO_MAX) e.valorDeclarado = `O valor máximo é ${formatarMoeda(VALOR_DECLARADO_MAX)}.`;
  }

  for (const k of Object.keys(e) as (keyof Dados)[]) if (!e[k]) delete e[k];
  return e;
}

function consultar(d: Dados): Consulta {
  const origem = consultarCep(d.origem)!;
  const destino = consultarCep(d.destino)!;
  const formato = FORMATOS.find((f) => f.id === d.formato)!;
  const dimensoes =
    formato.dimensoes ?? {
      comprimento: numero(d.comprimento),
      largura: numero(d.largura),
      altura: numero(d.altura),
    };
  const postagem = dataPostagem(d);
  const pesoKg = numero(d.peso);
  return {
    resultado: calcularFrete({
      origem,
      destino,
      dataPostagem: postagem,
      pesoKg,
      dimensoes,
      formato: d.formato,
      comprarEmbalagem: d.comprarEmbalagem,
      maoPropria: d.maoPropria,
      avisoRecebimento: d.avisoRecebimento,
      valorDeclarado: d.seguro ? numero(d.valorDeclarado) : 0,
    }),
    origem,
    destino,
    resumo: resumirPacote(formato.id === "personalizado" ? `Pacote ${dimensoes.comprimento}×${dimensoes.largura}×${dimensoes.altura} cm` : formato.nome, pesoKg),
    dataPostagem: postagem,
  };
}

// --- URL compartilhável --------------------------------------------------------

function paraUrl(d: Dados): string {
  const p = new URLSearchParams({ de: d.origem, para: d.destino, formato: d.formato, peso: d.peso });
  if (d.formato === "personalizado") {
    p.set("c", d.comprimento);
    p.set("l", d.largura);
    p.set("a", d.altura);
  }
  // A data vai sempre absoluta: quem abrir o link depois vê a mesma postagem.
  p.set("data", paraIso(dataPostagem(d)));
  if (d.comprarEmbalagem) p.set("embalagem", "1");
  if (d.seguro) p.set("seguro", d.valorDeclarado);
  if (d.avisoRecebimento) p.set("ar", "1");
  if (d.maoPropria) p.set("mp", "1");
  return `?${p.toString()}`;
}

function daUrl(busca: string): Dados | null {
  const p = new URLSearchParams(busca);
  if (!p.get("de") || !p.get("para")) return null;
  const formato = (FORMATOS.some((f) => f.id === p.get("formato")) ? p.get("formato") : "caixa-p") as FormatoId;
  const data = p.get("data") ?? "";
  const hoje = paraIso(hojeMeiaNoite());
  return {
    ...PADRAO,
    origem: p.get("de") ?? "",
    destino: p.get("para") ?? "",
    formato,
    peso: p.get("peso") ?? "",
    comprimento: p.get("c") ?? "",
    largura: p.get("l") ?? "",
    altura: p.get("a") ?? "",
    // Um link antigo com data já passada volta para "hoje".
    quando: !data || data <= hoje ? "hoje" : "outra",
    data: data > hoje ? data : "",
    comprarEmbalagem: p.get("embalagem") === "1",
    seguro: p.has("seguro"),
    valorDeclarado: p.get("seguro") ?? "",
    avisoRecebimento: p.get("ar") === "1",
    maoPropria: p.get("mp") === "1",
  };
}

// --- Componente ----------------------------------------------------------------

const ROTULOS_ERRO: Partial<Record<keyof Dados, string>> = {
  origem: "CEP de origem",
  destino: "CEP de destino",
  peso: "Peso",
  comprimento: "Comprimento",
  largura: "Largura",
  altura: "Altura",
  data: "Data da postagem",
  valorDeclarado: "Valor declarado",
};

const ICONES_FORMATO: Record<FormatoId, ReactNode> = {
  envelope: <Mail aria-hidden="true" className="size-7" />,
  "caixa-p": <Package aria-hidden="true" className="size-6" />,
  "caixa-m": <Package aria-hidden="true" className="size-7" />,
  "caixa-g": <Package aria-hidden="true" className="size-8" />,
  personalizado: <Ruler aria-hidden="true" className="size-7" />,
};

export function Calculadora() {
  const [dados, setDados] = useState<Dados>(PADRAO);
  const [erros, setErros] = useState<Erros>({});
  const [mostrarResumoErros, setMostrarResumoErros] = useState(false);
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [ajudaCep, setAjudaCep] = useState<"origem" | "destino" | null>(null);
  const [extrasAbertos, setExtrasAbertos] = useState(false);

  const resumoErrosRef = useRef<HTMLDivElement>(null);
  const tituloResultadoRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const focarResultado = useRef(false);
  const focarErros = useRef(false);

  function atualizar<K extends keyof Dados>(campo: K, valor: Dados[K]) {
    setDados((d) => ({ ...d, [campo]: valor }));
    // Corrige o erro assim que o campo fica válido, sem esperar outro envio.
    if (erros[campo]) {
      setErros((atual) => {
        const novo = validar({ ...dados, [campo]: valor });
        return { ...atual, [campo]: novo[campo] };
      });
    }
  }

  function validarCampo(campo: keyof Dados) {
    const e = validar(dados);
    setErros((atual) => ({ ...atual, [campo]: e[campo] }));
  }

  // Abrir um link compartilhado refaz a consulta automaticamente.
  useEffect(() => {
    const doLink = daUrl(window.location.search);
    if (!doLink) return;
    if (Object.keys(validar(doLink)).length > 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- estado vem da URL, que só existe no navegador
    setDados(doLink);
    setExtrasAbertos(doLink.comprarEmbalagem || doLink.seguro || doLink.avisoRecebimento || doLink.maoPropria);
    setConsulta(consultar(doLink));
  }, []);

  useEffect(() => {
    if (consulta && focarResultado.current) {
      focarResultado.current = false;
      tituloResultadoRef.current?.focus();
      tituloResultadoRef.current?.scrollIntoView({ behavior: comportamentoRolagem(), block: "start" });
    }
  }, [consulta]);

  // Só leva o foco ao resumo logo após um envio com erro, nunca durante a digitação.
  useEffect(() => {
    if (focarErros.current) {
      focarErros.current = false;
      resumoErrosRef.current?.focus();
    }
  }, [erros]);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const novosErros = validar(dados);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      focarErros.current = true;
      setMostrarResumoErros(true);
      if (novosErros.valorDeclarado) setExtrasAbertos(true);
      return;
    }
    setMostrarResumoErros(false);
    focarResultado.current = true;
    setConsulta(consultar(dados));
    window.history.replaceState(null, "", paraUrl(dados));
  }

  function inverter() {
    setDados((d) => ({ ...d, origem: d.destino, destino: d.origem }));
    setErros((e) => ({ ...e, origem: e.destino, destino: e.origem }));
  }

  function novaConsulta() {
    formRef.current?.scrollIntoView({ behavior: comportamentoRolagem(), block: "start" });
    document.getElementById("origem")?.focus({ preventScroll: true });
  }

  const listaErros = (Object.keys(erros) as (keyof Dados)[]).filter((k) => erros[k]);
  const formatoAtual = FORMATOS.find((f) => f.id === dados.formato)!;

  return (
    <div className="flex flex-col gap-10">
      <form ref={formRef} onSubmit={enviar} noValidate className="flex scroll-mt-4 flex-col gap-6">
        {mostrarResumoErros && listaErros.length > 0 && (
          <div
            ref={resumoErrosRef}
            tabIndex={-1}
            role="alert"
            aria-labelledby="titulo-erros"
            className="rounded-xl border-2 border-erro bg-erro-claro p-5"
          >
            <h2 id="titulo-erros" className="flex items-center gap-2 font-bold text-erro">
              <CircleAlert aria-hidden="true" className="size-5" />
              {listaErros.length === 1 ? "Falta corrigir 1 campo" : `Falta corrigir ${listaErros.length} campos`}
            </h2>
            <ul className="mt-2 flex flex-col gap-1 pl-7">
              {listaErros.map((k) => (
                <li key={k}>
                  <a href={`#${k}`} className="text-erro underline underline-offset-2">
                    {ROTULOS_ERRO[k]}: {erros[k]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 1. Trajeto */}
        <Etapa numero={1} titulo="De onde para onde?">
          <div className="grid items-start gap-x-3 gap-y-1 sm:grid-cols-[1fr_auto_1fr]">
            <CampoCep
              id="origem"
              rotulo="CEP de origem"
              valor={dados.origem}
              erro={erros.origem}
              onChange={(v) => atualizar("origem", v)}
              onBlur={() => dados.origem && validarCampo("origem")}
              onAjuda={() => setAjudaCep("origem")}
            />
            <button
              type="button"
              onClick={inverter}
              className="mx-auto flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-borda bg-superficie text-azul transition-colors hover:border-azul active:bg-azul-claro sm:mt-9 sm:-rotate-90"
              aria-label="Inverter origem e destino"
              title="Inverter origem e destino"
            >
              <ArrowDownUp aria-hidden="true" className="size-5" />
            </button>
            <CampoCep
              id="destino"
              rotulo="CEP de destino"
              valor={dados.destino}
              erro={erros.destino}
              onChange={(v) => atualizar("destino", v)}
              onBlur={() => dados.destino && validarCampo("destino")}
              onAjuda={() => setAjudaCep("destino")}
            />
          </div>
        </Etapa>

        {/* 2. Pacote */}
        <Etapa numero={2} titulo="O que você vai enviar?">
          <fieldset>
            <legend className="mb-2 font-bold">Formato</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {FORMATOS.map((f) => (
                <label
                  key={f.id}
                  className="relative flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-borda bg-superficie p-3 text-center transition-colors hover:border-azul active:bg-azul-claro has-checked:border-azul has-checked:bg-azul-claro has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-foco [&:last-child]:col-span-2 sm:[&:last-child]:col-span-1"
                >
                  <input
                    type="radio"
                    name="formato"
                    value={f.id}
                    checked={dados.formato === f.id}
                    onChange={() => atualizar("formato", f.id)}
                    className="sr-only"
                  />
                  {dados.formato === f.id && (
                    <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-azul text-white">
                      <Check aria-hidden="true" className="size-4" strokeWidth={3} />
                    </span>
                  )}
                  <span className="flex h-8 items-center text-azul">{ICONES_FORMATO[f.id]}</span>
                  <span className="font-bold leading-tight">{f.nome}</span>
                  <span className="text-sm leading-snug text-texto-suave">{f.detalhe}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {dados.formato === "personalizado" && (
            <fieldset className="animar-surgir">
              <legend className="mb-2 font-bold">Medidas do pacote (em cm)</legend>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    ["comprimento", "Comprimento"],
                    ["largura", "Largura"],
                    ["altura", "Altura"],
                  ] as const
                ).map(([campo, rotulo]) => (
                  <CampoNumero
                    key={campo}
                    id={campo}
                    rotulo={rotulo}
                    sufixo="cm"
                    valor={dados[campo]}
                    erro={erros[campo]}
                    onChange={(v) => atualizar(campo, v)}
                    onBlur={() => dados[campo] && validarCampo(campo)}
                  />
                ))}
              </div>
              <p className="mt-2 text-[0.95rem] text-texto-suave">Até 100 cm por lado e 200 cm somando os três.</p>
            </fieldset>
          )}

          <div className="flex flex-col gap-2">
            <CampoNumero
              id="peso"
              rotulo="Peso aproximado"
              sufixo="kg"
              dica="Use vírgula para gramas: 0,3 = 300 g. Na dúvida, arredonde para cima."
              valor={dados.peso}
              erro={erros.peso}
              onChange={(v) => atualizar("peso", v)}
              onBlur={() => dados.peso && validarCampo("peso")}
              larguraMax
            />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Pesos comuns">
              {["0,3", "1", "2", "5", "10"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => atualizar("peso", p)}
                  aria-pressed={dados.peso === p}
                  className="min-h-11 cursor-pointer rounded-full border-2 border-borda bg-superficie px-4 transition-colors hover:border-azul active:bg-azul-claro aria-pressed:border-azul aria-pressed:bg-azul-claro aria-pressed:font-bold"
                >
                  {p === "0,3" ? "até 300 g" : `${p} kg`}
                </button>
              ))}
            </div>
          </div>
        </Etapa>

        {/* 3. Data */}
        <Etapa numero={3} titulo="Quando você vai postar?">
          <fieldset>
            <legend className="sr-only">Data da postagem</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["hoje", "Hoje"],
                  ["amanha", "Amanhã"],
                  ["outra", "Outra data"],
                ] as const
              ).map(([valor, rotulo]) => (
                <label
                  key={valor}
                  className="inline-flex min-h-12 cursor-pointer items-center rounded-full border-2 border-borda bg-superficie px-5 font-bold transition-colors hover:border-azul active:bg-azul-claro has-checked:border-azul has-checked:bg-azul has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-foco"
                >
                  <input
                    type="radio"
                    name="quando"
                    value={valor}
                    checked={dados.quando === valor}
                    onChange={() => atualizar("quando", valor)}
                    className="sr-only"
                  />
                  {rotulo}
                </label>
              ))}
            </div>
          </fieldset>
          {dados.quando === "outra" && (
            <div className="animar-surgir flex max-w-xs flex-col gap-1.5">
              <label htmlFor="data" className="font-bold">
                Data da postagem
              </label>
              <input
                id="data"
                type="date"
                min={paraIso(hojeMeiaNoite())}
                value={dados.data}
                onChange={(e) => atualizar("data", e.target.value)}
                onBlur={() => dados.data && validarCampo("data")}
                aria-invalid={erros.data ? true : undefined}
                aria-describedby={erros.data ? "data-erro" : undefined}
                className={`min-h-12 rounded-lg border-2 bg-superficie px-4 text-lg ${erros.data ? "border-erro" : "border-borda"}`}
              />
              {erros.data && (
                <p id="data-erro" className="flex items-start gap-1.5 text-erro">
                  <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  {erros.data}
                </p>
              )}
            </div>
          )}
        </Etapa>

        {/* Extras: escondidos por padrão (revelação progressiva) */}
        <details
          open={extrasAbertos}
          onToggle={(e) => setExtrasAbertos(e.currentTarget.open)}
          className="group rounded-xl border border-borda-suave bg-superficie"
        >
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="font-bold">Serviços adicionais</span>{" "}
              <span className="text-texto-suave">(opcional: seguro, embalagem, comprovante)</span>
            </span>
            <ChevronDown aria-hidden="true" className="size-5 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-col gap-4 border-t border-borda-suave px-5 py-5">
            {formatoAtual.precoEmbalagem > 0 && (
              <Opcao
                id="comprarEmbalagem"
                marcado={dados.comprarEmbalagem}
                onChange={(v) => atualizar("comprarEmbalagem", v)}
                titulo={`Comprar a embalagem na agência (+ ${formatarMoeda(formatoAtual.precoEmbalagem)})`}
                descricao={`${formatoAtual.nome} oficial dos Correios. Deixe desmarcado se já tem a sua.`}
              />
            )}
            <Opcao
              id="seguro"
              marcado={dados.seguro}
              onChange={(v) => atualizar("seguro", v)}
              titulo="Seguro (declarar o valor do conteúdo)"
              descricao={`Se o pacote for perdido ou danificado, você recebe o valor declarado. Custa ${(TAXA_VALOR_DECLARADO * 100).toLocaleString("pt-BR")}% desse valor.`}
            >
              {dados.seguro && (
                <div className="mt-3 max-w-xs">
                  <CampoNumero
                    id="valorDeclarado"
                    rotulo="Quanto vale o conteúdo?"
                    prefixo="R$"
                    valor={dados.valorDeclarado}
                    erro={erros.valorDeclarado}
                    onChange={(v) => atualizar("valorDeclarado", v)}
                    onBlur={() => dados.valorDeclarado && validarCampo("valorDeclarado")}
                  />
                </div>
              )}
            </Opcao>
            <Opcao
              id="avisoRecebimento"
              marcado={dados.avisoRecebimento}
              onChange={(v) => atualizar("avisoRecebimento", v)}
              titulo={`Comprovante de entrega (+ ${formatarMoeda(PRECO_AVISO_RECEBIMENTO)})`}
              descricao="Você recebe um documento com a assinatura de quem recebeu. Nos Correios, se chama Aviso de Recebimento (AR)."
            />
            <Opcao
              id="maoPropria"
              marcado={dados.maoPropria}
              onChange={(v) => atualizar("maoPropria", v)}
              titulo={`Entregar só para o destinatário (+ ${formatarMoeda(PRECO_MAO_PROPRIA)})`}
              descricao="O carteiro entrega apenas à pessoa indicada, e não a um vizinho ou porteiro. Nos Correios, se chama Mão Própria."
            />
          </div>
        </details>

        <button
          type="submit"
          className="inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amarelo px-8 text-lg font-bold text-azul-escuro shadow-sm transition-colors hover:bg-[#f0c800] active:bg-[#e0bb00] sm:self-start"
        >
          <Search aria-hidden="true" className="size-5" />
          Ver preços e prazos
        </button>
      </form>

      {consulta && (
        <Resultados
          tituloRef={tituloResultadoRef}
          resultado={consulta.resultado}
          origem={consulta.origem}
          destino={consulta.destino}
          resumoPacote={consulta.resumo}
          dataPostagem={consulta.dataPostagem}
          onNovaConsulta={novaConsulta}
        />
      )}

      <DialogoCep
        aberto={ajudaCep !== null}
        campo={ajudaCep === "destino" ? "de destino" : "de origem"}
        onEscolher={(cep) => {
          if (!ajudaCep) return;
          const campo = ajudaCep;
          setDados((d) => ({ ...d, [campo]: cep }));
          setErros((e) => ({ ...e, [campo]: undefined }));
        }}
        onFechar={() => {
          const campo = ajudaCep;
          setAjudaCep(null);
          if (campo) document.getElementById(campo)?.focus();
        }}
      />
    </div>
  );
}

// --- Peças pequenas ------------------------------------------------------------

function Etapa({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section
      aria-labelledby={`etapa-${numero}`}
      className="flex flex-col gap-5 rounded-2xl border border-borda-suave bg-superficie p-5 shadow-sm sm:p-6"
    >
      <h2 id={`etapa-${numero}`} className="flex items-center gap-3 text-xl font-bold">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-azul text-base text-white"
        >
          {numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

interface CampoNumeroProps {
  id: string;
  rotulo: string;
  valor: string;
  erro?: string;
  dica?: string;
  prefixo?: string;
  sufixo?: string;
  larguraMax?: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
}

function CampoNumero({ id, rotulo, valor, erro, dica, prefixo, sufixo, larguraMax, onChange, onBlur }: CampoNumeroProps) {
  const descricao = [dica ? `${id}-dica` : null, erro ? `${id}-erro` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {rotulo}
      </label>
      <div className={`relative ${larguraMax ? "max-w-xs" : ""}`}>
        {prefixo && (
          <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-texto-suave">
            {prefixo}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={valor}
          onChange={(e) => onChange(e.target.value.replace(/[^\d,.]/g, ""))}
          onBlur={onBlur}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descricao}
          className={`min-h-12 w-full rounded-lg border-2 bg-superficie text-lg ${prefixo ? "pl-12" : "pl-4"} ${
            sufixo ? "pr-12" : "pr-4"
          } ${erro ? "border-erro" : "border-borda hover:border-texto-suave"}`}
        />
        {sufixo && (
          <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-texto-suave">
            {sufixo}
          </span>
        )}
      </div>
      {dica && (
        <p id={`${id}-dica`} className="text-[0.95rem] text-texto-suave">
          {dica}
        </p>
      )}
      {erro && (
        <p id={`${id}-erro`} className="flex items-start gap-1.5 text-[0.95rem] text-erro">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {erro}
        </p>
      )}
    </div>
  );
}

interface OpcaoProps {
  id: string;
  marcado: boolean;
  titulo: string;
  descricao: string;
  onChange: (v: boolean) => void;
  children?: ReactNode;
}

function Opcao({ id, marcado, titulo, descricao, onChange, children }: OpcaoProps) {
  return (
    <div>
      <div className="flex gap-3">
        <input
          id={id}
          type="checkbox"
          checked={marcado}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={`${id}-desc`}
          className="mt-0.5 size-6 shrink-0 cursor-pointer accent-azul"
        />
        <div>
          <label htmlFor={id} className="cursor-pointer font-bold">
            {titulo}
          </label>
          <p id={`${id}-desc`} className="text-[0.95rem] text-texto-suave">
            {descricao}
          </p>
        </div>
      </div>
      {children && <div className="pl-9">{children}</div>}
    </div>
  );
}
