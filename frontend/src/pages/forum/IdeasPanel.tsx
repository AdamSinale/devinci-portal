import { Alert, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { getTeamForumIdeas } from "../../api/forum";
import type { ForumIdea } from "../../api/forum";
import { useAsync } from "../components/handlers";
import { useAuth } from "../../AuthContext";

export default function IdeasPanel() {
    const { user } = useAuth();

    if (!user) {
      return (
        <Card withBorder radius="md" p="lg">
          <Text size="sm" c="dimmed">
            You are not logged in.
          </Text>
        </Card>
      );
    }
    const team_name = user.team_name;
    if (!team_name) {
      return (
        <Card withBorder radius="md" p="lg">
          <Text size="sm" c="dimmed">
            You are not assigned to a team.
          </Text>
        </Card>
      );
    }

    const { data, loading, err } = useAsync<ForumIdea[]>(
      () => getTeamForumIdeas(team_name),
      [team_name]
    );

    return (
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="xs">
          <Text fw={700}>Team Ideas</Text>
          <Text size="sm" c="dimmed">Team {team_name}</Text>
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
