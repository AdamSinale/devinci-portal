import {
  Text,
  Loader,
  SimpleGrid,
} from "@mantine/core";
import PortalShell from "../components/PortalShell";
import { useAsync } from "../components/handlers";
import { getUsers } from "../../api/http";
import type { User } from "../../api/http";
import { get_sorted_birthday, get_sorted_releases, EventsPanel } from "./EventsPanels";


export default function EventsPage() {
  const { data, loading, err } = useAsync<User[]>(getUsers, []);
  const users = data ?? [];

  const birthdaysSorted = get_sorted_birthday(users);

  const releasesSorted = get_sorted_releases(users);

  return (
    <PortalShell title="Events" subtitle="Birthdays & releases">
      {loading && <Loader />}
      {err && <Text c="red">Failed to load users</Text>}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <EventsPanel title="Releases" badgeText="Early → Late" rows={releasesSorted} />
        <EventsPanel title="Birthdays" badgeText="Closest → Farthest" rows={birthdaysSorted} />
      </SimpleGrid>
    </PortalShell>
  );
}
