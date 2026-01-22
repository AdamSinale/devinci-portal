import { SimpleGrid } from "@mantine/core";
import IdeasPanel from "./IdeasPanel";
import PortalShell from "../components/PortalShell";
import EventsPanel from "./ForumEventsPanel";

export default function ForumPage() {
  return (
    <PortalShell title="Forum" subtitle="Independent panels with local loading">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <IdeasPanel />
          <EventsPanel />
        </SimpleGrid>
    </PortalShell>
  );
}
