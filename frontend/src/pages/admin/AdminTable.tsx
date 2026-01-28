import { Group, Loader, Table, Text } from "@mantine/core";
import AdminCreateRow from "./AdminCreateRow";
import AdminRow from "./AdminRow";
import type { Row, Mode } from "../../api/admin";

type Props = {
  columns: string[];
  primaryKeys: string[];
  rows: Row[];

  mode: Mode;
  editingRowId: string | null;
  draft: Row;

  loadingRows: boolean;

  buildRowId: (row: Row) => string | null;
  startEdit: (row: Row) => void;

  onDraftChange: (col: string, value: string) => void;

  onCreate: () => void;
  onSaveEdit: () => void;
  onCancel: () => void;
  onDelete: (row: Row) => void;

  formatCell: (v: any) => string;
};

export default function AdminTable({
  columns,
  primaryKeys,
  rows,
  mode,
  editingRowId,
  draft,
  loadingRows,
  buildRowId,
  startEdit,
  onDraftChange,
  onCreate,
  onSaveEdit,
  onCancel,
  onDelete,
  formatCell,
}: Props) {
  return (
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
            <AdminCreateRow
              columns={columns}
              draft={draft}
              onDraftChange={onDraftChange}
              onCreate={onCreate}
              onCancel={onCancel}
            />
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
                <AdminRow
                  key={rid ?? idx}
                  row={r}
                  rowKey={rid ?? idx}
                  columns={columns}
                  primaryKeys={primaryKeys}
                  isEditing={isEditing}
                  draft={draft}
                  onStartEdit={startEdit}
                  onDraftChange={onDraftChange}
                  onSave={onSaveEdit}
                  onCancel={onCancel}
                  onDelete={onDelete}
                  formatCell={formatCell}
                  disableActions={mode !== "none"}
                />
              );
            })
          )}
        </Table.Tbody>
      </Table>
    </div>
  );
}
