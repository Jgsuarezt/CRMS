import { NextResponse } from "next/server";
import { ensureDemoSession, setSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    const { user, workspace } = await ensureDemoSession();
    await setSessionCookie(user.id, workspace.id);
    return NextResponse.json({ ok: true, workspaceId: workspace.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error iniciando demo" }, { status: 500 });
  }
}
