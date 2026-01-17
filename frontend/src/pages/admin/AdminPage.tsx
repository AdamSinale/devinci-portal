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
  Title,
} from "@mantine/core";
import { getAdminTables, getAdminTableRows } from "../../api/admin";

export default function AdminPage() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const tableOptions = useMemo(
    () => tables.map((t) => ({ value: t, label: t })),
    [tables],
  );

  const columns = useMemo(() => {
    const first = rows[0];
    if (!first) return [];
    return Object.keys(first);
  }, [rows]);

  async function loadTables() {
    setErr(null);
    setLoadingTables(true);
    try {
      const t = await getAdminTables();
      setTables(t);
      setSelectedTable((prev) => prev ?? t[0] ?? null);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load tables");
    } finally {
      setLoadingTables(false);
    }
  }

  async function loadRows(table: string) {
    setErr(null);
    setLoadingRows(true);
    try {
      const res = await getAdminTableRows(table, 50, 0);
      setRows(res.items ?? []);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Failed to load rows");
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  }

  useEffect(() => {
    void loadTables();
  }, []);

  useEffect(() => {
    if (!selectedTable) return;
    void loadRows(selectedTable);
  }, [selectedTable]);

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Admin</Title>
            <Text c="dimmed" size="sm">
              Browse allowed tables and inspect rows.
            </Text>
          </div>

          <Button
            variant="light"
            onClick={() => {
              if (selectedTable) void loadRows(selectedTable);
              else void loadTables();
            }}
            disabled={loadingTables || loadingRows}
          >
            Refresh
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
              label="Table"
              placeholder={loadingTables ? "Loading..." : "Pick a table"}
              data={tableOptions}
              value={selectedTable}
              onChange={setSelectedTable}
              searchable
              nothingFoundMessage="No tables"
              disabled={loadingTables}
              w={320}
            />

            {(loadingTables || loadingRows) && <Loader size="sm" />}
          </Group>

          <div style={{ marginTop: 16 }}>
            {!selectedTable ? (
              <Text c="dimmed">No table selected.</Text>
            ) : loadingRows ? (
              <Group>
                <Loader size="sm" />
                <Text c="dimmed">Loading rows...</Text>
              </Group>
            ) : rows.length === 0 ? (
              <Text c="dimmed">No rows found.</Text>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      {columns.map((col) => (
                        <Table.Th key={col}>{col}</Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {rows.map((r, idx) => (
                      <Table.Tr key={idx}>
                        {columns.map((col) => (
                          <Table.Td key={col}>
                            <Text size="sm" lineClamp={2}>
                              {formatCell(r[col])}
                            </Text>
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))}
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
