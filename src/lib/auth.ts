import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE = "crms_session";

function getSecret() {
  return process.env.AUTH_SECRET || "crms-dev-secret-key-change-in-production";
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derived, "hex"));
}

export function signSessionToken(payload: { userId: string; workspaceId: string }): string {
  const data = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifySessionToken(token: string): { userId: string; workspaceId: string } | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string, workspaceId: string) {
  const token = signSessionToken({ userId, workspaceId });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const parsed = verifySessionToken(token);
  if (!parsed) return null;

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: parsed.workspaceId,
        userId: parsed.userId,
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      workspace: true,
    },
  });

  if (!membership) return null;
  return {
    user: membership.user,
    workspace: membership.workspace,
    role: membership.role,
  };
}

export async function seedWorkspaceDefaults(workspaceId: string, ownerId: string) {
  const existingTemplates = await prisma.template.count({ where: { workspaceId } });
  if (existingTemplates > 0) return;

  const t1 = await prisma.template.create({
    data: {
      workspaceId,
      name: "bienvenida_lead_2026",
      category: "MARKETING",
      language: "es",
      headerText: "¡Hola {{1}}! 👋",
      body: "Gracias por escribirnos. Tenemos un 20% de descuento en tu primer mes usando la API oficial de WhatsApp con 0% de recargo.",
      footerText: "Responde STOP para darte de baja",
      buttonsJson: JSON.stringify([{ type: "QUICK_REPLY", text: "Ver Planes" }, { type: "QUICK_REPLY", text: "Hablar con Asesor" }]),
      status: "APPROVED",
    },
  });

  await prisma.template.create({
    data: {
      workspaceId,
      name: "recordatorio_cita",
      category: "UTILITY",
      language: "es",
      body: "Hola {{1}}, te recordamos tu demo personalizada mañana a las {{2}}. ¿Confirmas tu asistencia?",
      buttonsJson: JSON.stringify([{ type: "QUICK_REPLY", text: "Confirmar" }, { type: "QUICK_REPLY", text: "Reagendar" }]),
      status: "APPROVED",
    },
  });

  await prisma.template.create({
    data: {
      workspaceId,
      name: "codigo_verificacion",
      category: "AUTHENTICATION",
      language: "es",
      body: "Tu código de acceso seguro es {{1}}. Expira en 10 minutos.",
      status: "APPROVED",
    },
  });

  const c1 = await prisma.contact.create({
    data: {
      workspaceId,
      name: "Sofía Mendoza",
      phone: "+525512345678",
      email: "sofia@tiendamx.com",
      segment: "VIP",
      tags: "E-commerce,Interesado",
      customFields: JSON.stringify({ empresa: "TiendaMX", presupuesto: "$99/mes" }),
    },
  });

  const c2 = await prisma.contact.create({
    data: {
      workspaceId,
      name: "Carlos Ruiz",
      phone: "+573001112233",
      email: "carlos@agenciapro.co",
      segment: "Agencias",
      tags: "Agencia,Demo",
      customFields: JSON.stringify({ empresa: "AgenciaPro", clientes: "12" }),
    },
  });

  const c3 = await prisma.contact.create({
    data: {
      workspaceId,
      name: "Elena Torres",
      phone: "+593991234567",
      email: "elena@clinicasalud.ec",
      segment: "Leads",
      tags: "Salud,Citas",
      customFields: JSON.stringify({ empresa: "Clínica Salud", ciudad: "Quito" }),
    },
  });

  const conv1 = await prisma.conversation.create({
    data: {
      workspaceId,
      contactId: c1.id,
      channel: "WHATSAPP",
      status: "OPEN",
      assignedToId: ownerId,
      unreadCount: 1,
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 4),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        direction: "INBOUND",
        type: "TEXT",
        body: "Hola! Vi su anuncio, ¿cuánto cobran por encima de las tarifas de Meta?",
        status: "READ",
        createdAt: new Date(Date.now() - 1000 * 60 * 6),
      },
      {
        conversationId: conv1.id,
        direction: "OUTBOUND",
        type: "TEXT",
        body: "¡Hola Sofía! Cobramos 0% de recargo sobre las tarifas oficiales de Meta. Pagas directo a Meta por tus mensajes y solo el plan mensual de la plataforma.",
        status: "READ",
        isAiGenerated: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        conversationId: conv1.id,
        direction: "INBOUND",
        type: "TEXT",
        body: "Genial, ¿tienen integración con Shopify para carritos abandonados?",
        status: "DELIVERED",
        createdAt: new Date(Date.now() - 1000 * 60 * 4),
      },
    ],
  });

  const conv2 = await prisma.conversation.create({
    data: {
      workspaceId,
      contactId: c2.id,
      channel: "INSTAGRAM",
      status: "PENDING",
      unreadCount: 0,
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 45),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv2.id,
      direction: "INBOUND",
      type: "TEXT",
      body: "Hola, manejamos 12 cuentas de clientes. ¿Tienen plan para agencias?",
      status: "READ",
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
    },
  });

  await prisma.campaign.create({
    data: {
      workspaceId,
      name: "Lanzamiento Q4 — Clientes VIP",
      templateId: t1.id,
      targetSegment: "VIP",
      status: "COMPLETED",
      totalCount: 450,
      sentCount: 450,
      deliveredCount: 441,
      readCount: 382,
      failedCount: 9,
    },
  });

  await prisma.automationFlow.createMany({
    data: [
      {
        workspaceId,
        name: "Flujo de Precios y Planes",
        triggerType: "KEYWORD",
        triggerKeywords: "precio,planes,costo,tarifa,cuanto",
        responseText:
          "Nuestros planes inician desde $12/mes (Básico), $19/mes (Pro IA) y $39/mes (Business) con 0% de recargo en mensajes de Meta. ¿Te gustaría agendar una demo?",
        buttonsJson: JSON.stringify(["Agendar Demo", "Ver Comparativa"]),
        isActive: true,
        executionsCount: 128,
      },
      {
        workspaceId,
        name: "Bienvenida Automática 24/7",
        triggerType: "WELCOME",
        triggerKeywords: "hola,buenas,info,start",
        responseText:
          "¡Hola! 👋 Bienvenido a nuestro canal oficial de WhatsApp. ¿En qué podemos ayudarte hoy?\n1️⃣ Ver Planes\n2️⃣ Soporte Técnico\n3️⃣ Hablar con un Asesor",
        isActive: true,
        executionsCount: 342,
      },
    ],
  });

  await prisma.catalogItem.createMany({
    data: [
      {
        workspaceId,
        sku: "205/55 R16",
        name: "Michelin Primacy 4 (Instalación incluida)",
        tier: "PREMIUM",
        price: 125,
        stock: 8,
      },
      {
        workspaceId,
        sku: "205/55 R16",
        name: "Hankook Kinergy GT",
        tier: "MEDIA",
        price: 89,
        stock: 12,
      },
      {
        workspaceId,
        sku: "195/65 R15",
        name: "Tornel Real (Económica)",
        tier: "ECONOMICA",
        price: 58,
        stock: 16,
      },
    ],
  });

  await prisma.serviceOrder.create({
    data: {
      workspaceId,
      customerName: "Sofía Mendoza",
      customerPhone: "+525512345678",
      description: "4 Llantas 205/55 R16 + Alineación y Balanceo",
      amount: 380,
      nextReminderAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
      reminderSent: false,
    },
  });
}

export async function ensureDemoSession() {
  const email = "demo@chimpflow.io";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Alex Rivera (Demo)",
        email,
        passwordHash: hashPassword("demo1234"),
      },
    });
  }

  let membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
  });

  if (!membership) {
    const workspace = await prisma.workspace.create({
      data: {
        name: "ChimpFlow Demo Agency",
        slug: `demo-${Date.now()}`,
        plan: "PRO",
        sandboxMode: true,
        aiEnabled: true,
      },
    });

    membership = await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "OWNER",
      },
      include: { workspace: true },
    });

    await seedWorkspaceDefaults(workspace.id, user.id);
  }

  return { user, workspace: membership.workspace };
}
