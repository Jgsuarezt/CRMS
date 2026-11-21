"use client";

import { useEffect, useState } from "react";
import {
  BellRing,
  Calculator,
  CheckCircle2,
  DollarSign,
  FileText,
  Package,
  Plus,
  Send,
  Smartphone,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";

interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  tier: string;
  price: number;
  stock: number;
}

interface ServiceOrderItem {
  id: string;
  customerName: string;
  customerPhone: string;
  description: string;
  amount: number;
  reminderSent: boolean;
  createdAt: string;
}

export default function OwnerAppPage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [dueReminders, setDueReminders] = useState<ServiceOrderItem[]>([]);
  const [todayStats, setTodayStats] = useState({ count: 0, revenue: 0 });
  const [banner, setBanner] = useState("");

  // Quick service sale + Google Review sender
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceDesc, setServiceDesc] = useState("4 Llantas 205/55 R16 + Alineación y Balanceo");
  const [amount, setAmount] = useState("320");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("https://g.page/r/tu-negocio/review");
  const [sendingReceipt, setSendingReceipt] = useState(false);

  // Express Quote
  const [quotePhone, setQuotePhone] = useState("+525512345678");
  const [selectedSkuId, setSelectedSkuId] = useState("");
  const [quoteQty, setQuoteQty] = useState(4);
  const [quoteInstallFee, setQuoteInstallFee] = useState(25);
  const [sendingQuote, setSendingQuote] = useState(false);

  // Inventory form
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newTier, setNewTier] = useState("MEDIA");
  const [newPrice, setNewPrice] = useState("95");
  const [newStock, setNewStock] = useState("8");
  const [invSearch, setInvSearch] = useState("");

  // SEO Blog Generator
  const [topic, setTopic] = useState("Cuándo cambiar llantas y precios de alineación");
  const [city, setCity] = useState("Monterrey");
  const [article, setArticle] = useState("");
  const [generatingBlog, setGeneratingBlog] = useState(false);

  async function loadOwnerData() {
    const res = await fetch("/api/owner");
    if (!res.ok) return;
    const data = await res.json();
    setCatalog(data.catalog || []);
    setDueReminders(data.dueReminders || []);
    setTodayStats(data.todayStats || { count: 0, revenue: 0 });
    if (!selectedSkuId && data.catalog?.length > 0) {
      setSelectedSkuId(data.catalog[0].id);
    }
  }

  useEffect(() => {
    loadOwnerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleQuickSale(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;
    setSendingReceipt(true);
    setBanner("");
    try {
      const res = await fetch("/api/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ORDER",
          customerName,
          customerPhone,
          description: serviceDesc,
          amount: Number(amount),
          googleMapsUrl,
        }),
      });
      if (res.ok) {
        setBanner(`Servicio guardado en el corte de hoy y reseña enviada a ${customerPhone}.`);
        setCustomerName("");
        setCustomerPhone("");
        await loadOwnerData();
      }
    } finally {
      setSendingReceipt(false);
    }
  }

  async function handleAddCatalog(e: React.FormEvent) {
    e.preventDefault();
    if (!newSku.trim() || !newName.trim()) return;
    const res = await fetch("/api/owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ADD_CATALOG",
        sku: newSku,
        name: newName,
        tier: newTier,
        price: Number(newPrice),
        stock: Number(newStock),
      }),
    });
    if (res.ok) {
      setNewSku("");
      setNewName("");
      await loadOwnerData();
    }
  }

  async function handleUpdateStock(id: string, stock: number) {
    await fetch("/api/owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_STOCK", id, stock }),
    });
    await loadOwnerData();
  }

  async function handleSendQuote(e: React.FormEvent) {
    e.preventDefault();
    const item = catalog.find((c) => c.id === selectedSkuId);
    if (!item || !quotePhone.trim()) return;
    setSendingQuote(true);
    setBanner("");
    const total = item.price * quoteQty + quoteInstallFee;
    const quoteText = `📋 *Cotización Express*\n• Producto: ${quoteQty}x ${item.sku} - ${item.name}\n• Instalación/Balanceo: $${quoteInstallFee} USD\n• *Total: $${total} USD*\n\n¿Te agendamos cita hoy?`;
    try {
      const res = await fetch("/api/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_QUOTE", customerPhone: quotePhone, quoteText }),
      });
      if (res.ok) setBanner(`Cotización enviada por WhatsApp a ${quotePhone} (Total: $${total}).`);
    } finally {
      setSendingQuote(false);
    }
  }

  async function handleSendReminder(orderId: string) {
    const res = await fetch("/api/owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SEND_REMINDER", orderId }),
    });
    if (res.ok) {
      setBanner("Recordatorio de regreso enviado por WhatsApp.");
      await loadOwnerData();
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

  const selectedItem = catalog.find((c) => c.id === selectedSkuId);
  const quoteTotal = selectedItem ? selectedItem.price * quoteQty + quoteInstallFee : 0;
  const filteredCatalog = catalog.filter(
    (c) =>
      !invSearch.trim() ||
      c.sku.toLowerCase().includes(invSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(invSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">App del Dueño & Operación Diaria</h1>
          <p className="text-sm text-slate-600 mt-1">
            Corte diario, inventario conectado a la IA, cotizador express, recordatorios y Blog SEO.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-semibold text-emerald-800">
          <Smartphone className="w-4 h-4" />
          <span>PWA lista: en tu celular usa &quot;Agregar a pantalla de inicio&quot;</span>
        </div>
      </div>

      {banner ? (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{banner}</span>
        </div>
      ) : null}

      {/* Top Row: Corte Diario */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold">Ventas / Corte de Hoy</p>
            <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">
              ${todayStats.revenue.toFixed(2)}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-400 opacity-80" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500 font-semibold">Servicios Hoy</p>
            <p className="text-3xl font-bold font-mono text-slate-900 mt-1">{todayStats.count}</p>
          </div>
          <Wrench className="w-8 h-8 text-emerald-600 opacity-80" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500 font-semibold">Clientes por Volver (6m)</p>
            <p className="text-3xl font-bold font-mono text-slate-900 mt-1">{dueReminders.length}</p>
          </div>
          <BellRing className="w-8 h-8 text-amber-500 opacity-80" />
        </div>
      </div>

      {/* Row 2: Cotizador Express & Registro de Servicio */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            Cotizador Express en 5 Segundos
          </h2>
          <form onSubmit={handleSendQuote} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Producto / Medida del Inventario</label>
              <select
                value={selectedSkuId}
                onChange={(e) => setSelectedSkuId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.sku} — {c.name} (${c.price} · Stock: {c.stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={quoteQty}
                  onChange={(e) => setQuoteQty(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instalación ($)</label>
                <input
                  type="number"
                  min={0}
                  value={quoteInstallFee}
                  onChange={(e) => setQuoteInstallFee(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total</label>
                <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold font-mono text-emerald-700">
                  ${quoteTotal.toFixed(2)}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp del Cliente</label>
              <input
                type="text"
                required
                value={quotePhone}
                onChange={(e) => setQuotePhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={sendingQuote || !selectedItem}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>{sendingQuote ? "Enviando..." : "Enviar Cotización por WhatsApp"}</span>
            </button>
          </form>
        </div>

        {/* Quick Service + Google Review */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" />
              Registrar Venta + Pedir Reseña Google
            </h2>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3.5 h-3.5" /> 5 Estrellas
            </span>
          </div>
          <form onSubmit={handleQuickSale} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monto ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Link Google Maps</label>
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
              <span>{sendingReceipt ? "Registrando..." : "Guardar Venta y Pedir Reseña"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Row 3: Inventario Conectado al Bot IA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              Inventario Rápido (Sincronizado con el Agente IA)
            </h2>
            <p className="text-xs text-slate-500">
              Tu Agente IA consulta esta tabla antes de cotizar por WhatsApp para no ofrecer productos agotados.
            </p>
          </div>
          <input
            type="text"
            value={invSearch}
            onChange={(e) => setInvSearch(e.target.value)}
            placeholder="Buscar medida o marca..."
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm max-w-xs w-full"
          />
        </div>

        <form onSubmit={handleAddCatalog} className="grid sm:grid-cols-6 gap-2.5 items-end">
          <input
            type="text"
            required
            value={newSku}
            onChange={(e) => setNewSku(e.target.value)}
            placeholder="Medida (205/55 R16)"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
          />
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Marca / Modelo"
            className="sm:col-span-2 rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={newTier}
            onChange={(e) => setNewTier(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value="ECONOMICA">Económica</option>
            <option value="MEDIA">Media</option>
            <option value="PREMIUM">Premium</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              required
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="$"
              className="rounded-xl border border-slate-300 px-2.5 py-2 text-sm font-mono"
            />
            <input
              type="number"
              required
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="Qty"
              className="rounded-xl border border-slate-300 px-2.5 py-2 text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 px-3 text-sm font-semibold text-white hover:bg-emerald-700 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Medida / SKU</th>
                <th className="px-4 py-2.5">Producto</th>
                <th className="px-4 py-2.5">Gama</th>
                <th className="px-4 py-2.5">Precio</th>
                <th className="px-4 py-2.5">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCatalog.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2.5 font-mono font-semibold text-slate-900">{item.sku}</td>
                  <td className="px-4 py-2.5">{item.name}</td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-slate-600">{item.tier}</td>
                  <td className="px-4 py-2.5 font-mono text-emerald-700 font-semibold">${item.price}</td>
                  <td className="px-4 py-2.5">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStock(item.id, item.stock - 1)}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold w-6 text-center">{item.stock}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateStock(item.id, item.stock + 1)}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Recordatorios 6 Meses & Blog SEO */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-500" />
            Clientes por Volver (Recordatorio 6 Meses)
          </h2>
          {dueReminders.length === 0 ? (
            <p className="text-sm text-slate-500">Todos los recordatorios pendientes ya fueron enviados.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {dueReminders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{o.customerName}</p>
                    <p className="text-xs text-slate-500">{o.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendReminder(o.id)}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 cursor-pointer shrink-0"
                  >
                    Enviar Promo
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Generador de Blog SEO para tu Web
          </h2>
          <form onSubmit={handleGenerateBlog} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="col-span-2 rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={generatingBlog}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{generatingBlog ? "Generando..." : "Generar Artículo SEO"}</span>
            </button>
          </form>
          {article ? (
            <textarea
              readOnly
              rows={7}
              value={article}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-800"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
