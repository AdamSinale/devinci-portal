import { SimpleGrid, Card, Text, Button, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";

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
    <SimpleGrid
      cols={3}
      spacing="md"
      verticalSpacing="md"
      style={{ padding: "20px" }}
      breakpoints={[
        { maxWidth: "md", cols: 2 },
        { maxWidth: "sm", cols: 1 },
      ]}
    >
      {tiles.map((tile) => (
        <Card
          key={tile.title}
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{
            height: "160px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
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
            <Button
              size="xs"
              variant="light"
              onClick={() => navigate(tile.path)}
            >
              Open
            </Button>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
