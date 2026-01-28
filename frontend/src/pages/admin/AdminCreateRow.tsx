import { Button, Group, Table, TextInput } from "@mantine/core";
import type { Row } from "../../api/admin";

type Props = {
  columns: string[];
  draft: Row;
  onDraftChange: (col: string, value: string) => void;
  onCreate: () => void;
  onCancel: () => void;
};

export default function AdminCreateRow({
  columns,
  draft,
  onDraftChange,
  onCreate,
  onCancel,
}: Props) {
  return (
    <Table.Tr>
      {columns.map((c) => (
        <Table.Td key={c}>
          <TextInput
            value={draft[c] ?? ""}
            placeholder={`Edit ${c}`}
            onChange={(e) => onDraftChange(c, e.currentTarget.value)}
            size="xs"
          />
        </Table.Td>
      ))}
      <Table.Td>
        <Group gap="xs">
          <Button size="xs" onClick={onCreate}>
            Create
          </Button>
          <Button size="xs" variant="light" onClick={onCancel}>
            Cancel
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
