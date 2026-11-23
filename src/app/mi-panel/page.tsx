"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, LayoutDashboard, AlertCircle } from "lucide-react";

interface SavedPanelEntry {
  panelToken: string;
  eventTitle: string;
  orderCode: string;
  slug: string;
}

export default function MiPanelPage() {
  const router = useRouter();
  const [savedPanels, setSavedPanels] = useState<SavedPanelEntry[]>([]);
  const [orderCode, setOrderCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("invita_saved_panels");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSavedPanels(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/recover-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.panelToken) {
        setErrorMsg(data.error || "No pudimos encontrar tu panel.");
        return;
      }
      router.push(`/panel/${data.panelToken}`);
    } catch {
      setErrorMsg("Error de conexión. Probá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] px-4 py-10 text-stone-900 sm:px-6">
      <div className="mx-auto max-w-lg space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Invita con Alma
        </Link>

        <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Acceso Organizadores
          </div>
          <h1 className="mt-3 font-cormorant text-3xl font-bold text-stone-900">
            Entrá a tu Panel de Organizador
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">
            Desde tu panel ves confirmaciones en tiempo real, alergias, música del DJ, editás tu invitación y descargás el Excel.
          </p>

          {savedPanels.length > 0 && (
            <div className="mt-5 space-y-2.5 border-t border-stone-200 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Tus paneles abiertos recientemente en este dispositivo
              </p>
              {savedPanels.map((p) => (
                <Link
                  key={p.panelToken}
                  href={`/panel/${p.panelToken}`}
                  className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-900 transition-colors hover:border-stone-900 hover:bg-white"
                >
                  <div>
                    <span className="block">{p.eventTitle}</span>
                    <span className="font-mono text-[11px] font-normal text-stone-500">
                      {p.orderCode}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-500" />
                </Link>
              ))}
            </div>
          )}

          <form
            onSubmit={handleRecover}
            className="mt-6 space-y-3.5 border-t border-stone-200 pt-5"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
              <KeyRound className="h-3.5 w-3.5 text-amber-700" />
              Entrar con tu Código de Pedido y Email
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-700">
                Código de Pedido *
              </label>
              <input
                type="text"
                required
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="Ej. INV-1008"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm uppercase outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-700">
                Email con el que hiciste el pedido *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
              />
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-xs font-bold text-white hover:bg-stone-800 disabled:opacity-60"
            >
              {loading ? "Buscando tu panel..." : "Ingresar a mi Panel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
