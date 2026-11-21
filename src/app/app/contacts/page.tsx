"use client";

import { useEffect, useState } from "react";
import { Plus, Search, UserPlus } from "lucide-react";

interface ContactItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  segment: string;
  tags: string;
  optIn: boolean;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [segment, setSegment] = useState("Leads");
  const [tags, setTags] = useState("Nuevo");
  const [saving, setSaving] = useState(false);

  async function loadContacts() {
    const res = await fetch("/api/contacts");
    if (!res.ok) return;
    const data = await res.json();
    setContacts(data.contacts || []);
  }

  useEffect(() => {
    loadContacts();
  }, []);

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, segment, tags }),
      });
      if (res.ok) {
        setName("");
        setPhone("");
        setEmail("");
        await loadContacts();
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = contacts.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.segment.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contactos & Segmentos CRM</h1>
        <p className="text-sm text-slate-600 mt-1">
          Administra tus suscriptores de WhatsApp con opt-in verificado y etiquetas personalizadas.
        </p>
      </div>

      {/* Add Contact Form */}
      <form
        onSubmit={handleAddContact}
        className="bg-white border border-slate-200 rounded-2xl p-5 grid sm:grid-cols-6 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="María López"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono (+código)</label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+525511223344"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="maria@empresa.com"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Segmento</label>
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value="Leads">Leads</option>
            <option value="VIP">VIP</option>
            <option value="Agencias">Agencias</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Etiquetas</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{saving ? "..." : "Agregar"}</span>
        </button>
      </form>

      {/* Contacts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono o segmento..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {filtered.length} contactos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">WhatsApp</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Segmento</th>
                <th className="px-5 py-3">Etiquetas</th>
                <th className="px-5 py-3">Opt-In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{c.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs">{c.phone}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.email || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {c.segment}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">{c.tags}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {c.optIn ? "Activo" : "Baja"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
