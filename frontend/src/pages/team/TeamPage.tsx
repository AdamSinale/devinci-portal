import { useParams } from "react-router-dom";
import { Container, Title, Text, Card } from "@mantine/core";

export default function TeamPage() {
  const { teamId } = useParams();

  return (
    <Container size="lg" py="xl">
      <Title order={2}>Team {teamId}</Title>
      <Text c="dimmed" mb="lg">
        This page intentionally does NOT use PortalShell.
      </Text>

      <Card withBorder radius="md" p="lg">
        <Text>Put team content here…</Text>
      </Card>
    </Container>
  );
}
