import Link from "next/link";
import { MessageSquareText } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg text-slate-900">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <MessageSquareText className="w-4 h-4" />
          </span>
          <span>ChimpFlow</span>
        </Link>

        <h1 className="text-3xl font-bold">Política de Privacidad</h1>
        <p className="text-sm text-slate-500">Última actualización: Noviembre 2026</p>

        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Datos que recopilamos</h2>
          <p>
            Recopilamos únicamente la información necesaria para operar la plataforma SaaS de mensajería y CRM: nombre, correo electrónico, datos de configuración de WhatsApp Business Cloud API y los contactos/mensajes gestionados dentro de tu Workspace.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">2. Uso de la API oficial de Meta / WhatsApp</h2>
          <p>
            Los tokens de acceso y mensajes procesados a través de WhatsApp Business Cloud API se utilizan exclusivamente para enviar y recibir comunicaciones autorizadas por tu empresa y tus clientes con opt-in verificado. No vendemos ni compartimos tus datos con terceros.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">3. Eliminación de datos</h2>
          <p>
            Puedes solicitar la eliminación completa de tu Workspace, contactos e historial de conversaciones en cualquier momento desde la configuración de tu cuenta o escribiendo a soporte.
          </p>
        </section>
      </div>
    </div>
  );
}
