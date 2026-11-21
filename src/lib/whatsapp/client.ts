import { prisma } from "@/lib/prisma";

export interface SendWhatsAppParams {
  workspaceId: string;
  to: string;
  type: "TEXT" | "TEMPLATE";
  body: string;
  templateName?: string;
  languageCode?: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  externalId: string;
  mode: "SANDBOX" | "META_CLOUD_API";
  error?: string;
}

export async function sendWhatsAppMessage(params: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: params.workspaceId },
  });

  if (!workspace) {
    return { success: false, externalId: "", mode: "SANDBOX", error: "Workspace not found" };
  }

  const useSandbox = workspace.sandboxMode || !workspace.phoneNumberId || !workspace.accessToken;

  if (useSandbox) {
    const externalId = `wamid.sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await prisma.webhookLog.create({
      data: {
        workspaceId: workspace.id,
        source: "SANDBOX",
        eventType: "OUTBOUND_MESSAGE",
        payloadJson: JSON.stringify({
          messaging_product: "whatsapp",
          to: params.to,
          type: params.type.toLowerCase(),
          body: params.body,
          templateName: params.templateName,
          externalId,
        }),
        status: "DELIVERED",
      },
    });
    return { success: true, externalId, mode: "SANDBOX" };
  }

  // Real Meta WhatsApp Business Cloud API v21.0
  const url = `https://graph.facebook.com/v21.0/${workspace.phoneNumberId}/messages`;
  const payload =
    params.type === "TEMPLATE" && params.templateName
      ? {
          messaging_product: "whatsapp",
          to: params.to.replace(/\D/g, ""),
          type: "template",
          template: {
            name: params.templateName,
            language: { code: params.languageCode || "es" },
          },
        }
      : {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: params.to.replace(/\D/g, ""),
          type: "text",
          text: { preview_url: false, body: params.body },
        };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${workspace.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    await prisma.webhookLog.create({
      data: {
        workspaceId: workspace.id,
        source: "META_CLOUD_API",
        eventType: "OUTBOUND_MESSAGE",
        payloadJson: JSON.stringify({ request: payload, response: data }),
        status: res.ok ? "SENT" : "FAILED",
      },
    });

    if (!res.ok) {
      return {
        success: false,
        externalId: "",
        mode: "META_CLOUD_API",
        error: data?.error?.message || "Meta API Error",
      };
    }

    const externalId = data?.messages?.[0]?.id || `wamid.meta_${Date.now()}`;
    return { success: true, externalId, mode: "META_CLOUD_API" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error calling Meta Cloud API";
    return { success: false, externalId: "", mode: "META_CLOUD_API", error: message };
  }
}
