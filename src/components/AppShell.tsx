"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareText,
  Settings,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/app", label: "Resumen", icon: LayoutDashboard },
  { href: "/app/inbox", label: "Inbox Compartido", icon: Inbox },
  { href: "/app/campaigns", label: "Campañas & Plantillas", icon: Megaphone },
  { href: "/app/automation", label: "Chatbot & Agente IA", icon: Bot },
  { href: "/app/contacts", label: "Contactos CRM", icon: Users },
  { href: "/app/owner", label: "App Dueño & Blog SEO", icon: Wrench },
  { href: "/app/billing", label: "Planes & Facturación", icon: CreditCard },
  { href: "/app/settings", label: "WhatsApp API & Ajustes", icon: Settings },
];

export function AppShell({
  workspaceName,
  userName,
  plan,
  sandboxMode,
  children,
}: {
  workspaceName: string;
  userName: string;
  plan: string;
  sandboxMode: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const SidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 w-64">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2.5 font-bold text-lg text-white">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <MessageSquareText className="w-4 h-4" />
          </span>
          <span>ChimpFlow</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-slate-800">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Workspace</p>
        <p className="text-sm font-semibold text-white truncate mt-0.5">{workspaceName}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
            Plan {plan}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              sandboxMode ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
            }`}
          >
            {sandboxMode ? "Sandbox" : "Meta Live"}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">{userName}</p>
          <p className="text-[11px] text-slate-400">0% Meta Markup</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0">{SidebarContent}</aside>

      {/* Mobile Drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">{SidebarContent}</div>
        </div>
      ) : null}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-900">{workspaceName}</span>
          <span className="text-xs font-semibold text-emerald-700">{plan}</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
