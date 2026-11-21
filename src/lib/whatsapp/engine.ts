import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "./client";

async function generateAiReply(
  systemPrompt: string,
  knowledgeBase: string,
  userMessage: string,
  contactName: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `${systemPrompt}\n\nBase de conocimiento del negocio:\n${knowledgeBase}\n\nCliente: ${contactName}. Responde en máximo 3 líneas, claro y cordial.`,
            },
            { role: "user", content: userMessage },
          ],
          temperature: 0.4,
          max_tokens: 220,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch {
      // Fallback to local knowledge-base matcher below
    }
  }

  // Deterministic local AI Agent fallback using workspace Knowledge Base
  const lower = userMessage.toLowerCase();
  const kbLines = knowledgeBase
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lower.includes("shopify") || lower.includes("woocommerce") || lower.includes("integracion")) {
    return `¡Hola ${contactName}! Sí, contamos con integración nativa para Shopify, WooCommerce, Google Sheets, Zapier, Make y Webhooks para recuperar carritos abandonados automáticamente.`;
  }
  if (lower.includes("horario") || lower.includes("hora") || lower.includes("abierto")) {
    const match = kbLines.find((l) => l.toLowerCase().includes("horario"));
    return match || `Nuestro equipo atiende de Lunes a Viernes de 9:00 a 18:00, y nuestro Agente IA está disponible 24/7.`;
  }
  if (lower.includes("precio") || lower.includes("plan") || lower.includes("costo") || lower.includes("meta")) {
    const match = kbLines.find((l) => l.toLowerCase().includes("plan") || l.toLowerCase().includes("0%"));
    return (
      match ||
      `Nuestros planes inician en $12/mes (Básico) y $19/mes (Pro IA) con 0% de recargo sobre las tarifas oficiales de Meta. Pagas directo a Meta por tus mensajes.`
    );
  }
  if (lower.includes("cita") || lower.includes("demo") || lower.includes("agendar")) {
    return `¡Con gusto ${contactName}! Podemos agendar una demo personalizada. ¿Prefieres mañana a las 10:00 AM o 4:00 PM?`;
  }

  return `¡Gracias por tu mensaje, ${contactName}! He registrado tu consulta. ${kbLines[0] ? `Info útil: ${kbLines[0]}. ` : ""}Un asesor o nuestro agente te atenderá enseguida.`;
}

export async function processInboundMessage(params: {
  workspaceId: string;
  fromPhone: string;
  contactName?: string;
  body: string;
  channel?: "WHATSAPP" | "INSTAGRAM" | "MESSENGER";
  externalId?: string;
  source?: "SANDBOX" | "META_CLOUD_API";
}) {
  const { workspaceId, fromPhone, body, channel = "WHATSAPP", source = "SANDBOX" } = params;
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) throw new Error("Workspace not found");

  // 1. Upsert Contact
  let contact = await prisma.contact.findUnique({
    where: { workspaceId_phone: { workspaceId, phone: fromPhone } },
  });

  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        workspaceId,
        phone: fromPhone,
        name: params.contactName || `Cliente ${fromPhone.slice(-4)}`,
        segment: "Leads",
        tags: "Nuevo",
      },
    });
  }

  // 2. Find or create open Conversation
  let conversation = await prisma.conversation.findFirst({
    where: { workspaceId, contactId: contact.id, channel },
    orderBy: { lastMessageAt: "desc" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        workspaceId,
        contactId: contact.id,
        channel,
        status: "OPEN",
        unreadCount: 1,
        lastMessageAt: new Date(),
      },
    });
  } else {
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        status: "OPEN",
        unreadCount: { increment: 1 },
        lastMessageAt: new Date(),
      },
    });
  }

  // 3. Save Inbound Message
  const inboundMsg = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "INBOUND",
      type: "TEXT",
      body,
      externalId: params.externalId || `wamid.in_${Date.now()}`,
      status: "DELIVERED",
    },
  });

  await prisma.webhookLog.create({
    data: {
      workspaceId,
      source,
      eventType: "INBOUND_MESSAGE",
      payloadJson: JSON.stringify({ from: fromPhone, body, channel }),
      status: "PROCESSED",
    },
  });

  // 4. Evaluate Automation Flows
  const flows = await prisma.automationFlow.findMany({
    where: { workspaceId, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const lowerBody = body.toLowerCase();
  let autoReplyText: string | null = null;
  let matchedFlowId: string | null = null;

  for (const flow of flows) {
    const keywords = flow.triggerKeywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    if (keywords.some((kw) => lowerBody.includes(kw))) {
      autoReplyText = flow.responseText;
      matchedFlowId = flow.id;
      break;
    }
  }

  if (matchedFlowId) {
    await prisma.automationFlow.update({
      where: { id: matchedFlowId },
      data: { executionsCount: { increment: 1 } },
    });
  } else if (workspace.aiEnabled) {
    // 5. Fallback to AI Agent if enabled
    autoReplyText = await generateAiReply(
      workspace.aiSystemPrompt,
      workspace.aiKnowledgeBase,
      body,
      contact.name
    );
  }

  let autoReplyMsg = null;
  if (autoReplyText) {
    const sendResult = await sendWhatsAppMessage({
      workspaceId,
      to: contact.phone,
      type: "TEXT",
      body: autoReplyText,
    });

    autoReplyMsg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        type: "TEXT",
        body: autoReplyText,
        externalId: sendResult.externalId,
        status: sendResult.success ? "DELIVERED" : "FAILED",
        isAiGenerated: !matchedFlowId,
      },
    });
  }

  return { contact, conversation, inboundMsg, autoReplyMsg };
}
