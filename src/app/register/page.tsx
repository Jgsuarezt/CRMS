"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquareText, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, workspaceName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al registrarse");
      } else {
        router.push("/app");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-slate-900">
            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <MessageSquareText className="w-5 h-5" />
            </span>
            <span>ChimpFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 pt-2">Crea tu Workspace SaaS</h1>
          <p className="text-sm text-slate-600">Incluye modo Sandbox, plantillas y Agente IA listos para usar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Tu nombre
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="workspace" className="block text-sm font-medium text-slate-700 mb-1">
              Nombre de tu empresa o agencia
            </label>
            <input
              id="workspace"
              type="text"
              required
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Mi Agencia Digital"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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
              placeholder="juan@miagencia.com"
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 text-white py-3 text-sm font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Crear cuenta gratis</span>
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
