import { Button, Card, SimpleGrid, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import Tile from "../components/Tile";
import "./mainPage.css";

export default function MainPage() {
  const tiles = [
    { title: "Cleaning", description: "Cleaning & tasks", to: "/cleaning", area: "cleaning" },
    { title: "Messages", description: "Inbox & notifications", to: "/messages", area: "messages" },
    { title: "Forum", description: "Ideas, events, constants", to: "/forum", area: "forum" },
    { title: "Events", description: "Schedule and events", to: "/events", area: "events" },
    { title: "Updates", description: "Updates feed", to: "/updates", area: "updates" },
    { title: "Gallery", description: "Photos & media", to: "/gallery", area: "gallery" },
  ];

  const teams = [
    { name: "Team 1" },
    { name: "Team 2" },
    { name: "Team 3" },
    { name: "Team 4" },
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
            <Tile title={t.title} description={t.description} to={t.to} />
          </div>
        ))}

        <Card withBorder radius="md" p="lg" className="teamsPanel" style={{ gridArea: "teams" }}>
          <Text fw={700} mb="sm">
            Teams
          </Text>

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
        </Card>
      </div>
    </div>
  );
}
