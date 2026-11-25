"use client";

import { useState, type Ref } from "react";
import { CalendarDays, Check, ChevronDown, CircleSlash, Info, Link2, RotateCcw } from "lucide-react";
import { descreverLocal, type LocalCep } from "@/lib/cep";
import {
  formatarData,
  formatarDataCurta,
  formatarMoeda,
  formatarPeso,
  type Cotacao,
  type ResultadoFrete,
} from "@/lib/frete";

interface Props {
  resultado: ResultadoFrete;
  origem: LocalCep;
  destino: LocalCep;
  resumoPacote: string;
  dataPostagem: Date;
  onNovaConsulta: () => void;
  tituloRef: Ref<HTMLHeadingElement>;
}

type Ordem = "preco" | "prazo";

export function Resultados({ resultado, origem, destino, resumoPacote, dataPostagem, onNovaConsulta, tituloRef }: Props) {
  const [ordem, setOrdem] = useState<Ordem>("preco");
  const [copiado, setCopiado] = useState(false);

  const disponiveis = resultado.cotacoes
    .filter((c) => c.disponivel)
    .sort((a, b) =>
      ordem === "preco"
        ? a.total - b.total
        : a.entregaAte!.getTime() - b.entregaAte!.getTime() || a.total - b.total,
    );
  const indisponiveis = resultado.cotacoes.filter((c) => !c.disponivel);

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <section aria-labelledby="titulo-resultado" className="animar-surgir flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id="titulo-resultado" ref={tituloRef} tabIndex={-1} className="text-2xl font-bold sm:text-3xl">
          {descreverLocal(origem)} <span aria-hidden="true">→</span>
          <span className="sr-only">para</span> {descreverLocal(destino)}
        </h2>
        <p className="text-texto-suave">
          {resumoPacote} · postagem {formatarDataCurta(dataPostagem)}
        </p>
      </div>

      {resultado.pesoConsiderado > resultado.pesoInformado && (
        <div className="flex gap-3 rounded-xl border-2 border-amarelo bg-amarelo-claro p-4">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-azul" />
          <p>
            <strong>Seu pacote é cobrado como {formatarPeso(resultado.pesoConsiderado)}, e não {formatarPeso(resultado.pesoInformado)}.</strong>{" "}
            Pacotes grandes e leves pagam pelo espaço que ocupam no caminhão (peso cúbico: comprimento × largura × altura ÷
            6.000). Uma caixa menor pode sair mais barata.
          </p>
        </div>
      )}

      {disponiveis.length === 0 ? (
        <div className="rounded-xl border-2 border-erro bg-erro-claro p-5">
          <p className="font-bold text-erro">Nenhum serviço atende este envio.</p>
          <p className="mt-1">Veja o motivo de cada serviço abaixo e tente outro peso ou tamanho.</p>
        </div>
      ) : (
        <>
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">Ordenar resultados</legend>
            <span className="mr-1 w-full text-texto-suave sm:w-auto" aria-hidden="true">
              Ordenar por:
            </span>
            {(
              [
                ["preco", "Menor preço"],
                ["prazo", "Chega antes"],
              ] as const
            ).map(([valor, rotulo]) => (
              <label
                key={valor}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-borda bg-superficie px-4 font-bold transition-colors hover:border-azul active:bg-azul-claro has-checked:border-azul has-checked:bg-azul has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-foco"
              >
                <input
                  type="radio"
                  name="ordem"
                  value={valor}
                  checked={ordem === valor}
                  onChange={() => setOrdem(valor)}
                  className="sr-only"
                />
                {rotulo}
              </label>
            ))}
          </fieldset>

          <ul className="flex flex-col gap-3">
            {disponiveis.map((c) => (
              <li key={c.servico.id}>
                <CartaoCotacao
                  cotacao={c}
                  maisBarato={resultado.maisBarato === c.servico.id}
                  maisRapido={resultado.maisRapido === c.servico.id}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {indisponiveis.length > 0 && (
        <div className="rounded-xl border border-borda-suave bg-superficie p-5">
          <h3 className="font-bold">Não disponíveis para este envio</h3>
          <ul className="mt-3 flex flex-col gap-3">
            {indisponiveis.map((c) => (
              <li key={c.servico.id} className="flex gap-3">
                <CircleSlash aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-texto-suave" />
                <p>
                  <strong>{c.servico.nome}:</strong> <span className="text-texto-suave">{c.motivo}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 rounded-xl bg-azul-claro p-4 text-[0.95rem]">
        <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-azul" />
        <p>
          O prazo começa a contar no dia útil seguinte à postagem; sábados, domingos e feriados não entram na conta. Se
          você postar depois do horário limite da agência, some 1 dia útil. <strong>Valores simulados.</strong>
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onNovaConsulta}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-azul px-5 font-bold text-azul transition-colors hover:bg-azul-claro active:bg-azul-claro/70"
        >
          <RotateCcw aria-hidden="true" className="size-5" />
          Alterar dados
        </button>
        <button
          type="button"
          onClick={copiarLink}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-borda bg-superficie px-5 font-bold transition-colors hover:border-azul active:bg-azul-claro"
        >
          {copiado ? <Check aria-hidden="true" className="size-5 text-sucesso" /> : <Link2 aria-hidden="true" className="size-5" />}
          {copiado ? "Link copiado" : "Copiar link desta consulta"}
        </button>
        <span role="status" className="sr-only">
          {copiado ? "Link copiado para a área de transferência" : ""}
        </span>
      </div>
    </section>
  );
}

function CartaoCotacao({ cotacao, maisBarato, maisRapido }: { cotacao: Cotacao; maisBarato: boolean; maisRapido: boolean }) {
  const { servico, total, entregaAte, diasUteis, horario, itens } = cotacao;
  const destaque = maisBarato || maisRapido;

  return (
    <article
      className={`rounded-xl border-2 bg-superficie p-5 shadow-sm ${destaque ? "border-azul" : "border-borda-suave"}`}
      aria-label={`${servico.nome}, ${formatarMoeda(total)}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold">{servico.nome}</h3>
            {maisBarato && (
              <span className="rounded-full bg-sucesso-claro px-2.5 py-0.5 text-sm font-bold text-sucesso">Mais barato</span>
            )}
            {maisRapido && (
              <span className="rounded-full bg-amarelo px-2.5 py-0.5 text-sm font-bold text-azul-escuro">Mais rápido</span>
            )}
          </div>
          <p className="text-texto-suave">{servico.resumo}</p>
        </div>
        <p className="text-3xl font-bold tabular-nums text-azul">{formatarMoeda(total)}</p>
      </div>

      <p className="mt-4 flex items-start gap-2 text-lg">
        <CalendarDays aria-hidden="true" className="mt-1 size-5 shrink-0 text-azul" />
        <span>
          Chega até <strong>{formatarData(entregaAte!)}</strong>
          {horario ? `, ${horario}` : ""}
          <span className="text-texto-suave">
            {" "}
            ({diasUteis === 0 ? "no mesmo dia" : diasUteis === 1 ? "1 dia útil" : `${diasUteis} dias úteis`})
          </span>
        </span>
      </p>

      <details className="group mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-lg font-bold text-azul [&::-webkit-details-marker]:hidden">
          Ver o que compõe o preço
          <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <dl className="mt-2 flex flex-col gap-1 border-t border-borda-suave pt-3">
          {itens.map((i) => (
            <div key={i.rotulo} className="flex justify-between gap-4">
              <dt className="text-texto-suave">{i.rotulo}</dt>
              <dd className="tabular-nums">{formatarMoeda(i.valor)}</dd>
            </div>
          ))}
          <div className="mt-1 flex justify-between gap-4 border-t border-borda-suave pt-2 font-bold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatarMoeda(total)}</dd>
          </div>
        </dl>
      </details>
    </article>
  );
}

export function resumirPacote(nomeFormato: string, pesoKg: number) {
  return `${nomeFormato} · ${formatarPeso(pesoKg)}`;
}
