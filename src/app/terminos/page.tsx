import Link from "next/link";
import { MessageSquareText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg text-slate-900">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <MessageSquareText className="w-4 h-4" />
          </span>
          <span>ChimpFlow</span>
        </Link>

        <h1 className="text-3xl font-bold">Términos de Servicio</h1>
        <p className="text-sm text-slate-500">Última actualización: Noviembre 2026</p>

        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Uso aceptable y políticas de Meta</h2>
          <p>
            Al utilizar ChimpFlow, te comprometes a cumplir con las Políticas de Comercio y Mensajería de WhatsApp Business (Meta). Está prohibido el envío de spam o mensajes masivos a contactos sin consentimiento previo (opt-in).
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">2. Facturación y modelo 0% markup</h2>
          <p>
            La suscripción mensual cubre el acceso a la plataforma SaaS (Inbox, Campañas, Chatbot y Agente IA). Los cargos por conversación o plantilla de WhatsApp Business API se facturan directamente entre tu cuenta de Meta Business Manager y Meta, sin recargos adicionales por parte de ChimpFlow.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">3. Disponibilidad</h2>
          <p>
            Ofrecemos acceso continuo a la plataforma y soporte técnico para la integración de webhooks y plantillas oficiales.
          </p>
        </section>
      </div>
    </div>
  );
}
