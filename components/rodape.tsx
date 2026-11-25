import Link from "next/link";

export function Rodape() {
  return (
    <footer className="mt-16 border-t border-borda-suave bg-superficie">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-texto-suave sm:px-6">
        <p>
          Projeto da disciplina <strong className="text-texto">Projeto Integrador de UX/UI</strong>: redesign da consulta de
          preços e prazos do site dos Correios.
        </p>
        <p>
          Sem banco de dados nem integração com sistemas reais: todos os preços, prazos e endereços são gerados por uma
          simulação local. Para enviar de verdade, consulte o{" "}
          <a
            href="https://www.correios.com.br/"
            className="font-bold text-azul underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            site oficial dos Correios
          </a>
          .
        </p>
        <p>
          <Link href="/melhorias" className="font-bold text-azul underline underline-offset-2">
            Veja os problemas encontrados no site atual e o que mudamos
          </Link>
        </p>
      </div>
    </footer>
  );
}
