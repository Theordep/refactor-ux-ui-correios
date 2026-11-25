"use client";

import { CircleAlert, MapPin } from "lucide-react";
import { apenasDigitos, consultarCep, descreverLocal, formatarCep } from "@/lib/cep";

interface Props {
  id: string;
  rotulo: string;
  valor: string;
  erro?: string;
  onChange: (valor: string) => void;
  onBlur: () => void;
  onAjuda: () => void;
}

export function CampoCep({ id, rotulo, valor, erro, onChange, onBlur, onAjuda }: Props) {
  const local = consultarCep(valor);
  const idDica = `${id}-dica`;
  const idErro = `${id}-erro`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {rotulo}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="00000-000"
        maxLength={9}
        value={formatarCep(valor)}
        onChange={(e) => onChange(apenasDigitos(e.target.value))}
        onBlur={onBlur}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idErro : idDica}
        className={`min-h-12 w-full rounded-lg border-2 bg-superficie px-4 text-lg tracking-wide transition-colors placeholder:text-texto-suave/80 ${
          erro ? "border-erro" : local ? "border-sucesso" : "border-borda hover:border-texto-suave"
        }`}
      />
      <div aria-live="polite" className="min-h-6 text-[0.95rem]">
        {erro ? (
          <p id={idErro} className="flex items-start gap-1.5 text-erro">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {erro}
          </p>
        ) : local ? (
          <p id={idDica} className="flex items-center gap-1.5 text-sucesso">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            {descreverLocal(local)}
          </p>
        ) : (
          <p id={idDica} className="text-texto-suave">
            8 números.{" "}
            <button
              type="button"
              onClick={onAjuda}
              className="-my-2.5 inline-flex min-h-11 cursor-pointer items-center font-bold text-azul underline underline-offset-2 hover:text-azul-escuro"
            >
              Não sei o CEP
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
