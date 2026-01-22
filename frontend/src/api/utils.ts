import { is_iso_string, convert_iso_to_datetime } from "./dates_utils";


export function formatCell(v: any) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (is_iso_string(v)) {
    const local = convert_iso_to_datetime(v);
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

export function mapRowForEdit(row: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) out[k] = convert_iso_to_datetime(v);
  return out;
}
