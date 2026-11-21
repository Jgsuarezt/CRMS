"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Send, Sparkles, Star, Wrench } from "lucide-react";

export default function OwnerAppPage() {
  // Quick service sale + Google Review sender
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceDesc, setServiceDesc] = useState("4 Llantas 205/55 R16 + Alineación y Balanceo");
  const [amount, setAmount] = useState("320");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("https://g.page/r/tu-negocio/review");
  const [sendingReceipt, setSendingReceipt] = useState(false);
  const [receiptSent, setReceiptSent] = useState("");

  // SEO Blog Generator
  const [topic, setTopic] = useState("Cuándo cambiar llantas y precios de alineación");
  const [city, setCity] = useState("Monterrey");
  const [article, setArticle] = useState("");
  const [generatingBlog, setGeneratingBlog] = useState(false);

  async function handleQuickSale(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;
    setSendingReceipt(true);
    setReceiptSent("");
    try {
      // 1. Save contact in CRM with Cliente tag
      await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName,
          phone: customerPhone,
          segment: "VIP",
          tags: "Cliente,Recordatorio6Meses",
        }),
      });

      // 2. Simulate / send WhatsApp receipt + Google Review link
      const msg = `¡Gracias por tu visita, ${customerName}! ✅ Registramos tu servicio: ${serviceDesc} ($${amount}). Te recordaremos tu próximo mantenimiento en 6 meses. ¿Nos ayudas con 5 estrellas en Google? 👉 ${googleMapsUrl}`;
      const res = await fetch("/api/sandbox/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: customerName,
          fromPhone: customerPhone,
          body: `Servicio completado: ${serviceDesc}`,
          channel: "WHATSAPP",
        }),
      });

      if (res.ok) {
        setReceiptSent(`Ticket guardado en CRM y listo para enviar: "${msg}"`);
        setCustomerName("");
        setCustomerPhone("");
      }
    } finally {
      setSendingReceipt(false);
    }
  }

  async function handleGenerateBlog(e: React.FormEvent) {
    e.preventDefault();
    setGeneratingBlog(true);
    try {
      const res = await fetch("/api/owner/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, city }),
      });
      const data = await res.json();
      if (res.ok) setArticle(data.article || "");
    } finally {
      setGeneratingBlog(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">App del Dueño & Blog SEO Automático</h1>
        <p className="text-sm text-slate-600 mt-1">
          Herramientas rápidas para mostrador: registra servicios en 10 segundos, pide reseñas en Google Maps y genera artículos SEO para tu web.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Quick Service / Google Review Sender */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" />
              Registro Rápido de Servicio + Reseña Google
            </h2>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3.5 h-3.5" /> 5 Estrellas
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Al terminar un servicio en el taller, regístralo aquí: guarda al cliente en el CRM para recordarle a los 6 meses y le envía tu link de Google Maps.
          </p>

          {receiptSent ? (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{receiptSent}</span>
            </div>
          ) : null}

          <form onSubmit={handleQuickSale} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Roberto Sánchez"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+528112345678"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Servicio / Medida</label>
                <input
                  type="text"
                  required
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monto (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Enlace de Reseñas Google Maps</label>
              <input
                type="text"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={sendingReceipt}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{sendingReceipt ? "Registrando..." : "Registrar Servicio y Pedir Reseña"}</span>
            </button>
          </form>
        </div>

        {/* SEO Blog Generator */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Generador de Blog SEO para tu Web
          </h2>
          <p className="text-xs text-slate-600">
            Incluido en el Plan Business (\$39/mes): genera artículos locales optimizados para Google con botón directo a tu WhatsApp.
          </p>

          <form onSubmit={handleGenerateBlog} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tema del artículo</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generatingBlog}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{generatingBlog ? "Generando artículo SEO..." : "Generar Artículo SEO"}</span>
            </button>
          </form>

          {article ? (
            <textarea
              readOnly
              rows={9}
              value={article}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-800"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
