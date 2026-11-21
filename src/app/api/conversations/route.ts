import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { workspaceId: session.workspace.id },
    include: {
      contact: true,
      assignedTo: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return NextResponse.json({ conversations });
}
