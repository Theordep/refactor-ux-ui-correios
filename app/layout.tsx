import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Preços e Prazos · Redesign Correios (protótipo acadêmico)",
  description:
    "Protótipo acadêmico de UX/UI: uma versão simplificada da consulta de preços e prazos de entrega dos Correios. Valores simulados.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00416b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${atkinson.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-amarelo focus:px-4 focus:py-3 focus:font-bold focus:text-azul-escuro"
        >
          Pular para o conteúdo
        </a>
        <Cabecalho />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Rodape />
      </body>
    </html>
  );
}
