import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage, normalizePayloadForSubmit } from "./utils";

export type CrudMode = "none" | "create" | "edit";

export type CrudApi<TItem, TCreate, TUpdate, TId> = {
  list: () => Promise<TItem[]>;
  create: (payload: TCreate) => Promise<any>;
  update: (id: TId, payload: TUpdate) => Promise<any>;
  remove: (id: TId) => Promise<any>;
  getId: (row: TItem) => TId | null;          // איך מזהים שורה
  toDraftForEdit?: (row: TItem) => TCreate;   // ברירת מחדל: cast פשוט
};

export function useCrudTable<TItem, TCreate, TUpdate, TId>(
  api: CrudApi<TItem, TCreate, TUpdate, TId>,
  initialDraft: TCreate,
  options?: { autoLoad?: boolean }
) {
  const [rows, setRows] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [mode, setMode] = useState<CrudMode>("none");
  const [editingId, setEditingId] = useState<TId | null>(null);
  const [draft, setDraft] = useState<TCreate>(initialDraft);

  const resetMode = useCallback(() => {
    setMode("none");
    setEditingId(null);
    setDraft(initialDraft);
  }, [initialDraft]);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const data = await api.list();
      setRows(data ?? []);
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const startCreate = useCallback(() => {
    resetMode();
    setMode("create");
    setDraft(initialDraft);
  }, [resetMode, initialDraft]);

  const startEdit = useCallback((row: TItem) => {
    const id = api.getId(row);
    if (id === null || id === undefined) {
      setErr("Cannot edit: missing id/PK");
      return;
    }
    resetMode();
    setMode("edit");
    setEditingId(id);
    setDraft(api.toDraftForEdit ? api.toDraftForEdit(row) : (row as unknown as TCreate));
  }, [api, resetMode]);

  const create = useCallback(async () => {
    setErr(null);
    try {
      await api.create(normalizePayloadForSubmit(draft) as any);
      resetMode();
      await load();
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Create failed");
    }
  }, [api, draft, load, resetMode]);

  const saveEdit = useCallback(async () => {
    if (editingId === null || editingId === undefined) return;
    setErr(null);
    try {
      await api.update(editingId, normalizePayloadForSubmit(draft) as any);
      resetMode();
      await load();
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Update failed");
    }
  }, [api, draft, editingId, load, resetMode]);

  const remove = useCallback(async (row: TItem) => {
    const id = api.getId(row);
    if (id === null || id === undefined) {
      setErr("Cannot delete: missing id/PK");
      return;
    }
    const ok = confirm(`Delete id=${String(id)}?`);
    if (!ok) return;

    setErr(null);
    try {
      await api.remove(id);
      await load();
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Delete failed");
    }
  }, [api, load]);

  useEffect(() => {
    if (options?.autoLoad === false) return;
    void load();
  }, [load, options?.autoLoad]);

  return {
    // data
    rows, setRows,
    loading, err,

    // edit/create state
    mode, editingId, draft, setDraft,

    // handlers
    load, resetMode, startCreate, startEdit, create, saveEdit, remove,
  };
}
