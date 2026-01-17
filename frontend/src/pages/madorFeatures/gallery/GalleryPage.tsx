import { Card, Text } from "@mantine/core";
import PortalShell from "../../components/PortalShell";

export default function GalleryPage() {
  return (
    <PortalShell title="Gallery" subtitle="Photos & media">
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed">Coming soon…</Text>
      </Card>
    </PortalShell>
  );
}
