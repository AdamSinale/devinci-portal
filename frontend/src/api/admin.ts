import { http } from "./http";

export type AdminTableName = string;

export type AdminColumnSchema = {
  name: string;
  nullable: boolean;
  primary_key: boolean;
  type: string;
};

export type AdminTableSchema = {
  table: string;
  primary_key: string;
  columns: AdminColumnSchema[];
};

export type AdminRowsResponse = {
  items: Record<string, any>[];
  limit: number;
  offset: number;
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

// GET /api/admin/tables
export async function getAdminTables() {
  const res = await http.get<AdminTableName[]>("/admin/tables");
  return res.data;
}

// GET /api/admin/tables/{table}/schema
export async function getAdminTableSchema(table: string) {
  const res = await http.get<AdminTableSchema>(`/admin/tables/${encodeURIComponent(table)}/schema`);
  return res.data;
}

// GET /api/admin/tables/{table}/rows?limit=&offset=
export async function getAdminTableRows(table: string, limit = 50, offset = 0) {
  const res = await http.get<AdminRowsResponse>(`/admin/tables/${encodeURIComponent(table)}/rows`, {
    params: { limit, offset },
  });
  return res.data;
}

// POST /api/admin/tables/{table}/rows
export async function createAdminRow(table: string, payload: Record<string, any>) {
  const res = await http.post<AdminCreateRowResponse>(
    `/admin/tables/${encodeURIComponent(table)}/rows`,
    payload,
  );
  return res.data;
}

// PATCH /api/admin/tables/{table}/rows/{row_id}
export async function updateAdminRow(table: string, rowId: string | number, payload: Record<string, any>) {
  const res = await http.patch<AdminUpdateRowResponse>(
    `/admin/tables/${encodeURIComponent(table)}/rows/${encodeURIComponent(String(rowId))}`,
    payload,
  );
  return res.data;
}

// DELETE /api/admin/tables/{table}/rows/{row_id}
export async function deleteAdminRow(table: string, rowId: string | number) {
  const res = await http.delete<AdminDeleteRowResponse>(
    `/admin/tables/${encodeURIComponent(table)}/rows/${encodeURIComponent(String(rowId))}`,
  );
  return res.data;
}
