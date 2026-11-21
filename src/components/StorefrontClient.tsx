"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, Search, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  tier: string;
  price: number;
  stock: number;
}

export function StorefrontClient({
  slug,
  storeName,
  displayPhone,
  products,
}: {
  slug: string;
  storeName: string;
  displayPhone: string;
  products: ProductItem[];
}) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [cart, setCart] = useState<Array<ProductItem & { qty: number }>>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState<{ total: number; whatsappUrl: string } | null>(null);

  const filtered = products.filter((p) => {
    if (tierFilter !== "ALL" && p.tier !== tierFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
    }
    return true;
  });

  function addToCart(product: ProductItem) {
    setOrderDone(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0 || !customerName.trim() || !customerPhone.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/store/${slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          items: cart.map((c) => ({ id: c.id, qty: c.qty })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderDone({ total: data.total, whatsappUrl: data.whatsappUrl });
        setCart([]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{storeName}</h1>
              <p className="text-xs text-slate-500">Tienda Oficial · WhatsApp {displayPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
            <ShoppingCart className="w-4 h-4" />
            <span>{cart.reduce((a, b) => a + b.qty, 0)} en carrito</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-12 gap-8 items-start">
        {/* Catalog */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar medida o producto (ej. 205/55 R16)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
              />
            </div>
            <div className="flex gap-1.5">
              {["ALL", "ECONOMICA", "MEDIA", "PREMIUM"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTierFilter(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    tierFilter === t
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600"
                  }`}
                >
                  {t === "ALL" ? "Todos" : t}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500">
              No hay productos disponibles con este filtro.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {p.sku}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">{p.tier}</span>
                    </div>
                    <h2 className="font-bold text-slate-900 mt-2">{p.name}</h2>
                    <p className="text-xs text-slate-500 mt-1">Disponible: {p.stock} unidades</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xl font-extrabold font-mono text-slate-900">${p.price}</span>
                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart & Checkout */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 sticky top-24">
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            Tu Pedido
          </h2>

          {orderDone ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>¡Pedido enviado (${orderDone.total.toFixed(2)})!</span>
              </div>
              <p className="text-xs text-emerald-800">
                Ya lo recibimos en nuestro CRM. También puedes abrir WhatsApp para confirmar horario:
              </p>
              <a
                href={orderDone.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <span>Abrir WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : null}

          {cart.length === 0 ? (
            <p className="text-sm text-slate-500">Agrega productos del catálogo para cotizar o pedir.</p>
          ) : (
            <div className="space-y-3">
              <div className="divide-y divide-slate-100 text-sm">
                {cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.qty}x {item.sku}
                      </p>
                      <p className="text-xs text-slate-500">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">${item.price * item.qty}</span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 font-bold text-base">
                <span>Total estimado</span>
                <span className="font-mono text-emerald-700">${total.toFixed(2)} USD</span>
              </div>

              <form onSubmit={handleCheckout} className="space-y-3 pt-2">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Tu WhatsApp (+52...)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Enviando pedido..." : "Finalizar Pedido por WhatsApp"}
                </button>
              </form>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
