import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Code, Container, Group, Loader, Select, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import { addForumEvent, getForumConstants, getFutureForumEvents, getTeamForumIdeas } from "../api/forum";
import type { ForumConstants, ForumEvent, ForumIdea } from "../api/forum";
import "../styles/forumPage.css";

function toLocal(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function ForumPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const teamOptions = useMemo(
    () => [
      { value: "1", label: "Team 1" },
      { value: "2", label: "Team 2" },
      { value: "3", label: "Team 3" },
    ],
    [],
  );

  const [teamId, setTeamId] = useState<string>("1");
  const [ideas, setIdeas] = useState<ForumIdea[]>([]);
  const [events, setEvents] = useState<ForumEvent[]>([]);
  const [constants, setConstants] = useState<ForumConstants | null>(null);

  // add event form
  const [newName, setNewName] = useState("");
  const [newTeamId, setNewTeamId] = useState<string>("1");
  const [newDateTime, setNewDateTime] = useState(""); // datetime-local

  async function loadAll(selectedTeamId: number) {
    setErr(null);
    setLoading(true);
    try {
      const [ideasData, eventsData, constantsData] = await Promise.all([
        getTeamForumIdeas(selectedTeamId),
        getFutureForumEvents(),
        getForumConstants(),
      ]);
      setIdeas(ideasData);
      setEvents(eventsData);
      setConstants(constantsData);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load forum data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll(Number(teamId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  async function onAddEvent() {
    setErr(null);

    const dt = new Date(newDateTime); // local -> Date
    if (!newName.trim() || isNaN(dt.getTime())) {
      setErr("Please enter valid name + date/time");
      return;
    }

    try {
      await addForumEvent({
        name: newName.trim(),
        team_id: Number(newTeamId),
        date_time: dt.toISOString(),
      });

      const refreshed = await getFutureForumEvents();
      setEvents(refreshed);

      setNewName("");
      setNewDateTime("");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to add forum event");
    }
  }

  return (
    <div className="page">
      <Container size="lg">
        <Group justify="space-between" align="flex-end" mb="md">
          <div>
            <Title order={2}>Forum</Title>
            <Text c="dimmed">Connected to forum_router (ideas, events, constants)</Text>
          </div>

          <Select
            label="Team"
            value={teamId}
            onChange={(v) => v && setTeamId(v)}
            data={teamOptions}
            w={220}
          />
        </Group>

        {err && (
          <Alert mb="md" color="red" title="Error">
            <Text>{err}</Text>
            <Text size="sm" c="dimmed" mt={6}>
              אם ה-backend שלך לא תחת <Code>/api</Code>, שנה ב-<Code>src/api/http.ts</Code> את
              <Code> baseURL </Code> ל-<Code>""</Code>.
            </Text>
          </Alert>
        )}

        {loading ? (
          <Group justify="center" mt="xl">
            <Loader />
          </Group>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" verticalSpacing="md">
            {/* Ideas */}
            <Card withBorder radius="md" p="lg" className="panel">
              <Group justify="space-between" mb="xs">
                <Text fw={700}>Team Ideas</Text>
                <Text size="sm" c="dimmed">
                  team_id={teamId}
                </Text>
              </Group>

              <Stack gap="xs">
                {ideas.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    No ideas for this team.
                  </Text>
                ) : (
                  ideas.map((i) => (
                    <Card key={i.id} withBorder radius="md" p="sm" className="miniCard">
                      <Text size="sm">{i.idea}</Text>
                      <Text size="xs" c="dimmed">
                        user_id={i.user_id} • idea_id={i.id}
                      </Text>
                    </Card>
                  ))
                )}
              </Stack>
            </Card>

            {/* Events */}
            <Card withBorder radius="md" p="lg" className="panel">
              <Text fw={700} mb="xs">
                Future Forum Events
              </Text>

              <Stack gap="xs">
                {events.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    No future events.
                  </Text>
                ) : (
                  events.map((ev) => (
                    <Card key={ev.id} withBorder radius="md" p="sm" className="miniCard">
                      <Text size="sm" fw={600}>
                        {ev.name}
                      </Text>
                      <Text size="sm">{toLocal(ev.date_time)}</Text>
                      <Text size="xs" c="dimmed">
                        team_id={ev.team_id} • event_id={ev.id}
                      </Text>
                    </Card>
                  ))
                )}
              </Stack>
            </Card>

            {/* Constants + Add */}
            <Card withBorder radius="md" p="lg" className="panel">
              <Text fw={700} mb="xs">
                Forum Constants
              </Text>

              {constants ? (
                <Stack gap={6} mb="md">
                  <Text size="sm">
                    <b>First forum:</b> {toLocal(constants.first_forum_datetime)}
                  </Text>
                  <Text size="sm">
                    <b>Order:</b> {constants.participants_order.join(" → ")}
                  </Text>
                </Stack>
              ) : (
                <Text size="sm" c="dimmed" mb="md">
                  No constants found.
                </Text>
              )}

              <Text fw={700} mb="xs">
                Add Forum Event
              </Text>

              <Stack gap="sm">
                <TextInput
                  label="Name"
                  placeholder="Weekly Forum"
                  value={newName}
                  onChange={(e) => setNewName(e.currentTarget.value)}
                />

                <Select
                  label="Team"
                  value={newTeamId}
                  onChange={(v) => v && setNewTeamId(v)}
                  data={teamOptions}
                />

                <TextInput
                  label="Date & Time"
                  type="datetime-local"
                  value={newDateTime}
                  onChange={(e) => setNewDateTime(e.currentTarget.value)}
                />

                <Button onClick={onAddEvent}>Add</Button>
              </Stack>
            </Card>
          </SimpleGrid>
        )}
      </Container>
    </div>
  );
}
