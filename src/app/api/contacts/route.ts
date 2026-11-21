import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contacts });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { name, phone, email, segment, tags } = await req.json();
    if (!name || !phone) {
      return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
    }

    const contact = await prisma.contact.upsert({
      where: {
        workspaceId_phone: {
          workspaceId: session.workspace.id,
          phone: phone.trim(),
        },
      },
      update: {
        name: name.trim(),
        email: email?.trim() || null,
        segment: segment || "Leads",
        tags: tags || "Nuevo",
      },
      create: {
        workspaceId: session.workspace.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        segment: segment || "Leads",
        tags: tags || "Nuevo",
      },
    });

    return NextResponse.json({ ok: true, contact });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error guardando contacto" }, { status: 500 });
  }
}
