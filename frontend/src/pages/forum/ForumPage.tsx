import { Container, Group, SimpleGrid, Text, Title } from "@mantine/core";
import IdeasPanel from "./IdeasPanel";
import EventsPanel from "./EventsPanel";

export default function ForumPage() {

  return (
    <div className="page">
      <Container size="lg">
        <Group justify="space-between" align="flex-end" mb="md">
          <div>
            <Title order={2}>Forum</Title>
            <Text c="dimmed">Independent panels with local loading</Text>
          </div>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <IdeasPanel />
          <EventsPanel />
        </SimpleGrid>
      </Container>
    </div>
  );
}
