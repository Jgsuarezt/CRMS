"use client";

import { useState } from "react";
import { CheckCircle2, Calculator } from "lucide-react";

const COUNTRY_RATES: Record<string, { label: string; marketing: number; utility: number; auth: number }> = {
  MX: { label: "México", marketing: 0.0436, utility: 0.01, auth: 0.01 },
  CO: { label: "Colombia", marketing: 0.0125, utility: 0.005, auth: 0.005 },
  AR: { label: "Argentina", marketing: 0.0618, utility: 0.034, auth: 0.034 },
  EC: { label: "Ecuador / Perú / Chile", marketing: 0.074, utility: 0.02, auth: 0.02 },
  ES: { label: "España", marketing: 0.0615, utility: 0.02, auth: 0.02 },
  US: { label: "Estados Unidos", marketing: 0.025, utility: 0.004, auth: 0.004 },
};

export function LandingCalculator() {
  const [country, setCountry] = useState("MX");
  const [volume, setVolume] = useState(10000);

  const rates = COUNTRY_RATES[country];
  const mktCount = Math.round(volume * 0.4);
  const utilCount = Math.round(volume * 0.25);
  const srvCount = Math.round(volume * 0.3);
  const authCount = volume - mktCount - utilCount - srvCount;

  const mktCost = mktCount * rates.marketing;
  const utilCost = utilCount * rates.utility;
  const srvCost = 0; // Service messages within 24h window are free on Meta Cloud API
  const authCost = authCount * rates.auth;

  const metaTotal = mktCost + utilCost + srvCost + authCost;
  const competitorTotal = metaTotal * 1.22; // Typical 22% BSP markup
  const monthlySavings = competitorTotal - metaTotal;
  const annualSavings = monthlySavings * 12;

  return (
    <section id="calculadora" className="py-20 bg-white border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-3">
            <Calculator className="w-4 h-4" />
            <span>TRANSPARENCIA TOTAL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Paga 0% de recargo sobre tarifas de Meta
          </h2>
          <p className="mt-3 text-slate-600">
            Otros proveedores (Wati, AiSensy, Zoko) añaden entre 20% y 25% extra por cada mensaje. Con ChimpFlow pagas directo a Meta.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <label htmlFor="country-select" className="block text-sm font-semibold text-slate-700 mb-2">
                País de tus clientes
              </label>
              <select
                id="country-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(COUNTRY_RATES).map(([code, item]) => (
                  <option key={code} value={code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="volume-range" className="text-sm font-semibold text-slate-700">
                  Mensajes al mes
                </label>
                <span className="text-lg font-bold text-emerald-700 font-mono">
                  {volume.toLocaleString("es-ES")}
                </span>
              </div>
              <input
                id="volume-range"
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1,000</span>
                <span>25,000</span>
                <span>50,000</span>
                <span>100,000</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Marketing ({mktCount.toLocaleString()} msgs)</span>
                <span className="font-mono font-medium text-slate-900">${mktCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Utilidad ({utilCount.toLocaleString()} msgs)</span>
                <span className="font-mono font-medium text-slate-900">${utilCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Servicio 24h ({srvCount.toLocaleString()} msgs)</span>
                <span className="font-mono font-medium text-emerald-700">Gratis ($0.00)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Autenticación ({authCount.toLocaleString()} msgs)</span>
                <span className="font-mono font-medium text-slate-900">${authCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-sm text-emerald-400 font-semibold uppercase tracking-wider">
                Ahorro estimado al año
              </p>
              <p className="text-4xl sm:text-5xl font-bold mt-1 font-mono">
                ${annualSavings.toFixed(0)} <span className="text-lg font-normal text-slate-400">USD/año</span>
              </p>
              <p className="text-sm text-slate-300 mt-2">
                Equivalente a ahorrar <strong className="text-white">${monthlySavings.toFixed(2)}/mes</strong> frente a proveedores con 22% de comisión.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-800/80 rounded-xl p-4">
                <p className="text-xs text-slate-400">Con ChimpFlow (0%)</p>
                <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  ${metaTotal.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 mt-1">Tarifa oficial Meta</p>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-4">
                <p className="text-xs text-slate-400">Otros BSP (+22%)</p>
                <p className="text-2xl font-bold text-slate-300 line-through font-mono mt-1">
                  ${competitorTotal.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 mt-1">Con recargo oculto</p>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Facturación directa con tu tarjeta en Meta Business Manager</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sin riesgo de baneo: 100% WhatsApp Business Cloud API oficial</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
