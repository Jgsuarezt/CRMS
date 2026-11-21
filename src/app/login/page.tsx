"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquareText, Loader2 } from "lucide-react";
import { DemoLoginButton } from "@/components/DemoLoginButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
      } else {
        router.push("/app");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-slate-900">
            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <MessageSquareText className="w-5 h-5" />
            </span>
            <span>ChimpFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 pt-2">Inicia sesión en tu CRM</h1>
          <p className="text-sm text-slate-600">Accede a tu Inbox compartido, campañas y flujos IA.</p>
        </div>

        <DemoLoginButton
          label="Entrar con 1 clic al Workspace Demo"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm font-semibold hover:bg-emerald-100 transition cursor-pointer"
        />

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-slate-200" />
          <span className="mx-3 text-xs text-slate-400 uppercase">o con tu cuenta</span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Iniciar sesión</span>
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-emerald-700 hover:underline">
            Crea tu Workspace gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
