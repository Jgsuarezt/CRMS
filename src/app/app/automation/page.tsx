"use client";

import { useEffect, useState } from "react";
import { Bot, Plus, Save, Workflow, Zap } from "lucide-react";

interface FlowItem {
  id: string;
  name: string;
  triggerType: string;
  triggerKeywords: string;
  responseText: string;
  isActive: boolean;
  executionsCount: number;
}

export default function AutomationPage() {
  const [flows, setFlows] = useState<FlowItem[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiAgentName, setAiAgentName] = useState("ChimpBot IA");
  const [aiSystemPrompt, setAiSystemPrompt] = useState("");
  const [aiKnowledgeBase, setAiKnowledgeBase] = useState("");
  const [savingAi, setSavingAi] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  // New flow state
  const [flowName, setFlowName] = useState("");
  const [triggerType, setTriggerType] = useState("KEYWORD");
  const [keywords, setKeywords] = useState("");
  const [responseText, setResponseText] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadData() {
    const res = await fetch("/api/automations");
    if (!res.ok) return;
    const data = await res.json();
    setFlows(data.flows || []);
    if (data.aiConfig) {
      setAiEnabled(data.aiConfig.aiEnabled);
      setAiAgentName(data.aiConfig.aiAgentName);
      setAiSystemPrompt(data.aiConfig.aiSystemPrompt);
      setAiKnowledgeBase(data.aiConfig.aiKnowledgeBase);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSaveAi(e: React.FormEvent) {
    e.preventDefault();
    setSavingAi(true);
    setSavedBanner(false);
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_AI",
          aiEnabled,
          aiAgentName,
          aiSystemPrompt,
          aiKnowledgeBase,
        }),
      });
      if (res.ok) setSavedBanner(true);
    } finally {
      setSavingAi(false);
    }
  }

  async function handleToggleFlow(id: string, current: boolean) {
    await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "TOGGLE_FLOW", id, isActive: !current }),
    });
    await loadData();
  }

  async function handleCreateFlow(e: React.FormEvent) {
    e.preventDefault();
    if (!flowName.trim() || !responseText.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: flowName,
          triggerType,
          triggerKeywords: keywords,
          responseText,
        }),
      });
      if (res.ok) {
        setFlowName("");
        setKeywords("");
        setResponseText("");
        await loadData();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chatbot & Agente IA 24/7</h1>
        <p className="text-sm text-slate-600 mt-1">
          Configura flujos por palabras clave y entrena a tu Agente IA con la información de tu negocio.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* AI Agent Config */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" />
              Agente IA Conversacional
            </h2>
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-600"
              />
              <span>{aiEnabled ? "Activo" : "Pausado"}</span>
            </label>
          </div>

          <form onSubmit={handleSaveAi} className="space-y-4">
            {savedBanner ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                Configuración del Agente IA guardada correctamente.
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Agente</label>
              <input
                type="text"
                value={aiAgentName}
                onChange={(e) => setAiAgentName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instrucciones (System Prompt)</label>
              <textarea
                rows={3}
                value={aiSystemPrompt}
                onChange={(e) => setAiSystemPrompt(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Base de Conocimiento (Precios, Horarios, FAQs)
              </label>
              <textarea
                rows={4}
                value={aiKnowledgeBase}
                onChange={(e) => setAiKnowledgeBase(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={savingAi}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingAi ? "Guardando..." : "Guardar Entrenamiento IA"}</span>
            </button>
          </form>
        </div>

        {/* Create Keyword Flow */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Workflow className="w-5 h-5 text-emerald-600" />
            Crear Flujo Automático
          </h2>

          <form onSubmit={handleCreateFlow} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Flujo</label>
                <input
                  type="text"
                  required
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  placeholder="Ej. Envío de Catálogo"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disparador</label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="KEYWORD">Palabra Clave</option>
                  <option value="WELCOME">Bienvenida</option>
                  <option value="DRIP">Secuencia Drip</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Palabras clave (separadas por coma)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="catalogo, productos, tienda, comprar"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Respuesta automática</label>
              <textarea
                rows={4}
                required
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="¡Aquí tienes nuestro catálogo actualizado!..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{creating ? "Creando..." : "Crear Flujo"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Active Flows List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Flujos Configurados</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {flows.map((f) => (
            <div key={f.id} className="border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${f.isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  <h3 className="font-bold text-slate-900 text-sm">{f.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleFlow(f.id, f.isActive)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer ${
                    f.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {f.isActive ? "Activo" : "Inactivo"}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Keywords: <span className="font-mono text-slate-700">{f.triggerKeywords || "N/A"}</span> ·{" "}
                {f.executionsCount} ejecuciones
              </p>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg">{f.responseText}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
