import { Card, Text } from "@mantine/core";
import PortalShell from "../../components/PortalShell";

export default function EventsPage() {
  return (
    <PortalShell title="Events" subtitle="Calendar and tasks">
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed">Coming soon…</Text>
      </Card>
    </PortalShell>
  );
}
