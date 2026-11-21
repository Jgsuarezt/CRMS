import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await context.params;
  const { body, type = "TEXT", templateName } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: "El mensaje no puede estar vacío" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id, workspaceId: session.workspace.id },
    include: { contact: true },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
  }

  const sendResult = await sendWhatsAppMessage({
    workspaceId: session.workspace.id,
    to: conversation.contact.phone,
    type,
    body: body.trim(),
    templateName,
  });

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "OUTBOUND",
      type,
      body: body.trim(),
      templateName,
      externalId: sendResult.externalId,
      status: sendResult.success ? "DELIVERED" : "FAILED",
      isAiGenerated: false,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date(), unreadCount: 0 },
  });

  return NextResponse.json({ ok: true, message, mode: sendResult.mode });
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await context.params;
  const { status, unreadCount } = await req.json();

  const updated = await prisma.conversation.updateMany({
    where: { id, workspaceId: session.workspace.id },
    data: {
      ...(status ? { status } : {}),
      ...(typeof unreadCount === "number" ? { unreadCount } : {}),
    },
  });

  return NextResponse.json({ ok: true, updated: updated.count });
}
