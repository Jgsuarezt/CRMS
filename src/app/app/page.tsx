import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bot, Inbox, Megaphone, Send, Users, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function OverviewContent() {
  const session = await getSession();
  if (!session) redirect("/login");

  const wid = session.workspace.id;

  const [contactsCount, openConvos, campaignsCount, activeFlows, messagesCount, recentCampaigns] =
    await Promise.all([
      prisma.contact.count({ where: { workspaceId: wid } }),
      prisma.conversation.count({ where: { workspaceId: wid, status: "OPEN" } }),
      prisma.campaign.count({ where: { workspaceId: wid } }),
      prisma.automationFlow.count({ where: { workspaceId: wid, isActive: true } }),
      prisma.message.count({ where: { conversation: { workspaceId: wid } } }),
      prisma.campaign.findMany({
        where: { workspaceId: wid },
        include: { template: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    { label: "Contactos CRM", value: contactsCount, icon: Users, href: "/app/contacts" },
    { label: "Chats Abiertos", value: openConvos, icon: Inbox, href: "/app/inbox" },
    { label: "Campañas Enviadas", value: campaignsCount, icon: Megaphone, href: "/app/campaigns" },
    { label: "Flujos IA Activos", value: activeFlows, icon: Bot, href: "/app/automation" },
    { label: "Mensajes Totales", value: messagesCount, icon: Send, href: "/app/inbox" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resumen del Workspace</h1>
          <p className="text-sm text-slate-600 mt-1">
            {session.workspace.sandboxMode
              ? "Modo Sandbox activo: prueba el Inbox, Campañas y Chatbot sin credenciales de Meta."
              : "Conectado a WhatsApp Business Cloud API oficial."}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/app/inbox"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            <Inbox className="w-4 h-4" />
            <span>Ir al Inbox & Simulador</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 transition"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">{s.label}</span>
                <Icon className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900 font-mono">{s.value}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Recent Campaigns */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Campañas Recientes</h2>
            <Link href="/app/campaigns" className="text-sm font-semibold text-emerald-700 hover:underline">
              Ver todas
            </Link>
          </div>

          {recentCampaigns.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no has enviado campañas.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentCampaigns.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      Plantilla: {c.template.name} · Segmento: {c.targetSegment}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-mono font-semibold text-emerald-700">
                      {c.deliveredCount}/{c.totalCount} entregados
                    </span>
                    <p className="text-slate-400">{c.readCount} leídos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Primeros Pasos
            </span>
            <h2 className="text-xl font-bold mt-1">Prueba tu Chatbot IA en 10 segundos</h2>
            <p className="text-sm text-slate-300 mt-2">
              Abre el Inbox Compartido y usa el botón <strong>Simular Cliente</strong> para enviar un mensaje como si fueras un comprador en WhatsApp. Verás responder a tu flujo o Agente IA en vivo.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/app/inbox"
              className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl text-sm font-medium transition"
            >
              <span>1. Probar Simulador en Inbox</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
            <Link
              href="/app/campaigns"
              className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl text-sm font-medium transition"
            >
              <span>2. Lanzar Broadcast Masivo</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
            <Link
              href="/app/settings"
              className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl text-sm font-medium transition"
            >
              <span>3. Conectar Meta WhatsApp API</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Cargando métricas...</div>}>
      <OverviewContent />
    </Suspense>
  );
}
