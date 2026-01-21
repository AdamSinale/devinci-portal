import {
  Card,
  Text,
  Stack,
  Group,
  Badge,
  Loader,
} from "@mantine/core";
import PortalShell from "../components/PortalShell";
import { useAsync } from "../components/handlers";
import { getMessages } from "../../api/user";
import type { Message } from "../../api/user";

export default function MessagesPage() {
  const { data, loading, err } = useAsync<Message[]>(getMessages, []);

  return (
    <PortalShell title="Messages" subtitle="Board & announcements">
      {loading && <Loader />}
      {err && <Text c="red">Failed to load messages</Text>}

      <Stack gap="md">
        {data?.map((msg) => (
          <Card key={msg.id} withBorder radius="md" p="lg">
            <Group justify="space-between" mb="xs">
              <Text fw={700} size="lg">
                {msg.title}
              </Text>
              <Badge variant="light">
                {new Date(msg.date_time).toLocaleString()}
              </Badge>
            </Group>

            <Text mb="sm">{msg.message}</Text>

            <Text size="sm" c="dimmed">
              Posted by {msg.user_t_name}
            </Text>
          </Card>
        ))}

        {data?.length === 0 && (
          <Text c="dimmed">No messages yet</Text>
        )}
      </Stack>
    </PortalShell>
  );
}
