import { Button, Card, Group, SimpleGrid, Text, Title, Loader } from "@mantine/core";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTeams, type Team } from "../../api/http";
import "./mainPage.css";

export default function MainPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .finally(() => setLoading(false));
  }, []);

  const tiles = [
    { title: "Cleaning", description: "Cleaning & tasks", to: "/cleaning", area: "cleaning" },
    { title: "Messages", description: "Inbox & notifications", to: "/messages", area: "messages" },
    { title: "Forum", description: "Ideas, events, constants", to: "/forum", area: "forum" },
    { title: "Events", description: "Schedule and events", to: "/events", area: "events" },
    { title: "Updates", description: "Updates feed", to: "/updates", area: "updates" },
    { title: "Gallery", description: "Photos & media", to: "/gallery", area: "gallery" },
  ];

  return (
    <div className="dashWrap">
      <Button component={Link} to="/admin" variant="light" size="sm" className="adminBtn">
        Admin
      </Button>

      <Title order={1} fw={900} size={56} ta="center" mb="md">
        Devinci Portal
      </Title>

      <div className="dashGrid">
        {tiles.map((t) => (
          <div key={t.to} style={{ gridArea: t.area }}>
            <Card component={Link} to={t.to} withBorder radius="md" p="lg" className="tile">
              <Group justify="space-between" mb={6}>
                <Text fw={700}>{t.title}</Text>
                <Text size="xs" c="dimmed">
                  Open →
                </Text>
              </Group>

              <Text size="sm" c="dimmed">
                {t.description}
              </Text>
            </Card>
          </div>
        ))}

        <Card withBorder radius="md" p="lg" className="teamsPanel" style={{ gridArea: "teams" }}>
          <Text fw={700} mb="sm">
            Teams
          </Text>

          {loading && <Loader size="sm" />}

          {!loading && (
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" verticalSpacing="sm">
              {teams.map((t) => (
                <Card key={t.name} component={Link} to={`/teams/${t.name}`} withBorder radius="md" p="md" className="teamCard">
                  <Text fw={700}>{t.name}</Text>
                  <Text size="xs" c="dimmed">
                    Open →
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Card>
      </div>
    </div>
  );
}
