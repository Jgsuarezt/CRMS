import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ChimpFlow — CRM & App del Dueño",
    short_name: "ChimpFlow",
    description: "Inbox WhatsApp, Agente IA, Inventario y Cotizador Express para negocios.",
    start_url: "/app/owner",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#059669",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
