import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ActionIcon, Button, Card, Group, Modal, NumberInput, Select, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";

type Column = {
  name: string;
  nullable: boolean;
  primary_key: boolean;
  type: string;
};

type Schema = {
  table: string;
  primary_key: string;
  columns: Column[];
};

type RowData = Record<string, any>;

const api = axios.create({
  baseURL: import.meta.env.VITE_PROXY_TARGET ?? "http://localhost:8000",
});

export default function AdminPage() {
  const [tables, setTables] = useState<string[]>([]);
  const [table, setTable] = useState<string | null>(null);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [rows, setRows] = useState<RowData[]>([]);
  const [limit, setLimit] = useState<number>(50);
  const [offset, setOffset] = useState<number>(0);

  const [opened, setOpened] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [draft, setDraft] = useState<RowData>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    api.get("/api/admin/tables").then((r) => setTables(r.data));
  }, []);

  useEffect(() => {
    if (!table) return;
    api.get(`/api/admin/tables/${table}/schema`).then((r) => {
      setSchema(r.data);
      setDraft({});
      setOffset(0);
    });
  }, [table]);

  useEffect(() => {
    if (!table) return;
    api
      .get(`/api/admin/tables/${table}/rows`, { params: { limit, offset } })
      .then((r) => setRows(r.data.items));
  }, [table, limit, offset]);

  const columns = useMemo(() => schema?.columns ?? [], [schema]);
  const pk = schema?.primary_key;

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setDraft({});
    setOpened(true);
  }

  function openEdit(row: RowData) {
    setMode("edit");
    const id = pk ? String(row[pk]) : null;
    setEditingId(id);
    setDraft({ ...row });
    setOpened(true);
  }

  async function submit() {
    if (!table || !schema) return;

    if (mode === "create") {
      await api.post(`/api/admin/tables/${table}/rows`, draft);
    } else {
      if (!editingId) return;
      await api.patch(`/api/admin/tables/${table}/rows/${editingId}`, draft);
    }

    // refresh
    const r = await api.get(`/api/admin/tables/${table}/rows`, { params: { limit, offset } });
    setRows(r.data.items);
    setOpened(false);
  }

  async function removeRow(row: RowData) {
    if (!table || !pk) return;
    const id = String(row[pk]);
    await api.delete(`/api/admin/tables/${table}/rows/${id}`);

    const r = await api.get(`/api/admin/tables/${table}/rows`, { params: { limit, offset } });
    setRows(r.data.items);
  }

  return (
    <Stack p="md" gap="md">
      <Title order={1} fw={900}>Admin</Title>

      <Card withBorder radius="md" p="md">
        <Group justify="space-between" align="flex-end">
          <Select
            label="Table"
            placeholder="Choose a table"
            data={tables}
            value={table}
            onChange={setTable}
            searchable
            w={320}
          />

          <Group>
            <NumberInput
              label="Limit"
              value={limit}
              onChange={(v) => setLimit(Number(v) || 50)}
              min={1}
              max={200}
              w={140}
            />
            <NumberInput
              label="Offset"
              value={offset}
              onChange={(v) => setOffset(Number(v) || 0)}
              min={0}
              w={140}
            />
            <Button leftSection={<IconPlus size={16} />} onClick={openCreate} disabled={!table}>
              Add row
            </Button>
          </Group>
        </Group>
      </Card>

      {!table ? (
        <Text c="dimmed">Pick a table to manage.</Text>
      ) : (
        <Card withBorder radius="md" p="md">
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                {columns.map((c) => (
                  <Table.Th key={c.name}>
                    {c.name}
                    {c.primary_key ? " (PK)" : ""}
                  </Table.Th>
                ))}
                <Table.Th style={{ width: 120 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {rows.map((r, idx) => (
                <Table.Tr key={idx}>
                  {columns.map((c) => (
                    <Table.Td key={c.name}>{String(r[c.name] ?? "")}</Table.Td>
                  ))}
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" onClick={() => openEdit(r)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon color="red" variant="light" onClick={() => removeRow(r)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={mode === "create" ? "Create row" : "Edit row"}
        size="lg"
      >
        <Stack>
          {columns.map((c) => {
            const isPk = c.primary_key;
            return (
              <TextInput
                key={c.name}
                label={`${c.name} (${c.type})`}
                value={draft[c.name] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [c.name]: e.currentTarget.value }))}
                disabled={mode === "edit" && isPk}
              />
            );
          })}

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpened(false)}>Cancel</Button>
            <Button onClick={submit}>{mode === "create" ? "Create" : "Save"}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
