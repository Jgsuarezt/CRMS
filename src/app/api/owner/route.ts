import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const wid = session.workspace.id;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [catalog, orders] = await Promise.all([
    prisma.catalogItem.findMany({
      where: { workspaceId: wid },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceOrder.findMany({
      where: { workspaceId: wid },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= startOfDay);
  const todayRevenue = todayOrders.reduce((acc, o) => acc + o.amount, 0);
  const dueReminders = orders.filter((o) => !o.reminderSent);

  return NextResponse.json({
    catalog,
    orders,
    todayStats: {
      count: todayOrders.length,
      revenue: todayRevenue,
    },
    dueReminders,
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const wid = session.workspace.id;
  const body = await req.json();

  if (body.action === "ADD_CATALOG") {
    const item = await prisma.catalogItem.create({
      data: {
        workspaceId: wid,
        sku: String(body.sku || "").trim(),
        name: String(body.name || "").trim(),
        tier: body.tier || "MEDIA",
        price: Number(body.price) || 0,
        stock: Number(body.stock) || 0,
      },
    });
    return NextResponse.json({ ok: true, item });
  }

  if (body.action === "UPDATE_STOCK") {
    const item = await prisma.catalogItem.updateMany({
      where: { id: body.id, workspaceId: wid },
      data: { stock: Math.max(0, Number(body.stock) || 0) },
    });
    return NextResponse.json({ ok: true, updated: item.count });
  }

  if (body.action === "SEND_QUOTE") {
    const { customerPhone, quoteText } = body;
    if (!customerPhone || !quoteText) {
      return NextResponse.json({ error: "Teléfono y cotización requeridos" }, { status: 400 });
    }
    const res = await sendWhatsAppMessage({
      workspaceId: wid,
      to: String(customerPhone).trim(),
      type: "TEXT",
      body: String(quoteText).trim(),
    });
    return NextResponse.json({ ok: res.success, mode: res.mode });
  }

  if (body.action === "SEND_REMINDER") {
    const order = await prisma.serviceOrder.findFirst({
      where: { id: body.orderId, workspaceId: wid },
    });
    if (!order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });

    const msg = `¡Hola ${order.customerName}! 👋 Te recordamos tu revisión/mantenimiento preventivo (servicio anterior: ${order.description}). Agenda hoy por este chat y obtén 10% de descuento.`;
    await sendWhatsAppMessage({
      workspaceId: wid,
      to: order.customerPhone,
      type: "TEXT",
      body: msg,
    });

    await prisma.serviceOrder.update({
      where: { id: order.id },
      data: { reminderSent: true },
    });

    return NextResponse.json({ ok: true });
  }

  if (body.action === "CREATE_ORDER") {
    const { customerName, customerPhone, description, amount, googleMapsUrl } = body;
    if (!customerName || !customerPhone || !description) {
      return NextResponse.json({ error: "Faltan datos del servicio" }, { status: 400 });
    }

    await prisma.contact.upsert({
      where: {
        workspaceId_phone: { workspaceId: wid, phone: String(customerPhone).trim() },
      },
      update: { name: String(customerName).trim(), segment: "VIP", tags: "Cliente,Recordatorio6Meses" },
      create: {
        workspaceId: wid,
        name: String(customerName).trim(),
        phone: String(customerPhone).trim(),
        segment: "VIP",
        tags: "Cliente,Recordatorio6Meses",
      },
    });

    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);

    const order = await prisma.serviceOrder.create({
      data: {
        workspaceId: wid,
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        description: String(description).trim(),
        amount: Number(amount) || 0,
        nextReminderAt: sixMonths,
        reminderSent: false,
      },
    });

    const msg = `¡Gracias por tu visita, ${customerName}! ✅ Servicio registrado: ${description} ($${amount}). ¿Nos ayudas con 5 estrellas en Google? 👉 ${googleMapsUrl || ""}`;
    await sendWhatsAppMessage({
      workspaceId: wid,
      to: String(customerPhone).trim(),
      type: "TEXT",
      body: msg,
    });

    return NextResponse.json({ ok: true, order });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
