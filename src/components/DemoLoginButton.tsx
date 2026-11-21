"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function DemoLoginButton({
  label = "Probar Demo en Vivo",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDemo() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (res.ok) {
        router.push("/app");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDemo}
      disabled={loading}
      className={
        className ||
        "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer disabled:opacity-60"
      }
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      <span>{label}</span>
      {!loading ? <ArrowRight className="w-4 h-4" /> : null}
    </button>
  );
}
