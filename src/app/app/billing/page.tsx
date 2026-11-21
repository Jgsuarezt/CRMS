"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, ShieldCheck } from "lucide-react";

const PLANS = [
  { id: "STARTER", name: "Starter", price: "$29/mes", desc: "2,000 contactos · 3 agentes · Broadcasts" },
  { id: "PRO", name: "Pro", price: "$79/mes", desc: "25,000 contactos · 10 agentes · Agente IA 24/7" },
  { id: "ENTERPRISE", name: "Enterprise", price: "$199/mes", desc: "Ilimitado · Multi-número · API & Marca Blanca" },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("PRO");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.workspace?.plan) setCurrentPlan(d.workspace.plan);
      });
  }, []);

  async function selectPlan(planId: string) {
    setUpdating(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      if (res.ok) setCurrentPlan(planId);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Planes SaaS & Facturación</h1>
        <p className="text-sm text-slate-600 mt-1">
          0% de comisión en tus mensajes de WhatsApp. Pagas directo a Meta desde tu Business Manager.
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-sm text-emerald-900">
          <p className="font-bold">Modelo 0% Meta Markup activo</p>
          <p className="mt-0.5">
            En producción, conecta Stripe o MercadoPago aquí para cobrar automáticamente las suscripciones de tus clientes mientras ellos conectan su tarjeta directo en Meta.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((p) => {
          const isCurrent = currentPlan === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-2xl p-6 border flex flex-col justify-between ${
                isCurrent ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">{p.name}</h2>
                  {isCurrent ? (
                    <span className="text-xs font-semibold bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                      Plan Actual
                    </span>
                  ) : null}
                </div>
                <p className="text-3xl font-extrabold font-mono mt-4">{p.price}</p>
                <p className={`text-sm mt-2 ${isCurrent ? "text-slate-300" : "text-slate-600"}`}>{p.desc}</p>
              </div>

              <button
                type="button"
                disabled={isCurrent || updating}
                onClick={() => selectPlan(p.id)}
                className={`mt-6 w-full py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer ${
                  isCurrent
                    ? "bg-slate-800 text-emerald-400 cursor-default"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {isCurrent ? <Check className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                <span>{isCurrent ? "Activo" : "Cambiar a este plan"}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
