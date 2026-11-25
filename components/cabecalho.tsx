import Link from "next/link";

function Marca() {
  // Marca simplificada (não é o logotipo oficial): dois losangos nas cores de referência.
  return (
    <svg viewBox="0 0 40 28" aria-hidden="true" className="h-7 w-10 shrink-0">
      <path d="M4 14 14 4h12L16 14Z" fill="var(--amarelo)" />
      <path d="M36 14 26 24H14l10-10Z" fill="#ffffff" />
    </svg>
  );
}

export function Cabecalho() {
  return (
    <header className="bg-azul text-white [&_a:focus-visible]:outline-amarelo">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-lg">
          <Marca />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold">Correios</span>
            <span className="text-sm text-white/85">Preços e prazos</span>
          </span>
        </Link>
        <nav aria-label="Principal">
          <ul className="flex flex-wrap items-center gap-2 text-[0.95rem]">
            <li>
              <Link href="/" className="inline-flex min-h-11 items-center rounded-lg px-3 hover:bg-white/10 active:bg-white/20">
                Calcular frete
              </Link>
            </li>
            <li>
              <Link href="/melhorias" className="inline-flex min-h-11 items-center rounded-lg px-3 hover:bg-white/10 active:bg-white/20">
                O que melhoramos
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="bg-amarelo text-azul-escuro">
        <p className="mx-auto max-w-5xl px-4 py-1.5 text-sm sm:px-6">
          <strong>Protótipo acadêmico.</strong> Não é o site oficial dos Correios. Os valores e prazos são simulados.
        </p>
      </div>
    </header>
  );
}
