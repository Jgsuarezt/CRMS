import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processInboundMessage } from "@/lib/whatsapp/engine";

// Meta Webhook Verification (GET)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token) {
    const workspace = await prisma.workspace.findFirst({
      where: { webhookVerifyToken: token },
    });
    if (workspace) {
      return new NextResponse(challenge || "OK", { status: 200 });
    }
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// Meta Webhook Inbound Events (POST)
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const entry = payload?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const phoneNumberId = change?.metadata?.phone_number_id;

    const workspace = phoneNumberId
      ? await prisma.workspace.findFirst({ where: { phoneNumberId } })
      : await prisma.workspace.findFirst();

    if (!workspace) {
      return NextResponse.json({ status: "ignored_no_workspace" }, { status: 200 });
    }

    // Handle delivery/read status updates
    if (change?.statuses?.length) {
      for (const st of change.statuses) {
        const statusUpper = String(st.status || "").toUpperCase();
        if (["SENT", "DELIVERED", "READ", "FAILED"].includes(statusUpper)) {
          await prisma.message.updateMany({
            where: { externalId: st.id },
            data: { status: statusUpper },
          });
        }
      }
    }

    // Handle inbound messages
    if (change?.messages?.length) {
      const contactProfile = change?.contacts?.[0];
      for (const msg of change.messages) {
        const textBody =
          msg?.text?.body ||
          msg?.button?.text ||
          msg?.interactive?.button_reply?.title ||
          "[Mensaje multimedia]";

        await processInboundMessage({
          workspaceId: workspace.id,
          fromPhone: msg.from.startsWith("+") ? msg.from : `+${msg.from}`,
          contactName: contactProfile?.profile?.name,
          body: textBody,
          channel: "WHATSAPP",
          externalId: msg.id,
          source: "META_CLOUD_API",
        });
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
