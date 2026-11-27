"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Music,
  Upload,
  Download,
  TrendingUp,
  Users,
  Wallet,
  RefreshCw,
  LogOut,
  Trash2,
  ShieldAlert,
  Ban,
} from "lucide-react";
import { EditorialDiamondIcon } from "@/components/BrandOrnaments";
import type {
  EventRecord,
  FunnelEventRecord,
  LeadRecord,
  LeadStage,
  OrderStatus,
  PaymentStatus,
} from "@/lib/db";
import { PRICING_PLANS } from "@/config/business";
import { INVITATION_SKINS } from "@/templates/catalog";

interface AdminEventRow extends EventRecord {
  rsvpCount: number;
}

const STATUS_BADGES: Record<OrderStatus, { label: string; cls: string }> = {
  pendiente: { label: "Pendiente", cls: "bg-amber-100 text-amber-800" },
  en_edicion: { label: "En Edición", cls: "bg-sky-100 text-sky-800" },
  publicada: { label: "Publicada", cls: "bg-emerald-100 text-emerald-800" },
};

const ALL_LEAD_STAGES: LeadStage[] = [
  "prueba_iniciada",
  "prueba_capturada",
  "encargar_borrador",
  "pedido_creado",
  "entregado",
  "testimonio_pedido",
  "testimonio_recibido",
  "recompra_ofrecida",
];

const LEAD_STAGE_META: Record<LeadStage, { label: string; cls: string }> = {
  prueba_iniciada: { label: "Inició prueba", cls: "bg-stone-100 text-stone-700" },
  prueba_capturada: { label: "Hizo prueba gratis", cls: "bg-amber-100 text-amber-900" },
  encargar_borrador: { label: "Dejó carrito / borrador", cls: "bg-rose-100 text-rose-900" },
  pedido_creado: { label: "Creó pedido", cls: "bg-emerald-100 text-emerald-800" },
  entregado: { label: "Entregado", cls: "bg-teal-100 text-teal-900" },
  testimonio_pedido: { label: "Testimonio pedido", cls: "bg-indigo-100 text-indigo-900" },
  testimonio_recibido: { label: "Testimonio recibido", cls: "bg-purple-100 text-purple-900" },
  recompra_ofrecida: { label: "Recompra ofrecida", cls: "bg-sky-100 text-sky-900" },
};

function formatArs(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-AR")}`;
}

function isOrderVerifiedPaid(ev: EventRecord): boolean {
  if (ev.paymentStatus !== "pagado") return false;
  if (ev.paymentMethod === "mercadopago") {
    return Boolean(ev.mpPaymentId || (ev.verifiedBy && ev.verifiedAt));
  }
  return Boolean(ev.verifiedBy && ev.verifiedAt);
}

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [orders, setOrders] = useState<AdminEventRow[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [funnelEvents, setFunnelEvents] = useState<FunnelEventRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "leads">("orders");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "pending">("all");
  const [utmFilter, setUtmFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [loadingData, setLoadingData] = useState(false);
  const [exportingXlsx, setExportingXlsx] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EventRecord>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingAudioId, setUploadingAudioId] = useState<string | null>(null);
  const [audioUploadMsg, setAudioUploadMsg] = useState<string | null>(null);
  const [inlineAudioMap, setInlineAudioMap] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadDashboard = async () => {
    setAuthError(null);
    setLoadingData(true);
    try {
      const [ordersRes, leadsRes, funnelRes] = await Promise.all([
        fetch("/api/orders", { credentials: "same-origin" }),
        fetch("/api/leads", { credentials: "same-origin" }),
        fetch("/api/funnel-events", { credentials: "same-origin" }),
      ]);

      if (ordersRes.status === 401) {
        setUnlocked(false);
        return;
      }

      if (!ordersRes.ok) {
        const errData = await ordersRes.json().catch(() => ({}));
        setAuthError(errData.error || "No pudimos cargar los datos del estudio.");
        return;
      }

      const ordersData = await ordersRes.json();
      const list: AdminEventRow[] = ordersData.events || [];
      setOrders(list);
      setInlineAudioMap(
        Object.fromEntries(list.map((ev) => [ev.id, ev.audioOverride || ""]))
      );

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json().catch(() => ({}));
        setLeads(Array.isArray(leadsData.leads) ? leadsData.leads : []);
      }
      if (funnelRes.ok) {
        const fData = await funnelRes.json().catch(() => ({}));
        setFunnelEvents(Array.isArray(fData.events) ? fData.events : []);
      }
      setUnlocked(true);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetch("/api/admin/session", { credentials: "same-origin" })
      .then((r) => {
        if (r.ok) {
          return loadDashboard();
        }
        return undefined;
      })
      .finally(() => setCheckingSession(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoadingData(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.error || "Clave incorrecta.");
        return;
      }
      setPasscode("");
      await loadDashboard();
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    setUnlocked(false);
    setOrders([]);
    setLeads([]);
  };

  const handleDownloadXlsx = async () => {
    setExportingXlsx(true);
    try {
      const res = await fetch("/api/admin/export", { credentials: "same-origin" });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `metricas-invita-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExportingXlsx(false);
    }
  };

  const uniqueUtmSources = useMemo(() => {
    const s = new Set<string>();
    leads.forEach((l) => {
      if (l.utmSource) s.add(l.utmSource);
    });
    orders.forEach((o) => {
      if (o.utmSource) s.add(o.utmSource);
    });
    return Array.from(s).sort();
  }, [leads, orders]);

  const metrics = useMemo(() => {
    const verifiedPaidOrders = orders.filter(isOrderVerifiedPaid);
    const pendingOrders = orders.filter((o) => !isOrderVerifiedPaid(o));
    const mpPaidCount = verifiedPaidOrders.filter(
      (o) => o.paymentMethod === "mercadopago"
    ).length;
    const transferPaidCount = verifiedPaidOrders.length - mpPaidCount;

    const getOrderPrice = (ev: AdminEventRow) => {
      const plan = PRICING_PLANS.find((p) => p.id === ev.planId);
      return ev.paidAmount || plan?.transferPriceNum || 0;
    };

    const paidRevenue = verifiedPaidOrders.reduce((sum, ev) => sum + getOrderPrice(ev), 0);
    const pendingRevenue = pendingOrders.reduce((sum, ev) => sum + getOrderPrice(ev), 0);
    const unconvertedLeads = leads.filter(
      (l) =>
        l.stage === "prueba_iniciada" ||
        l.stage === "prueba_capturada" ||
        l.stage === "encargar_borrador"
    );
    const abandonedCheckoutLeads = leads.filter((l) => l.stage === "encargar_borrador");
    const trialOnlyLeads = leads.filter((l) => l.stage === "prueba_capturada");

    const payRate =
      orders.length > 0 ? Math.round((verifiedPaidOrders.length / orders.length) * 100) : 0;

    const stageCounts = Object.fromEntries(
      ALL_LEAD_STAGES.map((st) => [st, leads.filter((l) => l.stage === st).length])
    ) as Record<LeadStage, number>;

    const testerStepCounts = {
      step_1: funnelEvents.filter((f) => f.step === "step_1").length,
      step_2: funnelEvents.filter((f) => f.step === "step_2").length,
      step_3: funnelEvents.filter((f) => f.step === "step_3").length,
      step_4: funnelEvents.filter((f) => f.step === "step_4").length,
      generated: funnelEvents.filter((f) => f.step === "generated").length,
    };

    return {
      verifiedPaidOrders,
      pendingOrders,
      mpPaidCount,
      transferPaidCount,
      paidRevenue,
      pendingRevenue,
      unconvertedLeads,
      abandonedCheckoutLeads,
      trialOnlyLeads,
      payRate,
      stageCounts,
      testerStepCounts,
    };
  }, [orders, leads, funnelEvents]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (paymentFilter === "paid" && !isOrderVerifiedPaid(o)) return false;
      if (paymentFilter === "pending" && isOrderVerifiedPaid(o)) return false;
      if (utmFilter !== "all" && (o.utmSource || "(directo)") !== utmFilter) return false;
      return true;
    });
  }, [orders, paymentFilter, utmFilter]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (stageFilter !== "all" && l.stage !== stageFilter) return false;
      if (utmFilter !== "all" && (l.utmSource || "(directo)") !== utmFilter) return false;
      return true;
    });
  }, [leads, stageFilter, utmFilter]);

  const startEdit = (row: AdminEventRow) => {
    setEditingId(row.id);
    setAudioUploadMsg(null);
    setEditForm({
      status: row.status,
      paymentStatus: row.paymentStatus || "pendiente",
      skinId: row.skinId,
      eventTitle: row.eventTitle,
      dateDisplay: row.dateDisplay,
      timeDisplay: row.timeDisplay,
      venue: row.venue,
      address: row.address,
      alias: row.alias,
      dressCode: row.dressCode,
      audioOverride: row.audioOverride || "",
    });
  };

  const handleUploadAudioForOrder = async (
    orderId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudioId(orderId);
    setAudioUploadMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-audio", {
        method: "POST",
        credentials: "same-origin",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudo subir el audio.");
      }
      if (data.url) {
        setEditForm((prev) => ({ ...prev, audioOverride: data.url }));
        setAudioUploadMsg("Audio subido. Hacé clic en Guardar Cambios para activarlo.");
      }
    } catch (err) {
      setAudioUploadMsg(err instanceof Error ? err.message : "Error subiendo audio.");
    } finally {
      setUploadingAudioId(null);
      e.target.value = "";
    }
  };

  const saveEdit = async (id: string) => {
    setSavingId(id);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingId(null);
      await loadDashboard();
    }
    setSavingId(null);
  };

  const quickStatus = async (id: string, status: OrderStatus) => {
    setSavingId(id);
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadDashboard();
    setSavingId(null);
  };

  const activateOrderWithAudio = async (row: AdminEventRow) => {
    setSavingId(row.id);
    const customAudio = (inlineAudioMap[row.id] ?? row.audioOverride ?? "").trim();
    await fetch(`/api/orders/${row.id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "publicada",
        paymentStatus: "pagado",
        paymentMethod: row.paymentMethod || "transferencia",
        ...(customAudio ? { audioOverride: customAudio } : {}),
      }),
    });
    await loadDashboard();
    setSavingId(null);
  };

  const saveInlineAudio = async (rowId: string) => {
    setSavingId(rowId);
    const customAudio = (inlineAudioMap[rowId] ?? "").trim();
    await fetch(`/api/orders/${rowId}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioOverride: customAudio }),
    });
    await loadDashboard();
    setSavingId(null);
  };

  const handleLeadStageChange = async (leadId: string, nextStage: LeadStage) => {
    setSavingId(leadId);
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage }),
    });
    await loadDashboard();
    setSavingId(null);
  };

  const handleLeadOptOut = async (leadId: string) => {
    setSavingId(leadId);
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optOut: true }),
    });
    await loadDashboard();
    setSavingId(null);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm("¿Eliminar definitivamente los datos personales de este lead?")) {
      return;
    }
    setSavingId(leadId);
    await fetch(`/api/leads/${leadId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    await loadDashboard();
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

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 text-xs text-stone-500">
        Verificando sesión de estudio...
      </div>
    );
  }

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
            Ingresá la clave de estudio para acceder al panel seguro por sesión.
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
                Sesión cifrada de 12 horas mediante cookie httpOnly. Máximo 5 intentos cada 15 minutos.
              </p>
            </div>

            {authError && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={loadingData}
              className="w-full rounded-full bg-stone-900 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-stone-800 disabled:opacity-60"
            >
              {loadingData ? "Validando..." : "Entrar al Estudio"}
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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Inicio
            </Link>
            <h1 className="mt-1 flex items-center gap-2 font-cormorant text-3xl font-bold">
              <EditorialDiamondIcon className="h-5 w-5 text-amber-700" />
              Admin Invita con el Alma · Métricas &amp; Pedidos
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loadingData}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={handleDownloadXlsx}
              disabled={exportingXlsx}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              {exportingXlsx ? "Generando Excel..." : "Descargar Planilla (.xlsx)"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {/* Resumen Ejecutivo / KPIs (solo pagos verificados) */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>Ingresos Verificados</span>
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 font-cormorant text-4xl font-bold text-stone-900">
              {formatArs(metrics.paidRevenue)}
            </p>
            <p className="mt-1 text-[11px] text-stone-500">
              {metrics.verifiedPaidOrders.length} verificado(s) · {metrics.transferPaidCount} Transf. /{" "}
              {metrics.mpPaidCount} MP
            </p>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
              <span>Por Verificar / Cobrar</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 font-cormorant text-4xl font-bold text-stone-900">
              {formatArs(metrics.pendingRevenue)}
            </p>
            <p className="mt-1 text-[11px] text-stone-500">
              {metrics.pendingOrders.length} pedido(s) sin verificación de pago
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span>Embudo / Conversión</span>
              <TrendingUp className="h-4 w-4 text-amber-700" />
            </div>
            <p className="mt-2 font-cormorant text-4xl font-bold text-stone-900">
              {metrics.payRate}%{" "}
              <span className="font-sans text-xs font-medium text-stone-500">verif.</span>
            </p>
            <p className="mt-1 text-[11px] text-stone-500">
              {leads.length} leads → {orders.length} pedidos → {metrics.verifiedPaidOrders.length} pagos
            </p>
          </div>

          <div className="rounded-3xl border border-rose-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
              <span>Oportunidades / Abandonos</span>
              <Users className="h-4 w-4 text-rose-600" />
            </div>
            <p className="mt-2 font-cormorant text-4xl font-bold text-stone-900">
              {metrics.unconvertedLeads.length}
            </p>
            <p className="mt-1 text-[11px] text-stone-500">
              {metrics.abandonedCheckoutLeads.length} en carrito · {metrics.trialOnlyLeads.length} en prueba gratis
            </p>
          </div>
        </section>

        {/* Embudo de Etapas + MiniTester Steps */}
        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-stone-600">
              Embudo completo de ciclo de vida &amp; pasos del MiniTester
            </h2>
            <span className="text-[11px] text-stone-500">
              MiniTester: paso1={metrics.testerStepCounts.step_1} · paso2={metrics.testerStepCounts.step_2} · paso3={metrics.testerStepCounts.step_3} · paso4={metrics.testerStepCounts.step_4} · generadas={metrics.testerStepCounts.generated}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {ALL_LEAD_STAGES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setActiveTab("leads");
                  setStageFilter((prev) => (prev === st ? "all" : st));
                }}
                className={`rounded-2xl border p-2.5 text-left transition-colors ${
                  stageFilter === st && activeTab === "leads"
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-stone-50/70 hover:bg-stone-100"
                }`}
              >
                <p className="font-cormorant text-2xl font-bold">{metrics.stageCounts[st]}</p>
                <p className="mt-0.5 text-[10px] font-semibold leading-tight">
                  {LEAD_STAGE_META[st].label}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Tabs Pedidos vs Leads + Filtros UTM */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "orders"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Pedidos y Pagos ({filteredOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("leads")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "leads"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Leads, Embudo y Posventa ({filteredLeads.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={utmFilter}
              onChange={(e) => setUtmFilter(e.target.value)}
              aria-label="Filtrar por utm_source"
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-700"
            >
              <option value="all">UTM: Todos</option>
              <option value="(directo)">UTM: Directo (sin UTM)</option>
              {uniqueUtmSources.map((u) => (
                <option key={u} value={u}>
                  utm_source: {u}
                </option>
              ))}
            </select>

            {activeTab === "orders" ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: "all", label: `Todos (${orders.length})` },
                    { id: "paid", label: `Verificados (${metrics.verifiedPaidOrders.length})` },
                    { id: "pending", label: `Por verificar (${metrics.pendingOrders.length})` },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPaymentFilter(f.id)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                      paymentFilter === f.id
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                aria-label="Filtrar por etapa"
                className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-700"
              >
                <option value="all">Etapa: Todas</option>
                {ALL_LEAD_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {LEAD_STAGE_META[st].label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {activeTab === "leads" ? (
          <section className="space-y-3">
            {filteredLeads.length === 0 ? (
              <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
                No hay leads que coincidan con el filtro seleccionado.
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const st = LEAD_STAGE_META[lead.stage];
                const cleanWa = (lead.normalizedPhone || lead.whatsapp).replace(/[^0-9]/g, "");
                const marketingBlocked = !lead.consentMarketing || Boolean(lead.optedOutAt);
                const followText = encodeURIComponent(
                  `¡Hola ${lead.contactName}! Te escribimos por la prueba que guardaste${
                    lead.eventTitle ? ` ("${lead.eventTitle}")` : ""
                  } en Invita con el Alma. ¿Necesitás ayuda para activarla?\n\nSi preferís no recibir novedades, respondé BAJA.`
                );

                return (
                  <article
                    key={lead.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${st.cls}`}>
                          {st.label}
                        </span>
                        <h3 className="text-base font-bold text-stone-900">
                          {lead.contactName || "Visitante"}
                        </h3>
                        {lead.eventTitle && (
                          <span className="text-xs font-medium text-stone-600">
                            · &ldquo;{lead.eventTitle}&rdquo;
                          </span>
                        )}
                        {lead.convertedOrderCode && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                            Pedido {lead.convertedOrderCode}
                          </span>
                        )}
                        {lead.utmSource && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-amber-900">
                            utm_source: {lead.utmSource}
                            {lead.utmCampaign ? ` / ${lead.utmCampaign}` : ""}
                          </span>
                        )}
                        {lead.optedOutAt ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-900">
                            <Ban className="h-3 w-3" />
                            BAJA Marketing
                          </span>
                        ) : lead.consentMarketing ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                            Opt-in Marketing OK
                          </span>
                        ) : (
                          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
                            Solo servicio (sin marketing)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500">
                        Tel: <strong className="text-stone-800">{lead.normalizedPhone || lead.whatsapp}</strong>
                        {lead.email ? ` · Email: ${lead.email}` : ""}
                        {lead.category ? ` · Categoría: ${lead.category.toUpperCase()}` : ""}
                        {lead.planId ? ` · Plan: ${lead.planId.toUpperCase()}` : ""}
                        {lead.skinId ? ` · Modelo: ${lead.skinId}` : ""}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Última actividad: {new Date(lead.updatedAt).toLocaleString("es-AR")} · Consentimiento:{" "}
                        {lead.consentTextVersion || "v1"} ({lead.consentAt ? new Date(lead.consentAt).toLocaleDateString("es-AR") : "-"})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={lead.stage}
                        disabled={savingId === lead.id}
                        onChange={(e) =>
                          handleLeadStageChange(lead.id, e.target.value as LeadStage)
                        }
                        aria-label="Cambiar etapa del lead"
                        className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-800"
                      >
                        {ALL_LEAD_STAGES.map((opt) => (
                          <option key={opt} value={opt}>
                            {LEAD_STAGE_META[opt].label}
                          </option>
                        ))}
                      </select>

                      {lead.skinId && (
                        <Link
                          href={`/demo/${lead.skinId}${
                            lead.eventTitle
                              ? `?evento=${encodeURIComponent(lead.eventTitle)}`
                              : ""
                          }`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold hover:bg-stone-50"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Prueba
                        </Link>
                      )}

                      {cleanWa && !marketingBlocked ? (
                        <a
                          href={`https://wa.me/${cleanWa}?text=${followText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      ) : (
                        <span
                          title="Envíos de marketing bloqueados (sin opt-in o solicitó BAJA)"
                          className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 text-[11px] font-semibold text-stone-500"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Marketing bloqueado
                        </span>
                      )}

                      {!lead.optedOutAt && (
                        <button
                          type="button"
                          disabled={savingId === lead.id}
                          onClick={() => handleLeadOptOut(lead.id)}
                          title="Registrar BAJA de marketing"
                          className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900 hover:bg-amber-100"
                        >
                          <Ban className="h-3 w-3" />
                          BAJA
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={savingId === lead.id}
                        onClick={() => handleDeleteLead(lead.id)}
                        title="Supresión de datos personales (Ley 25.326, art. 16)"
                        className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-800 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3 w-3" />
                        Suprimir
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        ) : (
          <section className="space-y-5">
            {filteredOrders.map((row) => {
              const badge = STATUS_BADGES[row.status];
              const isEditing = editingId === row.id;
              const cleanPhone = row.whatsapp.replace(/[^0-9]/g, "");
              const planObj = PRICING_PLANS.find((p) => p.id === row.planId);
              const displayAmount = row.paidAmount || planObj?.transferPriceNum || 0;
              const verified = isOrderVerifiedPaid(row);

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
                            verified
                              ? "bg-emerald-100 text-emerald-800"
                              : row.paymentStatus === "pagado"
                              ? "bg-amber-100 text-amber-900"
                              : row.paymentStatus === "rechazado"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {verified
                            ? `Verificado ${formatArs(displayAmount)} (${
                                row.paymentMethod === "mercadopago" ? "MP" : "Transf."
                              } · ${row.verifiedBy || "ok"})`
                            : row.paymentStatus === "pagado"
                            ? `Sin verificación (${formatArs(displayAmount)})`
                            : row.paymentStatus === "rechazado"
                            ? "Pago rechazado"
                            : `Pago pendiente (${formatArs(displayAmount)})`}
                        </span>
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-700">
                          Plan {row.planId.toUpperCase()}
                        </span>
                        {row.utmSource && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-amber-900">
                            utm: {row.utmSource}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        Cliente: <strong>{row.contactName}</strong> · Tel: {row.whatsapp} · Email:{" "}
                        {row.email}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {row.dateDisplay} ({row.timeDisplay}) · {row.venue} · Confirmaciones:{" "}
                        <strong>{row.rsvpCount}</strong>
                      </p>
                      {row.songRequest && (
                        <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-950">
                          <Music className="h-3 w-3" />
                          Canción pedida (Llave en Mano): {row.songRequest}
                        </p>
                      )}
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
                      {!verified && (
                        <button
                          type="button"
                          disabled={savingId === row.id}
                          onClick={() => activateOrderWithAudio(row)}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Verificar Pago y Activar
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => (isEditing ? setEditingId(null) : startEdit(row))}
                      className="text-xs font-semibold text-amber-700 hover:underline"
                    >
                      {isEditing ? "Cancelar edición" : "Editar datos / diseño"}
                    </button>
                  </div>

                  {/* Asignación rápida de ruta/URL .mp3 personalizado al activar pedido */}
                  {(row.planId === "asistido" ||
                    Boolean(row.songRequest) ||
                    Boolean(row.audioOverride)) && (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950">
                          <Music className="h-3.5 w-3.5" />
                          Ruta / URL del archivo .mp3 personalizado
                        </span>
                        {row.audioOverride && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-800">
                            Audio asignado
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={inlineAudioMap[row.id] ?? ""}
                          onChange={(e) =>
                            setInlineAudioMap((prev) => ({
                              ...prev,
                              [row.id]: e.target.value,
                            }))
                          }
                          placeholder="/audio/mi-cancion.mp3 o URL del archivo .mp3"
                          className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-[11px] outline-none focus:border-stone-900"
                        />
                        <button
                          type="button"
                          disabled={savingId === row.id}
                          onClick={() => saveInlineAudio(row.id)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-[11px] font-semibold text-stone-800 hover:bg-stone-100"
                        >
                          <Save className="h-3 w-3" />
                          Guardar .mp3
                        </button>
                        <button
                          type="button"
                          disabled={savingId === row.id}
                          onClick={() => activateOrderWithAudio(row)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-[11px] font-semibold text-white hover:bg-stone-800"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {verified ? "Guardar y Publicar" : "Verificar y Activar con .mp3"}
                        </button>
                      </div>
                    </div>
                  )}

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
                          onChange={(e) =>
                            setEditForm({ ...editForm, eventTitle: e.target.value })
                          }
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
                          onChange={(e) =>
                            setEditForm({ ...editForm, timeDisplay: e.target.value })
                          }
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
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-stone-600">
                          Estado del Pago
                        </label>
                        <select
                          value={editForm.paymentStatus || "pendiente"}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              paymentStatus: e.target.value as PaymentStatus,
                            })
                          }
                          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="pagado">Pagado (Verifica y habilita Link)</option>
                          <option value="rechazado">Rechazado</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950">
                            <Music className="h-3.5 w-3.5" />
                            Ruta / URL del archivo .mp3 personalizado (Audio de Fondo)
                          </span>
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-stone-800">
                            <Upload className="h-3 w-3" />
                            {uploadingAudioId === row.id
                              ? "Subiendo audio..."
                              : "Subir MP3 / WAV / M4A"}
                            <input
                              type="file"
                              accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
                              disabled={uploadingAudioId === row.id}
                              onChange={(e) => handleUploadAudioForOrder(row.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          value={editForm.audioOverride || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, audioOverride: e.target.value })
                          }
                          placeholder="URL del audio (/audio/boda-perfect.mp3, none o URL subida)"
                          className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-[11px]"
                        />
                        {audioUploadMsg && (
                          <p className="mt-1.5 text-[11px] font-medium text-amber-900">
                            {audioUploadMsg}
                          </p>
                        )}
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
          </section>
        )}
      </main>
    </div>
  );
}
