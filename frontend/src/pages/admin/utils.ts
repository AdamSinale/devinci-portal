
export function formatCell(v: any) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (looksIsoDateString(v)) {
    const local = isoToDateTimeLocal(v);
    return local.replace("T", " ");
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function normalizePayloadForSubmit(payload: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === "string") {
      const s = v.trim();
      out[k] = s === "" ? null : s;
    } else {
      out[k] = v;
    }
  }
  return out;
}


export function extractErrorMessage(e: any): string {
  const data = e?.response?.data;
  const detail = data?.detail;

  if (Array.isArray(detail)) {
    const msgs = detail
      .map((x) => x?.msg)
      .filter(Boolean);
    return msgs.length ? msgs.join(", ") : "Validation error (422)";
  }

  if (typeof detail === "string") return detail;
  if (typeof data?.message === "string") return data.message;
  return e?.message ?? "Request failed";
}

export function looksIsoDateString(v: any) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}t\d{2}:\d{2}/i.test(v);
}

export function isoToDateTimeLocal(v: any) {
  if (typeof v !== "string") return v;

  const m = v.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  if (m) return `${m[1]} ${m[2]}`;

  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  return v;
}

export function mapRowForEdit(row: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) out[k] = isoToDateTimeLocal(v);
  return out;
}
