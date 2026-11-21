import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processInboundMessage } from "@/lib/whatsapp/engine";

// Meta Messenger & Instagram Webhook Verification (GET)
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

// Meta Messenger & Instagram Inbound Messages (POST)
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const objectType = payload?.object; // "page" for Messenger, "instagram" for Instagram
    const channel = objectType === "instagram" ? "INSTAGRAM" : "MESSENGER";

    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ status: "ignored_no_workspace" }, { status: 200 });
    }

    const entries = payload?.entry || [];
    for (const entry of entries) {
      const messagingEvents = entry?.messaging || [];
      for (const event of messagingEvents) {
        const senderId = event?.sender?.id;
        const textBody = event?.message?.text;
        if (!senderId || !textBody) continue;

        await processInboundMessage({
          workspaceId: workspace.id,
          fromPhone: `${channel.toLowerCase()}_${senderId}`,
          contactName: `${channel === "INSTAGRAM" ? "IG" : "FB"} Usuario ${String(senderId).slice(-4)}`,
          body: textBody,
          channel,
          externalId: event?.message?.mid,
          source: "META_CLOUD_API",
        });
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error("Meta Messenger/IG webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
