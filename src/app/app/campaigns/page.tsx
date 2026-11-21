"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Megaphone, Plus, Send } from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  language: string;
  body: string;
  status: string;
}

interface CampaignItem {
  id: string;
  name: string;
  targetSegment: string;
  status: string;
  totalCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  template: TemplateItem;
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [contactsCount, setContactsCount] = useState(0);

  // Campaign form
  const [campName, setCampName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [segment, setSegment] = useState("Todos");
  const [launching, setLaunching] = useState(false);

  // Template form
  const [tplName, setTplName] = useState("");
  const [tplCategory, setTplCategory] = useState("MARKETING");
  const [tplBody, setTplBody] = useState("");
  const [creatingTpl, setCreatingTpl] = useState(false);

  async function loadData() {
    const res = await fetch("/api/campaigns");
    if (!res.ok) return;
    const data = await res.json();
    setCampaigns(data.campaigns || []);
    setTemplates(data.templates || []);
    setContactsCount(data.contactsCount || 0);
    if (!templateId && data.templates?.length > 0) {
      setTemplateId(data.templates[0].id);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLaunchCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!campName.trim() || !templateId) return;
    setLaunching(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: campName, templateId, targetSegment: segment }),
      });
      if (res.ok) {
        setCampName("");
        await loadData();
      }
    } finally {
      setLaunching(false);
    }
  }

  async function handleCreateTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!tplName.trim() || !tplBody.trim()) return;
    setCreatingTpl(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_TEMPLATE",
          name: tplName,
          category: tplCategory,
          bodyText: tplBody,
        }),
      });
      if (res.ok) {
        setTplName("");
        setTplBody("");
        await loadData();
      }
    } finally {
      setCreatingTpl(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Campañas Masivas & Plantillas Meta</h1>
        <p className="text-sm text-slate-600 mt-1">
          Envía broadcasts a tus {contactsCount} contactos registrados usando plantillas oficiales sin recargos.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Launch Broadcast */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            Lanzar Nueva Campaña (Broadcast)
          </h2>

          <form onSubmit={handleLaunchCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de la campaña</label>
              <input
                type="text"
                required
                value={campName}
                onChange={(e) => setCampName(e.target.value)}
                placeholder="Ej. Promo Black Friday VIP"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plantilla Meta</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Segmento objetivo</label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white"
                >
                  <option value="Todos">Todos los contactos</option>
                  <option value="VIP">VIP</option>
                  <option value="Agencias">Agencias</option>
                  <option value="Leads">Leads</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={launching}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{launching ? "Enviando Broadcast..." : "Enviar Campaña Ahora"}</span>
            </button>
          </form>
        </div>

        {/* Create Template */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Crear Plantilla de WhatsApp
          </h2>

          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre (snake_case)</label>
                <input
                  type="text"
                  required
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  placeholder="promo_verano_2026"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría Meta</label>
                <select
                  value={tplCategory}
                  onChange={(e) => setTplCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="MARKETING">MARKETING</option>
                  <option value="UTILITY">UTILITY</option>
                  <option value="AUTHENTICATION">AUTHENTICATION</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cuerpo del mensaje (usa {"{{1}}"} para nombre)
              </label>
              <textarea
                rows={3}
                required
                value={tplBody}
                onChange={(e) => setTplBody(e.target.value)}
                placeholder="Hola {{1}}, tenemos una oferta especial para ti..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={creatingTpl}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{creatingTpl ? "Guardando..." : "Guardar Plantilla"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Campaigns History */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-bold text-slate-900">Historial de Campañas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Campaña</th>
                <th className="px-5 py-3">Plantilla</th>
                <th className="px-5 py-3">Segmento</th>
                <th className="px-5 py-3">Enviados</th>
                <th className="px-5 py-3">Entregados</th>
                <th className="px-5 py-3">Leídos</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{c.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{c.template?.name}</td>
                  <td className="px-5 py-3.5">{c.targetSegment}</td>
                  <td className="px-5 py-3.5 font-mono">{c.sentCount}</td>
                  <td className="px-5 py-3.5 font-mono text-emerald-700 font-semibold">{c.deliveredCount}</td>
                  <td className="px-5 py-3.5 font-mono">{c.readCount}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
