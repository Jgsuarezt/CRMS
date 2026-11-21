import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [members, logs] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { workspaceId: session.workspace.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.webhookLog.findMany({
      where: { workspaceId: session.workspace.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  return NextResponse.json({
    workspace: {
      id: session.workspace.id,
      name: session.workspace.name,
      plan: session.workspace.plan,
      wabaId: session.workspace.wabaId || "",
      phoneNumberId: session.workspace.phoneNumberId || "",
      displayPhone: session.workspace.displayPhone || "",
      hasAccessToken: Boolean(session.workspace.accessToken),
      webhookVerifyToken: session.workspace.webhookVerifyToken,
      sandboxMode: session.workspace.sandboxMode,
    },
    members,
    logs,
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const dataToUpdate: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim()) dataToUpdate.name = body.name.trim();
  if (typeof body.wabaId === "string") dataToUpdate.wabaId = body.wabaId.trim() || null;
  if (typeof body.phoneNumberId === "string") dataToUpdate.phoneNumberId = body.phoneNumberId.trim() || null;
  if (typeof body.displayPhone === "string") dataToUpdate.displayPhone = body.displayPhone.trim() || null;
  if (typeof body.accessToken === "string" && body.accessToken.trim()) {
    dataToUpdate.accessToken = body.accessToken.trim();
  }
  if (typeof body.webhookVerifyToken === "string" && body.webhookVerifyToken.trim()) {
    dataToUpdate.webhookVerifyToken = body.webhookVerifyToken.trim();
  }
  if (typeof body.sandboxMode === "boolean") dataToUpdate.sandboxMode = body.sandboxMode;
  if (typeof body.plan === "string") dataToUpdate.plan = body.plan;

  const updated = await prisma.workspace.update({
    where: { id: session.workspace.id },
    data: dataToUpdate,
  });

  return NextResponse.json({ ok: true, workspace: updated });
}
