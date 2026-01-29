import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage, normalizePayloadForSubmit } from "./utils";

export type CrudMode = "none" | "create" | "edit";

export type CrudApi<
  TItem,
  TCreate extends Record<string, any>,
  TUpdate extends Record<string, any>,
  TId
> = {
  list: () => Promise<TItem[]>;
  create: (payload: TCreate) => Promise<any>;
  update: (id: TId, payload: TUpdate) => Promise<any>;
  remove: (id: TId) => Promise<any>;

  getId: (row: TItem) => TId | null;

  // איך להפוך row לדראפט לעריכה (ברירת מחדל: cast)
  toDraftForEdit?: (row: TItem) => TCreate;

  // איך להפוך draft לפיילואד update (למשל למחוק PKs)
  makeUpdatePayload?: (draft: TCreate, rowBeingEdited?: TItem) => TUpdate;
};

type CrudOptions<TItem> = {
  autoLoad?: boolean;
  confirmDelete?: (row: TItem) => boolean;
};

export function useCrudTable<
  TItem,
  TCreate extends Record<string, any>,
  TUpdate extends Record<string, any>,
  TId
>(
  api: CrudApi<TItem, TCreate, TUpdate, TId>,
  initialDraft: TCreate,
  options?: CrudOptions<TItem>
) {
  const [rows, setRows] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [mode, setMode] = useState<CrudMode>("none");
  const [editingId, setEditingId] = useState<TId | null>(null);
  const [editingRow, setEditingRow] = useState<TItem | null>(null);
  const [draft, setDraft] = useState<TCreate>(initialDraft);

  const resetMode = useCallback(() => {
    setMode("none");
    setEditingId(null);
    setEditingRow(null);
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

  const startEdit = useCallback(
    (row: TItem) => {
      const id = api.getId(row);
      if (id === null || id === undefined) {
        setErr("Cannot edit: missing id/PK");
        return;
      }
      resetMode();
      setMode("edit");
      setEditingId(id);
      setEditingRow(row);
      setDraft(api.toDraftForEdit ? api.toDraftForEdit(row) : (row as unknown as TCreate));
    },
    [api, resetMode]
  );

  const create = useCallback(async () => {
    setErr(null);
    try {
      const payload = normalizePayloadForSubmit(draft) as TCreate;
      await api.create(payload);
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
      const base = normalizePayloadForSubmit(draft) as TCreate;
      const payload = api.makeUpdatePayload
        ? api.makeUpdatePayload(base, editingRow ?? undefined)
        : (base as unknown as TUpdate);

      await api.update(editingId, payload);
      resetMode();
      await load();
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Update failed");
    }
  }, [api, draft, editingId, editingRow, load, resetMode]);

  const remove = useCallback(
    async (row: TItem) => {
      const id = api.getId(row);
      if (id === null || id === undefined) {
        setErr("Cannot delete: missing id/PK");
        return;
      }

      const ok = options?.confirmDelete
        ? options.confirmDelete(row)
        : confirm(`Delete id=${String(id)}?`);

      if (!ok) return;

      setErr(null);
      try {
        await api.remove(id);
        await load();
      } catch (e: any) {
        setErr(extractErrorMessage(e) || "Delete failed");
      }
    },
    [api, load, options?.confirmDelete]
  );

  useEffect(() => {
    if (options?.autoLoad === false) return;
    void load();
  }, [load, options?.autoLoad]);

  return {
    rows,
    setRows,
    loading,
    err,

    mode,
    editingId,
    draft,
    setDraft,

    load,
    resetMode,
    startCreate,
    startEdit,
    create,
    saveEdit,
    remove,
  };
}
