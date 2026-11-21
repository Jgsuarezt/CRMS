import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <AppShell
      workspaceName={session.workspace.name}
      userName={session.user.name}
      plan={session.workspace.plan}
      sandboxMode={session.workspace.sandboxMode}
    >
      {children}
    </AppShell>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
          Cargando workspace...
        </div>
      }
    >
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}
