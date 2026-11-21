import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña requeridos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { memberships: true },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const membership = user.memberships[0];
    if (!membership) {
      return NextResponse.json({ error: "Usuario sin workspace asignado" }, { status: 403 });
    }

    await setSessionCookie(user.id, membership.workspaceId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
  }
}
