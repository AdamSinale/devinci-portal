import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Table,
  Text,
  TextInput,
} from "@mantine/core";

import { getAdminEntities, getAdminRows, createAdminRow, updateAdminRow, deleteAdminRow } from "../../api/admin";
import PortalShell from "../components/PortalShell";
import { extractErrorMessage, formatCell, normalizePayloadForSubmit, mapRowForEdit } from "../../api/utils";

type Row = Record<string, any>;  // object for each table row, key = column name, value = cell value

export default function AdminPage() {
  const [entities, setEntities] = useState<string[]>([]);                   // entity names list
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);  // currently selected entity

  const [columns, setColumns] = useState<string[]>([]);                     // columns for selected entity
  const [primaryKeys, setPrimaryKeys] = useState<string[]>([]);             // primary key columns for selected entity
  const [rows, setRows] = useState<Row[]>([]);                              // rows for selected entity

  const [loadingEntities, setLoadingEntities] = useState(true);             // loading state for entities list, true on initial load
  const [loadingRows, setLoadingRows] = useState(false);                    // loading state for rows, false until changing entity
  const [err, setErr] = useState<string | null>(null);                      // error message, if any

  const [mode, setMode] = useState<"none" | "create" | "edit">("none");     // current mode: none, create, edit
  const [editingRowId, setEditingRowId] = useState<string | null>(null);    // row id being edited
  const [draft, setDraft] = useState<Row>({});                              // draft row created/edited (object textInputs read/write)

  const entityOptions = useMemo(                                            // options for entity select
    () => entities.map((t) => ({ value: t, label: t })),                    // map entity names to {value,label} objects
    [entities],                                                             // recompute when entities change
  );

  function buildRowId(row: Row): string | null {                        // create row id by PK      
    if (!primaryKeys.length) return null;                               // if no PKs, cant build id
    const parts = primaryKeys.map((k) => row[k]);                       // get PK values from row
    if (parts.some((x) => x === null || x === undefined)) return null;  // if PK value missing, cant build id
    return parts.map((x) => String(x)).join(":");                       // return pk1:pk2:... string
  }

  async function loadEntities() {                                   // load entity names list
    setErr(null);                                                   // removes previous error
    setLoadingEntities(true);                                       // set loading state
    try {
      const list = await getAdminEntities();                        // entity names from API
      setEntities(list);                                            // set given names to entity list state
      setSelectedEntity((prev) => prev ?? list[0] ?? null);         // select first entity if none selected
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Failed to load entities");  // set error message
    } finally {
      setLoadingEntities(false);                                    // stop loading state
    }
  }

  async function loadRows(entity: string) {                     // load rows for given entity
    setErr(null);                                               // removes previous error
    setLoadingRows(true);                                       // set loading state
    try {
      const res = await getAdminRows(entity);                   // get rows from API

      setRows(res.items ?? []);                                 // set rows state
      setColumns(res.columns ?? []);                            // set columns state
      setPrimaryKeys(res.primary_keys ?? []);                   // set primary keys state
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Failed to load rows");  // set error message
      setRows([]);                                              // clear rows
      setColumns([]);                                           // clear columns
      setPrimaryKeys([]);                                       // clear primary keys
    } finally {
      setLoadingRows(false);                                    // stop loading state
    }
  }

  function resetMode() {    // reset state
    setMode("none");        // set mode to none
    setEditingRowId(null);  // clear editing row id
    setDraft({});           // clear draft row
  }

  function startCreate() {
    resetMode();                               // reset state
    setMode("create");                         // set mode to create
    const initial: Row = {};                   // initial empty row
    for (const c of columns) initial[c] = "";  // set all columns to empty string
    setDraft(initial);                         // set draft to initial empty row
  }

  function startEdit(row: Row) {                   // start editing given row
    const rid = buildRowId(row);                   // build row id from PKs
    if (!rid) {                                    // if cannot build row id
      setErr("Cannot edit: missing PK value(s)");  // set error
      return;
    }
    resetMode();                                   // reset state
    setMode("edit");                               // set mode to edit
    setEditingRowId(rid);                          // set editing row id
    setDraft(mapRowForEdit(row));                  // set draft to given row
  }

  async function handleCreate() {                                              // handle create row action  
    if (!selectedEntity) return;                                               // if no entity selected, do nothing
    setErr(null);                                                              // clear previous error
    try {
      await createAdminRow(selectedEntity, normalizePayloadForSubmit(draft));  // create row via API
      resetMode();                                                             // reset state
      await loadRows(selectedEntity);                                          // reload rows for entity
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Create failed");                       // set error message on failure
    }
  }

  async function handleSaveEdit() {                                                            // handle save edited row action
    if (!selectedEntity || !editingRowId) return;                                              // if no entity or editing row id, do nothing
    setErr(null);                                                                              // clear previous error
    try {
      const payload = { ...draft };                                                            // copy draft to payload
      for (const pk of primaryKeys) delete payload[pk];                                        // remove PKs from payload to avoid updating them
      await updateAdminRow(selectedEntity, editingRowId, normalizePayloadForSubmit(payload));  // update row via API
      resetMode();                                                                             // reset state
      await loadRows(selectedEntity);                                                          // reload rows for entity
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Update failed");                                       // set error message on failure
    }
  }

  async function handleDelete(row: Row) {                 // handle delete row action
    if (!selectedEntity) return;                          // if no entity selected, do nothing
    const rid = buildRowId(row);                          // build row id from PKs
    if (!rid) {                                           // if cannot build row id
      setErr("Cannot delete: missing PK value(s)");       // set error
      return;
    }
    const ok = confirm(`Delete row id=${rid}?`);          // "confirm deletion" notification
    if (!ok) return;                                      // if not confirmed, do nothing

    setErr(null);                                         // clear previous error
    try {
      await deleteAdminRow(selectedEntity, rid);          // delete row via API
      await loadRows(selectedEntity);                     // reload rows for entity
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Delete failed");  // set error message on failure
    }
  }

  useEffect(() => {
    void loadEntities();  // load entities on initial mount
  }, []);

  useEffect(() => {                 // when selected entity changes
    if (!selectedEntity) return;    // if no entity selected, do nothing
    resetMode();                    // reset state
    void loadRows(selectedEntity);  // load rows when selected entity changes
  }, [selectedEntity]);

  const busy = loadingEntities || loadingRows;  // busy state when loading entities or rows

  return (
    <PortalShell title="Admin" subtitle="Browse entities, add/edit/delete rows.">
      <Group>
        <Button variant="light" onClick={() => selectedEntity ? void loadRows(selectedEntity) : void loadEntities()} disabled={busy}>
          Refresh
        </Button>
        <Button onClick={startCreate} disabled={!selectedEntity || columns.length === 0 || mode !== "none" || loadingRows}>
          + Add row
        </Button>
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
                          <Button size="xs" variant="light" onClick={resetMode}>
                            Cancel
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )}

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
                                    type="text"
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
                                <Button size="xs" variant="light" onClick={resetMode}>
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
    </PortalShell>
  );
}
