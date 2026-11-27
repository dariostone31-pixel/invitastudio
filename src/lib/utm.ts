export interface StoredUtmData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

const UTM_STORAGE_KEY = "invita_utm_v1";
export const LEAD_ID_STORAGE_KEY = "invita_lead_id";

export function captureUtmAndLeadFromUrl(): StoredUtmData {
  if (typeof window === "undefined") return {};
  try {
    const sp = new URLSearchParams(window.location.search);
    const utmSource = sp.get("utm_source")?.trim() || "";
    const utmMedium = sp.get("utm_medium")?.trim() || "";
    const utmCampaign = sp.get("utm_campaign")?.trim() || "";
    const utmContent = sp.get("utm_content")?.trim() || "";
    const urlLeadId = sp.get("leadId")?.trim() || sp.get("invita_lead_id")?.trim() || "";

    if (urlLeadId) {
      window.localStorage.setItem(LEAD_ID_STORAGE_KEY, urlLeadId);
    }

    const existing = getStoredUtms();
    const merged: StoredUtmData = {
      utmSource: utmSource || existing.utmSource,
      utmMedium: utmMedium || existing.utmMedium,
      utmCampaign: utmCampaign || existing.utmCampaign,
      utmContent: utmContent || existing.utmContent,
    };

    if (merged.utmSource || merged.utmMedium || merged.utmCampaign || merged.utmContent) {
      window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return {};
  }
}

export function getStoredUtms(): StoredUtmData {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredUtmData;
  } catch {
    return {};
  }
}

export function getStoredLeadId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const sp = new URLSearchParams(window.location.search);
    const fromUrl = sp.get("leadId")?.trim() || sp.get("invita_lead_id")?.trim();
    if (fromUrl) return fromUrl;
    return window.localStorage.getItem(LEAD_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredLeadId(leadId: string): void {
  if (typeof window === "undefined" || !leadId) return;
  try {
    window.localStorage.setItem(LEAD_ID_STORAGE_KEY, leadId);
  } catch {
    // ignorar
  }
}

export function getOrCreateTesterSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const k = "invita_tester_sid";
    let sid = window.sessionStorage.getItem(k);
    if (!sid) {
      sid = `sid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      window.sessionStorage.setItem(k, sid);
    }
    return sid;
  } catch {
    return `sid-${Date.now()}`;
  }
}
