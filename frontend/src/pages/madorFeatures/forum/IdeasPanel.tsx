import { Alert, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { getTeamForumIdeas } from "../../../api/forum";
import type { ForumIdea } from "../../../api/forum";
import { useAsync } from "../../components/handlers";

export default function IdeasPanel({ teamId }: { teamId: number }) {
  const { data, loading, err } = useAsync<ForumIdea[]>(
    () => getTeamForumIdeas(teamId),
    [teamId]
  );

  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="xs">
        <Text fw={700}>Team Ideas</Text>
        <Text size="sm" c="dimmed">team_id={teamId}</Text>
      </Group>

      {loading && <Loader size="sm" />}
      {err && <Alert color="red">{err}</Alert>}

      {!loading && !err && (
        <Stack gap="xs">
          {(data ?? []).length === 0 ? (
            <Text size="sm" c="dimmed">No ideas.</Text>
          ) : (
            data!.map((i) => (
              <Card key={i.id} withBorder radius="md" p="sm">
                <Text size="sm">{i.idea}</Text>
              </Card>
            ))
          )}
        </Stack>
      )}
    </Card>
  );
}
