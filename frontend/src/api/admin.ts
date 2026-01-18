import { http } from "./http";

export type AdminEntityName = string;

export type AdminRowsResponse = {
  items: Record<string, any>[];
  limit: number;
  offset: number;
  total: number;

  // from admin backend
  columns: string[];
  primary_key: string[]; // can be composite
};

export type AdminCreateRowResponse = {
  item: Record<string, any>;
};

export type AdminUpdateRowResponse = {
  item: Record<string, any>;
};

export type AdminDeleteRowResponse = {
  deleted: boolean;
  id: string;
};

// GET /api/admin/entities
export async function getAdminEntities() {
  const res = await http.get<{ entities: AdminEntityName[] }>("/admin/entities");
  return res.data.entities;
}

// GET /api/admin/{entity}/rows?limit=&offset=
export async function getAdminRows(entity: string, limit = 50, offset = 0) {
  const res = await http.get<AdminRowsResponse>(`/admin/${encodeURIComponent(entity)}/rows`, {
    params: { limit, offset },
  });
  return res.data;
}

// POST /api/admin/{entity}/rows
export async function createAdminRow(entity: string, payload: Record<string, any>) {
  const res = await http.post<AdminCreateRowResponse>(
    `/admin/${encodeURIComponent(entity)}/rows`,
    payload,
  );
  return res.data;
}

// PATCH /api/admin/{entity}/rows/{row_id}
export async function updateAdminRow(entity: string, rowId: string, payload: Record<string, any>) {
  const res = await http.patch<AdminUpdateRowResponse>(
    `/admin/${encodeURIComponent(entity)}/rows/${encodeURIComponent(rowId)}`,
    payload,
  );
  return res.data;
}

// DELETE /api/admin/{entity}/rows/{row_id}
export async function deleteAdminRow(entity: string, rowId: string) {
  const res = await http.delete<AdminDeleteRowResponse>(
    `/admin/${encodeURIComponent(entity)}/rows/${encodeURIComponent(rowId)}`,
  );
  return res.data;
}
