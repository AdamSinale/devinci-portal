import { Card, Group, Text } from "@mantine/core";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  description: string;
  to: string;
};

export default function Tile({ title, description, to }: Props) {
  return (
    <Card component={Link} to={to} withBorder radius="md" p="lg" className="tile">
      <Group justify="space-between" mb={6}>
        <Text fw={700}>{title}</Text>
        <Text size="xs" c="dimmed">
          Open →
        </Text>
      </Group>

      <Text size="sm" c="dimmed">
        {description}
      </Text>
    </Card>
  );
}
