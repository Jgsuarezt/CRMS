import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processInboundMessage } from "@/lib/whatsapp/engine";

export async function POST(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const { customerName, customerPhone, items } = await req.json();

    if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Nombre, teléfono y al menos 1 producto son requeridos" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({ where: { slug } });
    if (!workspace) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }

    const summaryLines: string[] = [];
    let total = 0;

    for (const item of items) {
      const dbItem = await prisma.catalogItem.findFirst({
        where: { id: item.id, workspaceId: workspace.id },
      });
      if (!dbItem) continue;
      const qty = Math.max(1, Number(item.qty) || 1);
      total += dbItem.price * qty;
      summaryLines.push(`${qty}x ${dbItem.sku} ${dbItem.name} ($${dbItem.price * qty})`);
    }

    if (summaryLines.length === 0) {
      return NextResponse.json({ error: "Productos inválidos" }, { status: 400 });
    }

    const description = `Pedido Tienda Web: ${summaryLines.join(", ")}`;
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);

    await prisma.serviceOrder.create({
      data: {
        workspaceId: workspace.id,
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        description,
        amount: total,
        nextReminderAt: sixMonths,
        reminderSent: false,
      },
    });

    await processInboundMessage({
      workspaceId: workspace.id,
      fromPhone: String(customerPhone).trim(),
      contactName: String(customerName).trim(),
      body: `🛒 Nuevo pedido en Tienda Web:\n${summaryLines.join("\n")}\nTotal: $${total.toFixed(2)} USD`,
      channel: "WHATSAPP",
      source: "SANDBOX",
    });

    const businessPhone = (workspace.displayPhone || "+525500000000").replace(/\D/g, "");
    const waText = encodeURIComponent(
      `Hola! Hice este pedido en su tienda:\n${summaryLines.join("\n")}\nTotal: $${total.toFixed(2)} USD\nMi nombre: ${customerName}`
    );

    return NextResponse.json({
      ok: true,
      total,
      whatsappUrl: `https://wa.me/${businessPhone}?text=${waText}`,
    });
  } catch (err) {
    console.error("Store checkout error:", err);
    return NextResponse.json({ error: "Error procesando pedido" }, { status: 500 });
  }
}
