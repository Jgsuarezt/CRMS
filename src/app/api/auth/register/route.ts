import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, seedWorkspaceDefaults, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, workspaceName } = await req.json();
    if (!name || !email || !password || !workspaceName) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese correo" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
      },
    });

    const slugBase = workspaceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName.trim(),
        slug: `${slugBase || "ws"}-${Date.now().toString(36)}`,
        plan: "STARTER",
        sandboxMode: true,
        aiEnabled: true,
      },
    });

    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    await seedWorkspaceDefaults(workspace.id, user.id);
    await setSessionCookie(user.id, workspace.id);

    return NextResponse.json({ ok: true, workspaceId: workspace.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 });
  }
}
