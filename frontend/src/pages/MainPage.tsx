import { SimpleGrid, Card, Text, Button, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import "../styles/mainPage.css";

const tiles = [
  { title: "Profile", desc: "User information and settings", path: "/profile" },
  { title: "Forum", desc: "Ideas & team discussions", path: "/forum" },
  { title: "Events", desc: "Calendar and tasks", path: "/events" },
  { title: "Messages", desc: "System messages & updates", path: "/messages" },
  { title: "Teams", desc: "Teams and resources", path: "/teams" },
  { title: "Admin", desc: "User and role management", path: "/admin" },
];

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing="md"
        verticalSpacing="md"
        className="main-grid"
      >
        {tiles.map((tile) => (
          <Card
            key={tile.title}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className="tile-card"
          >
            <div>
              <Text fw={700} size="lg">
                {tile.title}
              </Text>
              <Text size="sm" c="dimmed">
                {tile.desc}
              </Text>
            </div>

            <Group justify="right">
              <Button size="xs" variant="light" onClick={() => navigate(tile.path)}>
                Open
              </Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </div>
  );
}
