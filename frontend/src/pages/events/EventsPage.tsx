import {
  Card,
  Text,
  Stack,
  Group,
  Badge,
  Loader,
  SimpleGrid,
  Divider,
} from "@mantine/core";
import PortalShell from "../components/PortalShell";
import { useAsync } from "../components/handlers";
import { getUserEvents } from "../../api/user";
import type { User } from "../../api/user";

function parseISODate(d?: string | null): Date | null {
  if (!d) return null;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function startOfDay(dt: Date): Date {
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

function formatDateIL(dt: Date): string {
  return dt.toLocaleDateString("he-IL");
}

function formatDayMonth(dt: Date): string {
  const d = String(dt.getDate()).padStart(2, "0");
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}`;
}

function nextBirthdayOccurrence(birthday: Date, today: Date): Date {
  const t = startOfDay(today);
  const thisYear = new Date(t.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (thisYear.getTime() >= t.getTime()) return thisYear;
  return new Date(t.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
}

export default function EventsPage() {
  const { data, loading, err } = useAsync<User[]>(getUserEvents, []);
  const users = data ?? [];
  const today = startOfDay(new Date());

  const birthdaysSorted = (() => {
    const rows = users
      .map((u) => {
        const b = parseISODate(u.birthday);
        if (!b) return null;
        const next = nextBirthdayOccurrence(b, today);
        return { u, birthday: b, next };
      })
      .filter(Boolean) as Array<{ u: User; birthday: Date; next: Date }>;

    rows.sort((a, b) => a.next.getTime() - b.next.getTime());
    return rows;
  })();

  const releasesSorted = (() => {
    const rows = users
      .map((u) => {
        const r = parseISODate(u.release_date);
        if (!r) return null;
        return { u, release: r };
      })
      .filter(Boolean) as Array<{ u: User; release: Date }>;

    rows.sort((a, b) => a.release.getTime() - b.release.getTime());
    return rows;
  })();

  return (
    <PortalShell title="Events" subtitle="Birthdays & releases">
      {loading && <Loader />}
      {err && <Text c="red">Failed to load users</Text>}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" mb="xs">
            <Text fw={700} size="lg">
              Releases
            </Text>
            <Badge variant="light">Early → Late</Badge>
          </Group>

          <Divider my="sm" />

          <Stack gap="sm">
            {releasesSorted.map(({ u, release }) => (
              <Card key={u.t_name} withBorder radius="md" p="md">
                <Group justify="space-between">
                  <Text fw={700}>{u.name}</Text>
                  <Badge variant="light">{formatDateIL(release)}</Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  {u.t_name}
                </Text>
              </Card>
            ))}

            {!loading && releasesSorted.length === 0 && (
              <Text c="dimmed">No release dates</Text>
            )}
          </Stack>
        </Card>

        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" mb="xs">
            <Text fw={700} size="lg">
              Birthdays
            </Text>
            <Badge variant="light">Closest → Farthest</Badge>
          </Group>

          <Divider my="sm" />

          <Stack gap="sm">
            {birthdaysSorted.map(({ u, birthday, next }) => (
              <Card key={u.t_name} withBorder radius="md" p="md">
                <Group justify="space-between">
                  <Text fw={700}>{u.name}</Text>
                  <Badge variant="light">{formatDateIL(next)}</Badge>
                </Group>

                <Text size="sm" c="dimmed">
                  birthday: {formatDayMonth(birthday)} · next: {formatDateIL(next)}
                </Text>
              </Card>
            ))}

            {!loading && birthdaysSorted.length === 0 && (
              <Text c="dimmed">No birthdays</Text>
            )}
          </Stack>
        </Card>
      </SimpleGrid>
    </PortalShell>
  );
}
