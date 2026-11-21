import Link from "next/link";
import {
  Bot,
  Check,
  Inbox,
  Megaphone,
  MessageSquareText,
  ShieldCheck,
  ShoppingBag,
  Users,
  Webhook,
  Zap,
} from "lucide-react";
import { DemoLoginButton } from "@/components/DemoLoginButton";
import { LandingCalculator } from "@/components/LandingCalculator";

const FEATURES = [
  {
    icon: Megaphone,
    title: "Campañas Masivas (Broadcasts)",
    desc: "Envía mensajes personalizados a miles de contactos usando plantillas oficiales de Meta sin riesgo de bloqueo.",
  },
  {
    icon: Inbox,
    title: "Inbox Compartido Omnicanal",
    desc: "Centraliza WhatsApp, Instagram y Facebook Messenger en una sola bandeja con asignación automática de agentes.",
  },
  {
    icon: Bot,
    title: "Agente IA 24/7 + Flujos",
    desc: "Entrena un agente con tus PDFs, horarios y precios para responder preguntas frecuentes y agendar citas al instante.",
  },
  {
    icon: ShoppingBag,
    title: "Catálogo y Carritos",
    desc: "Conecta Shopify o WooCommerce para recuperar carritos abandonados y confirmar pedidos automáticamente.",
  },
  {
    icon: Users,
    title: "CRM y Segmentación",
    desc: "Organiza leads con etiquetas, campos personalizados y segmentos inteligentes para disparar la conversión.",
  },
  {
    icon: Webhook,
    title: "API REST y Webhooks",
    desc: "Integra Make, n8n, Zapier o Google Sheets en minutos con endpoints listos para producción.",
  },
];

const PLANS = [
  {
    name: "Básico",
    price: "$12",
    desc: "Ideal para negocios locales que inician con la API oficial de WhatsApp.",
    features: [
      "1 número de WhatsApp + 2 agentes",
      "Hasta 2,000 contactos CRM (CSV)",
      "Chatbot de menú y palabras clave",
      "0% de recargo sobre tarifas Meta",
    ],
    popular: false,
  },
  {
    name: "Pro IA",
    price: "$24",
    desc: "Tu vendedor inteligente 24/7 que lee audios, fotos, agenda citas y pide reseñas.",
    features: [
      "Hasta 5 agentes en Inbox Compartido",
      "Agente IA 24/7 (Texto, Audios y Fotos)",
      "Agenda de citas, recordatorios y Reseñas Google",
      "Campañas masivas + 0% recargo Meta",
    ],
    popular: true,
  },
  {
    name: "Business Omnicanal",
    price: "$39",
    desc: "WhatsApp + Messenger + Instagram + Blog SEO automático para atraer tráfico.",
    features: [
      "WhatsApp + Facebook Messenger + Instagram DM",
      "Blog SEO automático (tráfico web a tu WhatsApp)",
      "App del Dueño + 15 agentes y 25,000 contactos",
      "Google Sheets, Shopify, Webhooks y API",
    ],
    popular: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900">
            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <MessageSquareText className="w-5 h-5" />
            </span>
            <span>ChimpFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#funciones" className="hover:text-slate-900 transition">
              Funciones
            </a>
            <a href="#calculadora" className="hover:text-slate-900 transition">
              Calculadora 0%
            </a>
            <a href="#precios" className="hover:text-slate-900 transition">
              Precios
            </a>
            <a href="#faq" className="hover:text-slate-900 transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2"
            >
              Iniciar sesión
            </Link>
            <DemoLoginButton
              label="Abrir Demo"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              <span>WhatsApp Business Cloud API Oficial</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Tu plataforma de WhatsApp Marketing & CRM con 0% de recargo
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed">
              Envía campañas masivas sin bloqueos, atiende en un Inbox compartido para todo tu equipo y automatiza ventas 24/7 con nuestro Agente IA. Pagas directo a Meta por tus mensajes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <DemoLoginButton label="Probar Demo Interactiva" />
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
              >
                Crear Cuenta Gratis
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Simulador Sandbox incluido
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Sin tarjeta requerida
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Listo en 5 minutos
              </span>
            </div>
          </div>

          {/* Live UI Preview Card */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-sm font-semibold">Inbox Compartido — WhatsApp Oficial</span>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-medium">
                  Agente IA Activo
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="bg-slate-800 rounded-xl p-3.5 max-w-[85%]">
                  <p className="text-xs text-slate-400 mb-1">Sofía Mendoza · +52 55 1234 5678</p>
                  <p>Hola! Vi su anuncio, ¿cuánto cobran por encima de las tarifas de Meta?</p>
                </div>

                <div className="bg-emerald-700/90 rounded-xl p-3.5 max-w-[85%] ml-auto">
                  <p className="text-xs text-emerald-200 mb-1 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" /> ChimpBot IA · Respuesta automática
                  </p>
                  <p>
                    ¡Hola Sofía! Cobramos 0% de recargo sobre las tarifas oficiales de Meta. Pagas directo a Meta y solo tu plan mensual desde $12/mes.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
                  <div className="bg-slate-800/60 rounded-lg p-2.5">
                    <p className="text-xs text-slate-400">Entregados</p>
                    <p className="text-lg font-bold font-mono text-emerald-400">98.4%</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-2.5">
                    <p className="text-xs text-slate-400">Leídos</p>
                    <p className="text-lg font-bold font-mono text-white">84.9%</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-2.5">
                    <p className="text-xs text-slate-400">Markup Meta</p>
                    <p className="text-lg font-bold font-mono text-emerald-400">0%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funciones" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            Todo en un solo lugar
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Todo lo que necesitas para vender y atender por WhatsApp
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive 0% Markup Calculator */}
      <LandingCalculator />

      {/* Pricing */}
      <section id="precios" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            Planes SaaS Simples
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Elige el plan ideal para tu negocio o agencia
          </h2>
          <p className="mt-3 text-slate-600">
            Todos los planes incluyen 0% de recargo en mensajes de Meta y modo Sandbox gratuito.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 flex flex-col justify-between border ${
                plan.popular
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                  : "bg-white text-slate-900 border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.popular ? (
                    <span className="text-xs font-semibold bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                      Más Popular
                    </span>
                  ) : null}
                </div>
                <p className={`text-sm mt-2 ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                  {plan.desc}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-mono">{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                    USD / mes
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.popular ? "text-emerald-400" : "text-emerald-600"
                        }`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <DemoLoginButton
                  label={`Probar ${plan.name}`}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition cursor-pointer ${
                    plan.popular
                      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" /> ¿Cómo funciona el Modo Sandbox?
              </h3>
              <p className="text-sm text-slate-600">
                Puedes probar el Inbox, las campañas masivas, los flujos y el Agente IA al instante sin tener credenciales de Meta. Cuando estés listo, pegas tu Phone Number ID y Token en Ajustes.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> ¿Hay riesgo de bloqueo?
              </h3>
              <p className="text-sm text-slate-600">
                No. Utilizamos exclusivamente la WhatsApp Business Cloud API oficial de Meta, cumpliendo al 100% con sus políticas de plantillas y opt-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <MessageSquareText className="w-4 h-4 text-emerald-400" />
            <span>ChimpFlow CRM</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/privacidad" className="hover:text-white transition">
              Política de Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-white transition">
              Términos de Servicio
            </Link>
          </div>
          <p className="text-xs">WhatsApp Marketing, Inbox Compartido & Agentes IA.</p>
        </div>
      </footer>
    </div>
  );
}
