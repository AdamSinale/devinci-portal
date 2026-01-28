import { Button, Group, Table, Text, TextInput } from "@mantine/core";
import type { Row } from "../../api/admin";

type Props = {
  row: Row;
  rowKey: string | number;

  columns: string[];
  primaryKeys: string[];

  isEditing: boolean;
  draft: Row;

  onStartEdit: (row: Row) => void;
  onDraftChange: (col: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (row: Row) => void;

  formatCell: (value: any) => string;
  disableActions: boolean; // mode !== "none"
};

export default function AdminRow({
  row,
  rowKey,
  columns,
  primaryKeys,
  isEditing,
  draft,
  onStartEdit,
  onDraftChange,
  onSave,
  onCancel,
  onDelete,
  formatCell,
  disableActions,
}: Props) {
  return (
    <Table.Tr key={rowKey}>
      {columns.map((c) => {
        const isPk = primaryKeys.includes(c);

        return (
          <Table.Td key={c} onDoubleClick={() => !isEditing && onStartEdit(row)}>
            {isEditing ? (
              <TextInput
                type="text"
                value={draft[c] ?? ""}
                disabled={isPk}
                onChange={(e) => onDraftChange(c, e.currentTarget.value)}
                size="xs"
              />
            ) : (
              <Text size="sm" lineClamp={2}>
                {formatCell(row[c])}
              </Text>
            )}
          </Table.Td>
        );
      })}

      <Table.Td>
        {isEditing ? (
          <Group gap="xs">
            <Button size="xs" onClick={onSave}>
              Save
            </Button>
            <Button size="xs" variant="light" onClick={onCancel}>
              Cancel
            </Button>
          </Group>
        ) : (
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              onClick={() => onStartEdit(row)}
              disabled={disableActions}
            >
              Edit
            </Button>
            <Button
              size="xs"
              color="red"
              variant="light"
              onClick={() => onDelete(row)}
              disabled={disableActions}
            >
              Delete
            </Button>
          </Group>
        )}
      </Table.Td>
    </Table.Tr>
  );
}
