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
  const [primaryKeys, setPrimaryKeys] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);

  const [loadingEntities, setLoadingEntities] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [mode, setMode] = useState<"none" | "create" | "edit">("none");
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row>({});

  const entityOptions = useMemo(
    () => entities.map((t) => ({ value: t, label: t })),
    [entities],
  );

  function buildRowId(row: Row): string | null {
    if (!primaryKeys.length) return null;
    const parts = primaryKeys.map((k) => row[k]);
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
      const res = await getAdminRows(entity);

      setRows(res.items ?? []);
      setColumns(res.columns ?? []);
      setPrimaryKeys(res.primary_keys ?? []);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load rows");
      setRows([]);
      setColumns([]);
      setPrimaryKeys([]);
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
      setErr("Cannot edit: missing PK value(s)");
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

      for (const pk of primaryKeys) delete payload[pk];

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
      setErr("Cannot delete: missing PK value(s)");
      return;
    }
    const ok = confirm(`Delete row id=${rid}?`);
    if (!ok) return;

    setErr(null);
    try {
      await deleteAdminRow(selectedEntity, rid);
      await loadRows(selectedEntity);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Delete failed");
    }
  }

  useEffect(() => {
    void loadEntities();
  }, []);

  useEffect(() => {
    if (!selectedEntity) return;
    resetEditing();
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
              Browse entities, add/edit/delete rows.
            </Text>
          </div>

          <Group>
            <Button
              variant="light"
              onClick={() => selectedEntity ? void loadRows(selectedEntity) : void loadEntities()}
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
                          {primaryKeys.includes(c) ? " (PK)" : ""}
                        </Table.Th>
                      ))}
                      <Table.Th style={{ width: 240 }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {/* CREATE */}
                    {mode === "create" && (
                      <Table.Tr>
                        {columns.map((c) => (
                          <Table.Td key={c}>
                            <TextInput
                              value={draft[c] ?? ""}
                              placeholder={`Edit ${c}`}
                              onChange={(e) => {
                                const value = e.currentTarget.value;
                                setDraft((d) => ({ ...d, [c]: value }));
                              }}
                              size="xs"
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
                              const isPk = primaryKeys.includes(c);
                              return (
                                <Table.Td key={c} onDoubleClick={() => !isEditing && startEdit(r)}>
                                  {isEditing ? (
                                    <TextInput
                                      value={draft[c] ?? ""}
                                      disabled={isPk}
                                      onChange={(e) => {
                                        const value = e.currentTarget.value;
                                        setDraft((d) => ({ ...d, [c]: value }));
                                      }}
                                      size="xs"
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
              </div>
            )}
          </div>
        </Card>
      </Stack>
    </Container>
  );
}

function formatCell(v: any) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function normalizePayloadForSubmit(payload: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (v === "" || v === null || v === undefined) continue;
    out[k] = v;
  }
  return out;
}
