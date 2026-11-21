import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "./client";

async function generateAiReply(
  systemPrompt: string,
  knowledgeBase: string,
  userMessage: string,
  contactName: string
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim().length > 10) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${systemPrompt}\n\nBase de conocimiento del negocio:\n${knowledgeBase}\n\nCliente: ${contactName}.\nMensaje: ${userMessage}\n\nResponde en máximo 3 líneas, claro y cordial.`,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch {
      // Fallback below
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.trim().length > 10) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
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
      // Fallback below
    }
  }

  // Deterministic local AI Agent fallback using workspace Knowledge Base
  const lower = userMessage.toLowerCase();
  const kbLines = knowledgeBase
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lower.includes("[audio") || lower.includes("nota de voz")) {
    return `¡Hola ${contactName}! Recibí tu nota de voz. Con gusto te cotizamos al instante; ¿me confirmas la medida o modelo que buscas?`;
  }
  if (lower.includes("[foto") || lower.includes("[imagen")) {
    return `¡Gracias por la foto, ${contactName}! Ya revisé la imagen. Enseguida te confirmamos disponibilidad, precio con instalación y horario para atenderte.`;
  }
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
      `Nuestros planes inician en $12/mes (Básico), $24/mes (Pro IA) y $39/mes (Business Omnicanal) con 0% de recargo sobre las tarifas oficiales de Meta.`
    );
  }
  if (lower.includes("cita") || lower.includes("demo") || lower.includes("agendar")) {
    return `¡Con gusto ${contactName}! Podemos agendar tu cita. ¿Prefieres mañana a las 10:00 AM o 4:00 PM?`;
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
      eventType: `INBOUND_${channel}`,
      payloadJson: JSON.stringify({ from: fromPhone, body, channel }),
      status: "PROCESSED",
    },
  });

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
    const inStockItems = await prisma.catalogItem.findMany({
      where: { workspaceId, stock: { gt: 0 } },
      take: 15,
    });
    const inventoryText =
      inStockItems.length > 0
        ? `\n\nInventario en stock disponible:\n${inStockItems
            .map((i) => `- ${i.sku} | ${i.name} (${i.tier}): $${i.price} USD (Stock: ${i.stock})`)
            .join("\n")}`
        : "";

    autoReplyText = await generateAiReply(
      workspace.aiSystemPrompt,
      `${workspace.aiKnowledgeBase}${inventoryText}`,
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
