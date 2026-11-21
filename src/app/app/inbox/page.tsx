"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  CheckCheck,
  MessageSquarePlus,
  Search,
  Send,
  Smartphone,
  User,
  X,
} from "lucide-react";

interface MessageItem {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  body: string;
  status: string;
  isAiGenerated: boolean;
  createdAt: string;
}

interface ConversationItem {
  id: string;
  channel: string;
  status: string;
  unreadCount: number;
  lastMessageAt: string;
  contact: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    segment: string;
    tags: string;
  };
  messages: MessageItem[];
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  // Simulator modal state
  const [simOpen, setSimOpen] = useState(false);
  const [simChannel, setSimChannel] = useState<"WHATSAPP" | "MESSENGER" | "INSTAGRAM">("WHATSAPP");
  const [simName, setSimName] = useState("Lucía Gómez");
  const [simPhone, setSimPhone] = useState("+525598765432");
  const [simBody, setSimBody] = useState("Hola! Cuál es el precio de los planes?");
  const [simLoading, setSimLoading] = useState(false);

  async function loadConversations(selectId?: string) {
    const res = await fetch("/api/conversations");
    if (!res.ok) return;
    const data = await res.json();
    setConversations(data.conversations || []);
    if (selectId) {
      setSelectedId(selectId);
    } else if (!selectedId && data.conversations?.length > 0) {
      setSelectedId(data.conversations[0].id);
    }
  }

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = conversations.filter((c) => {
    if (filter !== "ALL" && c.status !== filter) return false;
    if (channelFilter !== "ALL" && c.channel !== channelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.contact.name.toLowerCase().includes(q) ||
        c.contact.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeConv = conversations.find((c) => c.id === selectedId) || filtered[0] || null;

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeConv || !replyText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeConv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText("");
        await loadConversations(activeConv.id);
      }
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!activeConv) return;
    await fetch(`/api/conversations/${activeConv.id}/messages`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await loadConversations(activeConv.id);
  }

  async function handleSimulateInbound(e: React.FormEvent) {
    e.preventDefault();
    if (!simPhone.trim() || !simBody.trim()) return;
    setSimLoading(true);
    try {
      const res = await fetch("/api/sandbox/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: simName,
          fromPhone: simPhone,
          body: simBody,
          channel: simChannel,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSimOpen(false);
        await loadConversations(data.conversation?.id);
      }
    } finally {
      setSimLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inbox Compartido Omnicanal</h1>
          <p className="text-sm text-slate-600">
            Atiende WhatsApp, Instagram y Messenger en un solo lugar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSimOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Simular Mensaje de Cliente</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid lg:grid-cols-12 min-h-[620px]">
        {/* Left: Conversations List */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col">
          <div className="p-3 border-b border-slate-200 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar contacto o teléfono..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-1.5 text-xs">
              {["ALL", "OPEN", "PENDING", "RESOLVED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    filter === st
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st === "ALL" ? "Todos" : st === "OPEN" ? "Abiertos" : st === "PENDING" ? "Pendientes" : "Resueltos"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No hay conversaciones en este filtro.
              </div>
            ) : (
              filtered.map((conv) => {
                const lastMsg = conv.messages[conv.messages.length - 1];
                const isSelected = activeConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left p-3.5 hover:bg-slate-50 transition cursor-pointer ${
                      isSelected ? "bg-emerald-50/70 border-l-4 border-emerald-600" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {conv.contact.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {conv.channel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {lastMsg?.body || "Sin mensajes"}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[11px]">
                      <span className="text-slate-400 font-mono">{conv.contact.phone}</span>
                      <span
                        className={`font-semibold ${
                          conv.status === "OPEN"
                            ? "text-emerald-700"
                            : conv.status === "RESOLVED"
                              ? "text-slate-400"
                              : "text-amber-600"
                        }`}
                      >
                        {conv.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center: Chat Thread */}
        <div className="lg:col-span-5 flex flex-col border-r border-slate-200 bg-slate-50/50">
          {activeConv ? (
            <>
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">{activeConv.contact.name}</h2>
                  <p className="text-xs text-slate-500 font-mono">{activeConv.contact.phone}</p>
                </div>
                <div className="flex gap-2">
                  {activeConv.status !== "RESOLVED" ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange("RESOLVED")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 cursor-pointer"
                    >
                      Marcar Resuelto
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStatusChange("OPEN")}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                    >
                      Reabrir Chat
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[460px]">
                {activeConv.messages.map((m) => {
                  const isOut = m.direction === "OUTBOUND";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[82%] ${isOut ? "ml-auto items-end" : "items-start"}`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                          isOut
                            ? "bg-emerald-600 text-white rounded-br-sm"
                            : "bg-white border border-slate-200 text-slate-900 rounded-bl-sm"
                        }`}
                      >
                        {m.isAiGenerated ? (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-100 mb-1">
                            <Bot className="w-3 h-3" /> Respuesta Automática / IA
                          </div>
                        ) : null}
                        <p className="whitespace-pre-wrap">{m.body}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isOut ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escribe una respuesta por WhatsApp..."
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Selecciona una conversación o simula un cliente nuevo.
            </div>
          )}
        </div>

        {/* Right: Contact CRM Details */}
        <div className="lg:col-span-3 p-5 bg-white space-y-5">
          {activeConv ? (
            <>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{activeConv.contact.name}</p>
                  <p className="text-xs text-slate-500">{activeConv.contact.email || "Sin email"}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Teléfono</p>
                  <p className="font-mono text-slate-900 mt-0.5">{activeConv.contact.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Segmento</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                    {activeConv.contact.segment}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Etiquetas</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeConv.contact.tags.split(",").map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-xs bg-emerald-50 text-emerald-700 font-medium"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* WhatsApp Customer Simulator Modal */}
      {simOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-emerald-600" />
                Simulador de Cliente (Sandbox)
              </h3>
              <button
                type="button"
                onClick={() => setSimOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Simula un mensaje entrante de WhatsApp. Si coincide con una palabra clave (ej. &quot;precio&quot;, &quot;hola&quot;) o el Agente IA está activo, responderá automáticamente.
            </p>

            <form onSubmit={handleSimulateInbound} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Canal</label>
                <select
                  value={simChannel}
                  onChange={(e) => setSimChannel(e.target.value as "WHATSAPP" | "MESSENGER" | "INSTAGRAM")}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="WHATSAPP">WhatsApp Oficial</option>
                  <option value="MESSENGER">Facebook Messenger (Página)</option>
                  <option value="INSTAGRAM">Instagram DM</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono o ID</label>
                <input
                  type="text"
                  required
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Mensaje del Cliente</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSimBody("[Nota de voz] Hola, busco llantas 205/55 R16 con instalación")}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      + Audio
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimBody("[Foto adjunta: llanta 205/55 R16] ¿Tienes esta medida?")}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      + Foto
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  required
                  value={simBody}
                  onChange={(e) => setSimBody(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={simLoading}
                className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-semibold hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
              >
                {simLoading ? "Procesando Webhook..." : "Enviar Mensaje Simulado"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
