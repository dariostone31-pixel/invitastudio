"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  Save,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import type { EventRecord, OrderStatus } from "@/lib/db";
import { INVITATION_SKINS } from "@/templates/catalog";

interface AdminEventRow extends EventRecord {
  rsvpCount: number;
}

const STATUS_BADGES: Record<OrderStatus, { label: string; cls: string }> = {
  pendiente: { label: "Pendiente", cls: "bg-amber-100 text-amber-800" },
  en_edicion: { label: "En Edición", cls: "bg-sky-100 text-sky-800" },
  publicada: { label: "Publicada", cls: "bg-emerald-100 text-emerald-800" },
};

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [orders, setOrders] = useState<AdminEventRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EventRecord>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadOrders = async (pass: string) => {
    setAuthError(null);
    const res = await fetch("/api/orders", {
      headers: { "x-admin-pass": pass },
    });
    if (!res.ok) {
      setAuthError("Clave incorrecta. Para probar en demo usá: INVITA2026");
      return;
    }
    const data = await res.json();
    setOrders(data.events || []);
    setUnlocked(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders(passcode);
  };

  const startEdit = (row: AdminEventRow) => {
    setEditingId(row.id);
    setEditForm({
      status: row.status,
      skinId: row.skinId,
      eventTitle: row.eventTitle,
      dateDisplay: row.dateDisplay,
      timeDisplay: row.timeDisplay,
      venue: row.venue,
      address: row.address,
      alias: row.alias,
      dressCode: row.dressCode,
    });
  };

  const saveEdit = async (id: string) => {
    setSavingId(id);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pass": passcode,
      },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingId(null);
      await loadOrders(passcode);
    }
    setSavingId(null);
  };

  const quickStatus = async (id: string, status: OrderStatus) => {
    setSavingId(id);
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pass": passcode,
      },
      body: JSON.stringify({ status }),
    });
    await loadOrders(passcode);
    setSavingId(null);
  };

  const copyDeliveryMessage = async (row: AdminEventRow) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const msg =
      `¡Hola ${row.contactName}! Tu invitación "${row.eventTitle}" (${row.orderCode}) ya está lista:\n\n` +
      `🔗 Link para compartir con tus invitados:\n${origin}/i/${row.slug}\n\n` +
      `📊 Tu Panel Privado de Organizador (para ver confirmados, descargar Excel y crear pases personalizados):\n${origin}/panel/${row.panelToken}`;
    try {
      await navigator.clipboard.writeText(msg);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch {
      // ignore
    }
  };

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
        <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-amber-300">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-center font-cormorant text-3xl font-semibold text-stone-900">
            Centro de Producción &lt;24 hs
          </h1>
          <p className="mt-1.5 text-center text-xs text-stone-500">
            Ingresá la clave de estudio para gestionar pedidos, editar invitaciones y publicar enlaces.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-700">
                Clave de Acceso
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Clave del estudio..."
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
              />
              <p className="mt-1.5 text-[11px] text-stone-400">
                Clave de prueba local: <code className="font-mono font-bold text-stone-600">INVITA2026</code>
              </p>
            </div>

            {authError && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-stone-900 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-stone-800"
            >
              Entrar al Estudio
            </button>
          </form>

          <Link
            href="/"
            className="mt-5 block text-center text-xs font-semibold text-stone-500 hover:text-stone-900"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Inicio
            </Link>
            <h1 className="mt-1 flex items-center gap-2 font-cormorant text-3xl font-bold">
              <Sparkles className="h-5 w-5 text-amber-700" />
              Admin InvitaStudio · Entregas &lt;24 hs
            </h1>
          </div>
          <span className="rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white">
            {orders.length} evento(s)
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6">
        {orders.map((row) => {
          const badge = STATUS_BADGES[row.status];
          const isEditing = editingId === row.id;
          const cleanPhone = row.whatsapp.replace(/[^0-9]/g, "");

          return (
            <article
              key={row.id}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-500">
                      {row.orderCode}
                    </span>
                    <h2 className="text-xl font-bold text-stone-900">{row.eventTitle}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        row.paymentStatus === "pagado"
                          ? "bg-emerald-100 text-emerald-800"
                          : row.paymentStatus === "rechazado"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {row.paymentStatus === "pagado"
                        ? `Pagado${row.paymentMethod === "mercadopago" ? " (MP)" : " (Transf.)"}`
                        : row.paymentStatus === "rechazado"
                        ? "Pago rechazado"
                        : "Pago pendiente"}
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-700">
                      Plan {row.planId.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    Cliente: <strong>{row.contactName}</strong> · Tel: {row.whatsapp} · Email: {row.email}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {row.dateDisplay} ({row.timeDisplay}) · {row.venue} · Confirmaciones: <strong>{row.rsvpCount}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/i/${row.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold hover:bg-stone-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Invitación
                  </Link>
                  <Link
                    href={`/panel/${row.panelToken}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold hover:bg-stone-50"
                  >
                    Panel Organizador
                  </Link>
                  <button
                    type="button"
                    onClick={() => copyDeliveryMessage(row)}
                    className="inline-flex items-center gap-1 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800"
                  >
                    {copiedId === row.id ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedId === row.id ? "Copiado" : "Copiar Entrega"}
                  </button>
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Acciones rápidas de estado */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-stone-500">Estado rápido:</span>
                  <button
                    type="button"
                    disabled={savingId === row.id}
                    onClick={() => quickStatus(row.id, "en_edicion")}
                    className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-800 hover:bg-sky-100"
                  >
                    <Clock className="h-3 w-3" />
                    En Edición
                  </button>
                  <button
                    type="button"
                    disabled={savingId === row.id}
                    onClick={() => quickStatus(row.id, "publicada")}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Marcar Publicada
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => (isEditing ? setEditingId(null) : startEdit(row))}
                  className="text-xs font-semibold text-amber-700 hover:underline"
                >
                  {isEditing ? "Cancelar edición" : "Editar datos / diseño"}
                </button>
              </div>

              {/* Editor inline */}
              {isEditing && (
                <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-stone-600">
                      Título
                    </label>
                    <input
                      type="text"
                      value={editForm.eventTitle || ""}
                      onChange={(e) => setEditForm({ ...editForm, eventTitle: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-stone-600">
                      Diseño (Skin)
                    </label>
                    <select
                      value={editForm.skinId || ""}
                      onChange={(e) => setEditForm({ ...editForm, skinId: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs"
                    >
                      {INVITATION_SKINS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-stone-600">
                      Horario
                    </label>
                    <input
                      type="text"
                      value={editForm.timeDisplay || ""}
                      onChange={(e) => setEditForm({ ...editForm, timeDisplay: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-stone-600">
                      Salón / Lugar
                    </label>
                    <input
                      type="text"
                      value={editForm.venue || ""}
                      onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-stone-600">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={editForm.address || ""}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-stone-600">
                      Alias Regalos
                    </label>
                    <input
                      type="text"
                      value={editForm.alias || ""}
                      onChange={(e) => setEditForm({ ...editForm, alias: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="button"
                      disabled={savingId === row.id}
                      onClick={() => saveEdit(row.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-800"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {savingId === row.id ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </main>
    </div>
  );
}
