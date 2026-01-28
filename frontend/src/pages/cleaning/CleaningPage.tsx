// src/pages/cleaning/CleaningPage.tsx
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  Loader,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import PortalShell from "../components/PortalShell";
import { useAuth } from "../../utils/AuthContext";
import { type CleaningDuty, type CleaningDutyCreate, create_cleaning_duty, delete_cleaning_duty, get_cleaning_duties, update_cleaning_duty } from "../../api/http";
import { extractErrorMessage, normalizePayloadForSubmit } from "../../utils/utils";

export default function CleaningPage() {
  const { user } = useAuth();
  const isManager = !!user?.roles?.includes("cleaning manager");

  const [rows, setRows] = useState<CleaningDuty[]>([]);                              // rows for selected entity
  const [loading, setLoading] = useState(false);                    // loading state for rows, false until changing entity
  const [err, setErr] = useState<string | null>(null);                      // error message, if any

  const [mode, setMode] = useState<"none" | "create" | "edit">("none");     // current mode: none, create, edit
  const [editingRowId, setEditingRowId] = useState<number | null>(null);    // row id being edited
  const [draft, setDraft] = useState<CleaningDutyCreate>({ name1: "", name2: "", start_date: "", end_date: "" });                              // draft row created/edited (object textInputs read/write)

  const sorted_rows = useMemo(() => {
    rows.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    return rows;
  }, [rows]);

  async function loadRows() {                     // load rows for given entity
    setErr(null);                                               // removes previous error
    setLoading(true);                                       // set loading state
    try {
      const res = await get_cleaning_duties();                   // get rows from API
      setRows(res ?? []);                                 // set rows state
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Failed to load rows");  // set error message
      setRows([]);                                              // clear rows
    } finally {
      setLoading(false);                                    // stop loading state
    }
  }

  function resetMode() {    // reset state
    setMode("none");        // set mode to none
    setEditingRowId(null);  // clear editing row id
    setDraft({ name1: "", name2: "", start_date: "", end_date: "" });           // clear draft row
  }

  function startCreate() {
    resetMode();                               // reset state
    setMode("create");                         // set mode to create
    const initial: CleaningDutyCreate = { name1: "", name2: "", start_date: "", end_date: "" };                   // initial empty row
    setDraft(initial);                         // set draft to initial empty row
  }

  function startEdit(row: CleaningDuty) {                   // start editing given row
    if (!row.id) {                                    // if cannot build row id
      setErr("Cannot edit: missing PK value(s)");  // set error
      return;
    }
    resetMode();                                   // reset state
    setMode("edit");                               // set mode to edit
    setEditingRowId(row.id);                          // set editing row id
    setDraft(row);                  // set draft to given row
  }

  async function handleCreate() {                                              // handle create row action  
    setErr(null);                                                              // clear previous error
    try {
      await create_cleaning_duty(draft);  // create row via API
      resetMode();                                                             // reset state
      await loadRows();                                          // reload rows for entity
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Create failed");                       // set error message on failure
    }
  }

  async function handleSaveEdit() {                                                            // handle save edited row action
    if (!editingRowId) return;                                              // if no entity or editing row id, do nothing
    setErr(null);                                                                              // clear previous error
    try {
      const payload = { ...draft };                                                            // copy draft to payload
      await update_cleaning_duty(editingRowId, normalizePayloadForSubmit(payload));  // update row via API
      resetMode();                                                                             // reset state
      await loadRows();                                                          // reload rows for entity
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Update failed");                                       // set error message on failure
    }
  }

  async function handleDelete(row: CleaningDuty) {                 // handle delete row action
    if (!row.id) {                                           // if cannot build row id
      setErr("Cannot delete: missing PK value(s)");       // set error
      return;
    }
    const ok = confirm(`Delete row id=${row.id}?`);          // "confirm deletion" notification
    if (!ok) return;                                      // if not confirmed, do nothing

    setErr(null);                                         // clear previous error
    try {
      await delete_cleaning_duty(row.id);          // delete row via API
      await loadRows();                     // reload rows for entity
    } catch (e: any) {
      setErr(extractErrorMessage(e) || "Delete failed");  // set error message on failure
    }
  }

  useEffect(() => {
    void loadRows();  // load entities on initial mount
  }, []);

  return (
    <PortalShell title="Cleaning Duties" subtitle="Weekly cleaning duty roster">
      <Group>
        {isManager && (
          <Button leftSection={<IconPlus size={16} />} onClick={startCreate}>
            Add duty
          </Button>
        )}
      </Group>
      {loading && <Loader />}
      {err && <Alert color="red">{String(err)}</Alert>}

      {!loading && !err && (
        <Card withBorder radius="md" p="lg">
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>1st Name</Table.Th>
                <Table.Th>2nd Name</Table.Th>
                <Table.Th>Start Date</Table.Th>
                <Table.Th>End Date</Table.Th>
                {isManager && <Table.Th w={120}>actions</Table.Th>}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {mode === "create" && (
                <Table.Tr>
                  <Table.Td key={"name1"}>
                    <TextInput
                      value={draft.name1}
                      placeholder={`Edit name1`}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setDraft((d) => ({ ...d, name1: value }));
                      }}
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td key={"name2"}>
                    <TextInput
                      value={draft.name2}
                      placeholder={`Edit name2`}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setDraft((d) => ({ ...d, name2: value }));
                      }}
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td key={"start_date"}>
                    <TextInput
                      value={draft.start_date}
                      placeholder={`Edit start date`}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setDraft((d) => ({ ...d, start_date: value }));
                      }}
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td key={"end_date"}>
                    <TextInput
                      value={draft.end_date}
                      placeholder={`Edit end date`}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setDraft((d) => ({ ...d, end_date: value }));
                      }}
                      size="xs"
                    />
                  </Table.Td>
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

              {sorted_rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={isManager ? 5 : 4}>
                    <Text c="dimmed">No duties yet.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                sorted_rows.map((row) => {
                  const isEditing = mode === "edit" && row.id !== null && row.id === editingRowId;
                  return (
                    <Table.Tr key={row.id}>
                      <Table.Td>
                        {isEditing ? (
                          <TextInput
                            type="text"
                            value={draft.name1 ?? ""}
                            onChange={(e) => {
                              const value = e.currentTarget.value;
                              setDraft((d) => ({ ...d, name1: value }));
                            }}
                            size="xs"
                          />
                        ) : ( row.name1 )}
                      </Table.Td>
                      <Table.Td>
                        {isEditing ? (
                          <TextInput
                            type="text"
                            value={draft.name2 ?? ""}
                            onChange={(e) => {
                              const value = e.currentTarget.value;
                              setDraft((d) => ({ ...d, name2: value }));
                            }}
                            size="xs"
                          />
                        ) : ( row.name2 )}
                      </Table.Td>
                      <Table.Td>
                        {isEditing ? (
                          <TextInput
                            type="text"
                            value={draft.start_date ?? ""}
                            onChange={(e) => {
                              const value = e.currentTarget.value;
                              setDraft((d) => ({ ...d, start_date: value }));
                            }}
                            size="xs"
                          />
                        ) : ( row.start_date?.toLocaleString() )}
                      </Table.Td>
                      <Table.Td>
                        {isEditing ? (
                          <TextInput
                            type="text"
                            value={draft.end_date ?? ""}
                            onChange={(e) => {
                              const value = e.currentTarget.value;
                              setDraft((d) => ({ ...d, end_date: value }));
                            }}
                            size="xs"
                          />
                        ) : ( row.end_date?.toLocaleString() )}
                      </Table.Td>

                      {isManager && row.id !== null && (
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
                              <ActionIcon variant="light" onClick={() => startEdit(row)}>
                                <IconPencil size={16} />
                              </ActionIcon>
                              <ActionIcon
                                color="red"
                                variant="light"
                                onClick={() => {
                                  if (row.id !== null) {
                                    handleDelete(row);
                                  }
                                }}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          )}
                        </Table.Td>
                      )}
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </PortalShell>
  );
}
