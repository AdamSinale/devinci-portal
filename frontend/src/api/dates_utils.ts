
export function is_iso_string(v: any) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}t\d{2}:\d{2}/i.test(v);
}

export function convert_iso_to_datetime(v: any) {
  if (typeof v !== "string") return v;

  const m = v.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  if (m) return `${m[1]} ${m[2]}`;

  return v;
}

export function convert_iso_to_Date(d?: string | null): Date | null {
  if (!d) return null;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function convert_iso_to_Date_string(iso: string) {
  return new Date(iso).toLocaleString();
}

export function set_date_IL(dt: Date): string {
  return dt.toLocaleString("he-IL");
}

export function today_Date(dt: Date): Date {
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

export function now_iso(): string {
  return new Date().toISOString();
}

