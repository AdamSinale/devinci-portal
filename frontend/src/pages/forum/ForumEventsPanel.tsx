import { Alert, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { getFutureForumSchedule  } from "../../api/http";
import type { ForumScheduleItem  } from "../../api/http";
import { useAsync } from "../components/handlers";
import { convert_iso_to_Date_string } from "../../api/dates_utils";

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
                <Text size="sm">{convert_iso_to_Date_string(ev.date_time)}</Text>
                <Text size="xs" c="dimmed">
                  team_name={ev.team_name}
                </Text>
              </Card>
            ))
          )}
        </Stack>
      )}
    </Card>
  );
}
