import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { topic, city, whatsappPhone } = await req.json();
  if (!topic) {
    return NextResponse.json({ error: "El tema es obligatorio" }, { status: 400 });
  }

  const cleanCity = city?.trim() || "tu ciudad";
  const cleanPhone = (whatsappPhone || session.workspace.displayPhone || "+525500000000").replace(/\D/g, "");

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
                    text: `Escribe un artículo de blog optimizado para SEO local en español sobre "${topic}" en "${cleanCity}". Usa subtítulos H2, consejos prácticos y termina con un llamado a la acción para cotizar por WhatsApp en https://wa.me/${cleanPhone}. Máximo 450 palabras.`,
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
        if (text) return NextResponse.json({ ok: true, article: text, source: "GEMINI" });
      }
    } catch {
      // Fallback below
    }
  }

  const article = `# ${topic} en ${cleanCity}: Guía completa y precios

Si estás buscando **${topic}** en **${cleanCity}**, elegir el servicio adecuado a tiempo no solo mejora la seguridad de tu vehículo, sino que también te ahorra dinero en desgaste prematuro y combustible.

## ¿Cuándo es momento de revisar o cambiar tus llantas?
1. **Desgaste en la banda de rodamiento:** Si la profundidad es menor a 1.6 mm, el agarre en lluvia disminuye drásticamente.
2. **Vibración en el volante:** Suele indicar que necesitas **alineación y balanceo** urgente.
3. **Golpes o chipotes laterales:** Un impacto en baches puede dañar la estructura interna de la llanta.

## Beneficios de cotizar con atención inmediata
- Revisión rápida sin esperas innecesarias.
- Instalación profesional, válvulas nuevas y balanceo computarizado.
- Garantía directa y asesoría según tu modelo de auto.

## Cotiza en 10 segundos por WhatsApp
¿Necesitas precio exacto para la medida de tu vehículo en **${cleanCity}**? Escríbenos ahora y nuestro asistente te atiende al instante:

👉 **Cotizar por WhatsApp:** https://wa.me/${cleanPhone}`;

  return NextResponse.json({ ok: true, article, source: "TEMPLATE_SEO" });
}
