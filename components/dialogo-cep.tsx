"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { CAPITAIS, formatarCep } from "@/lib/cep";

interface Props {
  aberto: boolean;
  campo: string;
  onEscolher: (cep: string) => void;
  onFechar: () => void;
}

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function DialogoCep({ aberto, campo, onEscolher, onFechar }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);
  const [busca, setBusca] = useState("");
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) {
      dialogo.showModal();
      buscaRef.current?.focus();
    }
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  const termo = normalizar(busca.trim());
  const resultados = CAPITAIS.filter(
    (c) => !termo || normalizar(c.cidade).includes(termo) || normalizar(c.uf).includes(termo),
  );

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={() => {
        setBusca("");
        onFechar();
      }}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-superficie p-0 text-texto shadow-2xl backdrop:bg-azul-escuro/60"
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={idTitulo} className="text-xl font-bold">
              Encontrar o CEP {campo}
            </h2>
            <p className="mt-1 text-texto-suave">
              Busque pela cidade. Nesta simulação, a lista inclui só algumas capitais.
            </p>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg hover:bg-fundo"
            aria-label="Fechar"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="relative">
          <label htmlFor="busca-cidade" className="sr-only">
            Cidade ou estado
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-texto-suave" />
          <input
            id="busca-cidade"
            ref={buscaRef}
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Ex.: Curitiba ou PR"
            className="min-h-12 w-full rounded-lg border-2 border-borda bg-superficie pl-11 pr-4 text-lg"
          />
        </div>

        <ul className="-mx-2 max-h-72 overflow-y-auto" aria-live="polite">
          {resultados.length === 0 && (
            <li className="px-2 py-3 text-texto-suave">Nenhuma cidade encontrada para “{busca}”.</li>
          )}
          {resultados.map((c) => (
            <li key={c.exemplo}>
              <button
                type="button"
                onClick={() => {
                  onEscolher(c.exemplo);
                  ref.current?.close();
                }}
                className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-2 text-left hover:bg-azul-claro"
              >
                <span>
                  <span className="font-bold">{c.cidade}</span> <span className="text-texto-suave">({c.uf})</span>
                </span>
                <span className="font-mono text-texto-suave">{formatarCep(c.exemplo)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
