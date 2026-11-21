import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const flows = await prisma.automationFlow.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    flows,
    aiConfig: {
      aiEnabled: session.workspace.aiEnabled,
      aiAgentName: session.workspace.aiAgentName,
      aiSystemPrompt: session.workspace.aiSystemPrompt,
      aiKnowledgeBase: session.workspace.aiKnowledgeBase,
    },
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  if (body.action === "UPDATE_AI") {
    const updated = await prisma.workspace.update({
      where: { id: session.workspace.id },
      data: {
        aiEnabled: Boolean(body.aiEnabled),
        aiAgentName: body.aiAgentName || "ChimpBot IA",
        aiSystemPrompt: body.aiSystemPrompt || "",
        aiKnowledgeBase: body.aiKnowledgeBase || "",
      },
    });
    return NextResponse.json({ ok: true, workspace: updated });
  }

  if (body.action === "TOGGLE_FLOW") {
    const flow = await prisma.automationFlow.updateMany({
      where: { id: body.id, workspaceId: session.workspace.id },
      data: { isActive: Boolean(body.isActive) },
    });
    return NextResponse.json({ ok: true, updated: flow.count });
  }

  const { name, triggerType, triggerKeywords, responseText } = body;
  if (!name || !responseText) {
    return NextResponse.json({ error: "Nombre y respuesta requeridos" }, { status: 400 });
  }

  const flow = await prisma.automationFlow.create({
    data: {
      workspaceId: session.workspace.id,
      name,
      triggerType: triggerType || "KEYWORD",
      triggerKeywords: triggerKeywords || "",
      responseText,
      isActive: true,
    },
  });

  return NextResponse.json({ ok: true, flow });
}
