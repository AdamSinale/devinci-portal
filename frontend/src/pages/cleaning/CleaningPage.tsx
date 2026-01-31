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
import { useMemo, useState } from "react";
import PortalShell from "../components/PortalShell";
import { useAuth } from "../../utils/AuthContext";
import { type CleaningDuty, type CleaningDutyCreate, create_cleaning_duty, delete_cleaning_duty, get_cleaning_duties, update_cleaning_duty } from "../../api/http";
import { useCrudTable } from "../../utils/useCrudTable";

export default function CleaningPage() {
  const { user } = useAuth();
  const isManager = !!user?.roles?.includes("cleaning manager");

  const [draft, setDraft] = useState<CleaningDutyCreate>({ name1: "", name2: "", start_date: "", end_date: "" });                              // draft row created/edited (object textInputs read/write)

  const api = {
    list: get_cleaning_duties,
    create: create_cleaning_duty,
    update: (id: number, payload: CleaningDutyCreate) => update_cleaning_duty(id, payload),
    remove: delete_cleaning_duty,
    getId: (row: CleaningDuty) => row.id ?? null,
  };

  const crud = useCrudTable<CleaningDuty, CleaningDutyCreate, CleaningDutyCreate, number>(
    api,
    { name1: "", name2: "", start_date: "", end_date: "" }
  );

  const sorted_rows = useMemo(() => {
    return [...crud.rows].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  }, [crud.rows]);

  return (
    <PortalShell title="Cleaning Duties" subtitle="Weekly cleaning duty roster">
      <Group>
        {isManager && (
          <Button leftSection={<IconPlus size={16} />} onClick={crud.startCreate}>
            Add duty
          </Button>
        )}
      </Group>
      {crud.loading && <Loader />}
      {crud.err && <Alert color="red">{String(crud.err)}</Alert>}

      {!crud.loading && !crud.err && (
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
              {crud.mode === "create" && (
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
                      <Button size="xs" onClick={crud.create}>
                        Create
                      </Button>
                      <Button size="xs" variant="light" onClick={crud.resetMode}>
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
                  const isEditing = crud.mode === "edit" && row.id !== null && row.id === crud.editingId;
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
                              <Button size="xs" onClick={crud.saveEdit}>
                                Save
                              </Button>
                              <Button size="xs" variant="light" onClick={crud.resetMode}>
                                Cancel
                              </Button>
                            </Group>
                          ) : (
                            <Group gap="xs">
                              <ActionIcon variant="light" onClick={() => crud.startEdit(row)}>
                                <IconPencil size={16} />
                              </ActionIcon>
                              <ActionIcon
                                color="red"
                                variant="light"
                                onClick={() => {
                                  if (row.id !== null) {
                                    crud.remove(row);
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
