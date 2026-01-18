import { Alert, Card, Loader, Stack, Text } from "@mantine/core";
import { getForumSettings } from "../../../api/forum";
import type { ForumSettings } from "../../../api/forum";
import { useAsync } from "../../components/handlers";

function toLocal(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function SettingsPanel() {
  const { data, loading, err } = useAsync<ForumSettings>(
    () => getForumSettings(),
    []
  );

  return (
    <Card withBorder radius="md" p="lg" className="panel">
      <Text fw={700} mb="xs">Forum Settings</Text>

      {loading && <Loader size="sm" />}
      {err && <Alert color="red">{err}</Alert>}

      {!loading && !err && data && (
        <Stack gap={6}>
          <Text size="sm">
            <b>First forum:</b> {toLocal(data.first_forum_datetime)}
          </Text>
          <Text size="sm">
            <b>Order:</b> {data.teams_order.join(" → ")}
          </Text>
        </Stack>
      )}
    </Card>
  );
}
