import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [campaigns, templates, contactsCount] = await Promise.all([
    prisma.campaign.findMany({
      where: { workspaceId: session.workspace.id },
      include: { template: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.template.findMany({
      where: { workspaceId: session.workspace.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contact.count({ where: { workspaceId: session.workspace.id } }),
  ]);

  return NextResponse.json({ campaigns, templates, contactsCount });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();

    if (body.action === "CREATE_TEMPLATE") {
      const { name, category, language, headerText, bodyText, footerText } = body;
      if (!name || !bodyText) {
        return NextResponse.json({ error: "Nombre y cuerpo de plantilla requeridos" }, { status: 400 });
      }
      const template = await prisma.template.create({
        data: {
          workspaceId: session.workspace.id,
          name: name.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
          category: category || "MARKETING",
          language: language || "es",
          headerText: headerText || null,
          body: bodyText,
          footerText: footerText || null,
          status: "APPROVED",
        },
      });
      return NextResponse.json({ ok: true, template });
    }

    // Launch Broadcast Campaign
    const { name, templateId, targetSegment } = body;
    if (!name || !templateId) {
      return NextResponse.json({ error: "Nombre y plantilla requeridos" }, { status: 400 });
    }

    const template = await prisma.template.findFirst({
      where: { id: templateId, workspaceId: session.workspace.id },
    });
    if (!template) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }

    const contacts = await prisma.contact.findMany({
      where: {
        workspaceId: session.workspace.id,
        optIn: true,
        ...(targetSegment && targetSegment !== "Todos" ? { segment: targetSegment } : {}),
      },
    });

    let sentCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;

    for (const contact of contacts) {
      const renderedBody = template.body.replace("{{1}}", contact.name);
      const res = await sendWhatsAppMessage({
        workspaceId: session.workspace.id,
        to: contact.phone,
        type: "TEMPLATE",
        body: renderedBody,
        templateName: template.name,
        languageCode: template.language,
      });

      if (res.success) {
        sentCount++;
        deliveredCount++;
      } else {
        failedCount++;
      }
    }

    const campaign = await prisma.campaign.create({
      data: {
        workspaceId: session.workspace.id,
        name,
        templateId: template.id,
        targetSegment: targetSegment || "Todos",
        status: "COMPLETED",
        totalCount: contacts.length,
        sentCount,
        deliveredCount,
        readCount: Math.floor(deliveredCount * 0.8),
        failedCount,
      },
      include: { template: true },
    });

    return NextResponse.json({ ok: true, campaign });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error procesando campaña" }, { status: 500 });
  }
}
