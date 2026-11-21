"use client";

import { useEffect, useState } from "react";
import { Save, Server, Shield, Webhook } from "lucide-react";

interface WebhookLogItem {
  id: string;
  source: string;
  eventType: string;
  status: string;
  payloadJson: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [displayPhone, setDisplayPhone] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [webhookVerifyToken, setWebhookVerifyToken] = useState("");
  const [sandboxMode, setSandboxMode] = useState(true);
  const [logs, setLogs] = useState<WebhookLogItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function loadSettings() {
    const res = await fetch("/api/settings");
    if (!res.ok) return;
    const data = await res.json();
    if (data.workspace) {
      setName(data.workspace.name || "");
      setWabaId(data.workspace.wabaId || "");
      setPhoneNumberId(data.workspace.phoneNumberId || "");
      setDisplayPhone(data.workspace.displayPhone || "");
      setHasAccessToken(Boolean(data.workspace.hasAccessToken));
      setWebhookVerifyToken(data.workspace.webhookVerifyToken || "");
      setSandboxMode(Boolean(data.workspace.sandboxMode));
    }
    setLogs(data.logs || []);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          wabaId,
          phoneNumberId,
          displayPhone,
          accessToken: accessToken.trim() || undefined,
          webhookVerifyToken,
          sandboxMode,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setAccessToken("");
        await loadSettings();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">WhatsApp Business Cloud API & Ajustes</h1>
        <p className="text-sm text-slate-600 mt-1">
          Opera en Modo Sandbox local o conecta tus credenciales oficiales de Meta for Developers.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        {saved ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
            Ajustes guardados correctamente.
          </div>
        ) : null}

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              Modo Sandbox / Simulador Local
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Cuando está activo, los envíos se simulan localmente sin llamar a Meta Graph API.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={sandboxMode}
              onChange={(e) => setSandboxMode(e.target.checked)}
              className="w-4 h-4 accent-emerald-600"
            />
            <span>{sandboxMode ? "Sandbox Activo" : "Meta Cloud API Live"}</span>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Workspace</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono visible</label>
            <input
              type="text"
              value={displayPhone}
              onChange={(e) => setDisplayPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meta WABA ID</label>
            <input
              type="text"
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
              placeholder="Ej. 104928374650192"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Phone Number ID</label>
            <input
              type="text"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="Ej. 394857102938475"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Permanent Access Token {hasAccessToken ? "(Configurado ✓)" : ""}
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder={hasAccessToken ? "•••••••••••• (dejar vacío para mantener)" : "EAAG..."}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Webhook Verify Token</label>
            <input
              type="text"
              value={webhookVerifyToken}
              onChange={(e) => setWebhookVerifyToken(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-1">
          <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> Endpoint Webhook para Meta App Dashboard:
          </p>
          <p className="font-mono">POST / GET https://tu-dominio.com/api/webhooks/whatsapp</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Guardando..." : "Guardar Configuración"}</span>
        </button>
      </form>

      {/* Webhook Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <Webhook className="w-4 h-4 text-emerald-600" />
          <h2 className="font-bold text-slate-900 text-sm">Registro Reciente de Webhooks (Meta / Sandbox)</h2>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {logs.length === 0 ? (
            <p className="p-5 text-slate-500">Sin eventos registrados aún.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    {log.eventType} · <span className="text-emerald-700">{log.source}</span>
                  </span>
                  <span className="text-slate-400">
                    {new Date(log.createdAt).toLocaleString("es-ES")}
                  </span>
                </div>
                <pre className="bg-slate-50 p-2 rounded-lg overflow-x-auto text-[11px] text-slate-600">
                  {log.payloadJson}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
