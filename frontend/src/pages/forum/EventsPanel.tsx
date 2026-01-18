import { Alert, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { getFutureForumSchedule  } from "../../api/forum";
import type { ForumScheduleItem  } from "../../api/forum";
import { useAsync } from "../components/handlers";

function toLocal(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function EventsPanel() {
  const { data, loading, err, reload } = useAsync<ForumScheduleItem[]>(
    () => getFutureForumSchedule(),
    []
  );

  return (
    <Card withBorder radius="md" p="lg" className="panel">
      <Group justify="space-between" mb="xs">
        <Text fw={700}>Future Forum Events</Text>
        <Text size="xs" c="dimmed" style={{ cursor: "pointer" }} onClick={reload}>
          refresh
        </Text>
      </Group>

      {loading && <Loader size="sm" />}
      {err && <Alert color="red">{err}</Alert>}

      {!loading && !err && (
        <Stack gap="xs">
          {(data ?? []).length === 0 ? (
            <Text size="sm" c="dimmed">No future events.</Text>
          ) : (
            data!.map((ev) => (
              <Card key={ev.id} withBorder radius="md" p="sm" className="miniCard">
                <Text size="sm" fw={600}>{ev.name}</Text>
                <Text size="sm">{toLocal(ev.date_time)}</Text>
                <Text size="xs" c="dimmed">
                  team_name={ev.team_name} • event_id={ev.id}
                </Text>
              </Card>
            ))
          )}
        </Stack>
      )}
    </Card>
  );
}
