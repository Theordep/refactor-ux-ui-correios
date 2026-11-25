import { Calculadora } from "@/components/calculadora";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold leading-tight text-azul-escuro sm:text-4xl">Quanto custa e quando chega?</h1>
        <p className="max-w-2xl text-lg text-texto-suave">
          Informe os CEPs, o tamanho e o peso do pacote. Você vê todos os serviços lado a lado, com o preço final e a data
          de entrega.
        </p>
      </div>
        <Calculadora />
      </div>
    </div>
  );
}
