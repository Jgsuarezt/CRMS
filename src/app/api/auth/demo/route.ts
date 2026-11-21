import { NextResponse } from "next/server";
import { ensureDemoSession, setSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    const { user, workspace } = await ensureDemoSession();
    await setSessionCookie(user.id, workspace.id);
    return NextResponse.json({ ok: true, workspaceId: workspace.id });
  } catch (err) {
    console.error("Demo login error:", err);
    const message = err instanceof Error ? err.message : "Error iniciando demo";
    const missingDb = !process.env.DATABASE_URL;
    return NextResponse.json(
      {
        error: missingDb
          ? "Falta configurar DATABASE_URL en Vercel"
          : `Error de base de datos: ${message.slice(0, 140)}`,
      },
      { status: 500 }
    );
  }
}
