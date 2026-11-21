import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { processInboundMessage } from "@/lib/whatsapp/engine";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { fromPhone, contactName, body, channel } = await req.json();
    if (!fromPhone || !body) {
      return NextResponse.json({ error: "Teléfono y mensaje son requeridos" }, { status: 400 });
    }

    const result = await processInboundMessage({
      workspaceId: session.workspace.id,
      fromPhone: fromPhone.trim(),
      contactName: contactName?.trim(),
      body: body.trim(),
      channel: channel || "WHATSAPP",
      source: "SANDBOX",
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error en simulador" }, { status: 500 });
  }
}
