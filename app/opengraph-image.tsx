import { ImageResponse } from "next/og";

// Prévia exibida ao compartilhar o link (WhatsApp, Teams, redes sociais).
export const alt = "Preços e prazos: redesign da consulta dos Correios (protótipo acadêmico)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#00416b",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="80" height="56" viewBox="0 0 40 28">
            <path d="M4 14 14 4h12L16 14Z" fill="#ffd400" />
            <path d="M36 14 26 24H14l10-10Z" fill="#ffffff" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 700 }}>Correios · Preços e prazos</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>Quanto custa e quando chega?</div>
          <div style={{ fontSize: 34, color: "rgba(255,255,255,0.85)" }}>
            Compare todos os serviços com o preço final e a data de entrega.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            background: "#ffd400",
            color: "#002c4a",
            fontSize: 28,
            fontWeight: 700,
            padding: "12px 24px",
            borderRadius: 12,
          }}
        >
          Protótipo acadêmico de UX/UI · valores simulados
        </div>
      </div>
    ),
    size,
  );
}
