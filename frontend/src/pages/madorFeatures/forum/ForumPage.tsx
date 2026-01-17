import { useMemo, useState } from "react";
import { Container, Group, Select, SimpleGrid, Text, Title } from "@mantine/core";
import IdeasPanel from "./IdeasPanel";
import EventsPanel from "./EventsPanel";
import SettingsPanel from "./SettingsPanel";

export default function ForumPage() {
  const [teamId, setTeamId] = useState<string>("1");

  const teamOptions = useMemo(
    () => [
      { value: "1", label: "Team 1" },
      { value: "2", label: "Team 2" },
      { value: "3", label: "Team 3" },
    ],
    []
  );

  return (
    <div className="page">
      <Container size="lg">
        <Group justify="space-between" align="flex-end" mb="md">
          <div>
            <Title order={2}>Forum</Title>
            <Text c="dimmed">Independent panels with local loading</Text>
          </div>

          <Select
            label="Team"
            value={teamId}
            onChange={(v) => v && setTeamId(v)}
            data={teamOptions}
            w={220}
          />
        </Group>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <IdeasPanel teamId={Number(teamId)} />
          <EventsPanel />
          <SettingsPanel />
        </SimpleGrid>
      </Container>
    </div>
  );
}
