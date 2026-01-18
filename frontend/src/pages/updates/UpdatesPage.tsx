import { Card, Text } from "@mantine/core";
import PortalShell from "../components/PortalShell";

export default function UpdatesPage() {
  return (
    <PortalShell title="Updates" subtitle="Updates feed">
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed">Coming soon…</Text>
      </Card>
    </PortalShell>
  );
}
