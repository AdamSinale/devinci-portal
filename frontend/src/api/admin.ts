import { http } from "./http";

type Row = Record<string, any>;

export type AdminRowsResult = {
  items: Row[];
  columns: string[];
  primary_keys: string[];
};

function enc(v: any) {
  return encodeURIComponent(String(v));
}

const PATHS: Record<string, string> = {
  teams: "teams",
  team_links: "team_links",
  forum_ideas: "forum_ideas",
  forum_events: "forum_events",
  forum_settings: "forum_settings",
  users: "users",
  user_events: "user_events",
  messages: "messages",
  user_roles: "user_roles",
  roles: "roles",
};

function pathFor(entity: string) {
  const p = PATHS[entity];
  if (!p) throw new Error(`Unknown entity path: ${entity}`);
  return `/${p}`;
}

export async function getAdminEntities(): Promise<string[]> {
  return Object.keys(PATHS);
}

export async function getAdminRows(entity: string): Promise<AdminRowsResult> {
  const res = await http.get<AdminRowsResult>(pathFor(entity));
  return res.data;
}

export async function createAdminRow(entity: string, payload: Row) {
  return (await http.post(pathFor(entity), payload)).data;
}

export async function updateAdminRow(entity: string, rowId: string, payload: Row) {
  return (await http.patch(`${pathFor(entity)}/${enc(rowId)}`, payload)).data;
}

export async function deleteAdminRow(entity: string, rowId: string) {
  return (await http.delete(`${pathFor(entity)}/${enc(rowId)}`)).data;
}
