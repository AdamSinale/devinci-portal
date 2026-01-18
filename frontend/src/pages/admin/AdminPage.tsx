import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import {
  getAdminEntities,
  getAdminRows,
  createAdminRow,
  updateAdminRow,
  deleteAdminRow,
} from "../../api/admin";

type Row = Record<string, any>;

export default function AdminPage() {
  const [entities, setEntities] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const [columns, setColumns] = useState<string[]>([]);
  const [primaryKey, setPrimaryKey] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState<number>(0);

  const [loadingEntities, setLoadingEntities] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Editing
  const [mode, setMode] = useState<"none" | "create" | "edit">("none");
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row>({});

  const entityOptions = useMemo(
    () => entities.map((t) => ({ value: t, label: t })),
    [entities],
  );

  function buildRowId(row: Row): string | null {
    if (!primaryKey || primaryKey.length === 0) return null;

    const parts = primaryKey.map((k) => row[k]);
    if (parts.some((x) => x === null || x === undefined)) return null;
    return parts.map((x) => String(x)).join(":");
  }

  async function loadEntities() {
    setErr(null);
    setLoadingEntities(true);
    try {
      const list = await getAdminEntities();
      setEntities(list);
      setSelectedEntity((prev) => prev ?? list[0] ?? null);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load entities");
    } finally {
      setLoadingEntities(false);
    }
  }

  async function loadRows(entity: string) {
    setErr(null);
    setLoadingRows(true);
    try {
      const res = await getAdminRows(entity, 50, 0);
      setRows(res.items ?? []);
      setColumns(res.columns ?? []);
      setPrimaryKey(res.primary_key ?? []);
      setTotal(res.total ?? 0);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load rows");
      setRows([]);
      setColumns([]);
      setPrimaryKey([]);
      setTotal(0);
    } finally {
      setLoadingRows(false);
    }
  }

  function resetEditing() {
    setMode("none");
    setEditingRowId(null);
    setDraft({});
  }

  function startCreate() {
    resetEditing();
    setMode("create");

    const initial: Row = {};
    for (const c of columns) initial[c] = "";
    setDraft(initial);
  }

  function startEdit(row: Row) {
    const rid = buildRowId(row);
    if (!rid) {
      setErr("Cannot edit: missing primary key value");
      return;
    }

    resetEditing();
    setMode("edit");
    setEditingRowId(rid);
    setDraft({ ...row });
  }

  async function handleCreate() {
    if (!selectedEntity) return;

    setErr(null);
    try {
      await createAdminRow(selectedEntity, normalizePayloadForSubmit(draft));
      resetEditing();
      await loadRows(selectedEntity);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Create failed");
    }
  }

  async function handleSaveEdit() {
    if (!selectedEntity || !editingRowId) return;

    setErr(null);
    try {
      const payload = { ...draft };
      // אל תנסה לעדכן PK
      for (const pk of primaryKey) delete payload[pk];

      await updateAdminRow(selectedEntity, editingRowId, normalizePayloadForSubmit(payload));
      resetEditing();
      await loadRows(selectedEntity);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Update failed");
    }
  }

  async function handleDelete(row: Row) {
    if (!selectedEntity) return;

    const rid = buildRowId(row);
    if (!rid) {
      setErr("Cannot delete: missing primary key value");
      return;
    }

    const ok = confirm(`Delete row id=${rid} ?`);
    if (!ok) return;

    setErr(null);
    try {
      await deleteAdminRow(selectedEntity, rid);
      await loadRows(selectedEntity);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Delete failed");
    }
  }

  // initial load
  useEffect(() => {
    void loadEntities();
  }, []);

  // when entity changes load rows (includes columns/pk)
  useEffect(() => {
    if (!selectedEntity) return;

    resetEditing();
    setRows([]);
    setColumns([]);
    setPrimaryKey([]);
    setTotal(0);

    void loadRows(selectedEntity);
  }, [selectedEntity]);

  const busy = loadingEntities || loadingRows;

  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Admin</Title>
            <Text c="dimmed" size="sm">
              Browse entities, add/edit/delete rows. Total: {total}
            </Text>
          </div>

          <Group>
            <Button
              variant="light"
              onClick={() => {
                if (selectedEntity) void loadRows(selectedEntity);
                else void loadEntities();
              }}
              disabled={busy}
            >
              Refresh
            </Button>

            <Button
              onClick={startCreate}
              disabled={!selectedEntity || columns.length === 0 || mode !== "none" || loadingRows}
            >
              + Add row
            </Button>
          </Group>
        </Group>

        {err && (
          <Alert color="red" title="Error">
            {err}
          </Alert>
        )}

        <Card withBorder radius="md" p="md">
          <Group justify="space-between" align="flex-end">
            <Select
              label="Entity"
              placeholder={loadingEntities ? "Loading..." : "Pick an entity"}
              data={entityOptions}
              value={selectedEntity}
              onChange={setSelectedEntity}
              searchable
              nothingFoundMessage="No entities"
              disabled={loadingEntities}
              w={320}
            />

            {busy && <Loader size="sm" />}
          </Group>

          <div style={{ marginTop: 16 }}>
            {!selectedEntity ? (
              <Text c="dimmed">No entity selected.</Text>
            ) : columns.length === 0 ? (
              <Text c="dimmed">No columns found.</Text>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      {columns.map((c) => (
                        <Table.Th key={c}>
                          {c}
                          {primaryKey.includes(c) ? " (PK)" : ""}
                        </Table.Th>
                      ))}
                      <Table.Th style={{ width: 240 }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {/* CREATE ROW */}
                    {mode === "create" && (
                      <Table.Tr>
                        {columns.map((c) => (
                          <Table.Td key={c}>
                            <CellEditor
                              colName={c}
                              value={draft[c]}
                              disabled={false}
                              onChange={(val) => setDraft((d) => ({ ...d, [c]: val }))}
                            />
                          </Table.Td>
                        ))}
                        <Table.Td>
                          <Group gap="xs">
                            <Button size="xs" onClick={handleCreate}>
                              Create
                            </Button>
                            <Button size="xs" variant="light" onClick={resetEditing}>
                              Cancel
                            </Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    )}

                    {/* ROWS */}
                    {loadingRows ? (
                      <Table.Tr>
                        <Table.Td colSpan={columns.length + 1}>
                          <Group>
                            <Loader size="sm" />
                            <Text c="dimmed">Loading rows...</Text>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ) : rows.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={columns.length + 1}>
                          <Text c="dimmed">No rows found.</Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      rows.map((r, idx) => {
                        const rid = buildRowId(r);
                        const isEditing = mode === "edit" && rid !== null && rid === editingRowId;

                        return (
                          <Table.Tr key={rid ?? idx}>
                            {columns.map((c) => {
                              const isPk = primaryKey.includes(c);
                              return (
                                <Table.Td key={c} onDoubleClick={() => !isEditing && startEdit(r)}>
                                  {isEditing ? (
                                    <CellEditor
                                      colName={c}
                                      value={draft[c]}
                                      disabled={isPk}
                                      onChange={(val) => setDraft((d) => ({ ...d, [c]: val }))}
                                    />
                                  ) : (
                                    <Text size="sm" lineClamp={2}>
                                      {formatCell(r[c])}
                                    </Text>
                                  )}
                                </Table.Td>
                              );
                            })}

                            <Table.Td>
                              {isEditing ? (
                                <Group gap="xs">
                                  <Button size="xs" onClick={handleSaveEdit}>
                                    Save
                                  </Button>
                                  <Button size="xs" variant="light" onClick={resetEditing}>
                                    Cancel
                                  </Button>
                                </Group>
                              ) : (
                                <Group gap="xs">
                                  <Button
                                    size="xs"
                                    variant="light"
                                    onClick={() => startEdit(r)}
                                    disabled={mode !== "none"}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="xs"
                                    color="red"
                                    variant="light"
                                    onClick={() => handleDelete(r)}
                                    disabled={mode !== "none"}
                                  >
                                    Delete
                                  </Button>
                                </Group>
                              )}
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    )}
                  </Table.Tbody>
                </Table>

                <Text c="dimmed" size="xs" mt="sm">
                  Tip: double-click a cell to start editing a row. Composite PK uses "a:b" row ids.
                </Text>
              </div>
            )}
          </div>
        </Card>
      </Stack>
    </Container>
  );
}

function CellEditor({
  colName,
  value,
  disabled,
  onChange,
}: {
  colName: string;
  value: any;
  disabled: boolean;
  onChange: (val: any) => void;
}) {
  return (
    <TextInput
      value={value ?? ""}
      disabled={disabled}
      placeholder={`Edit ${colName}`}
      onChange={(e) => onChange(e.currentTarget.value)}
      size="xs"
    />
  );
}

function formatCell(v: any) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/**
 * מינימום ניקוי:
 * - מאפשר לרוקן שדה: "" -> null
 * (הבק אחראי להמרות טיפוסים אמיתיות)
 */
function normalizePayloadForSubmit(payload: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = v === "" ? null : v;
  }
  return out;
}
