import { Card, Text } from "@mantine/core";
import PortalShell from "../../components/PortalShell";

export default function MessagesPage() {
  return (
    <PortalShell title="Messages" subtitle="Inbox & notifications">
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed">Coming soon…</Text>
      </Card>
    </PortalShell>
  );
}
