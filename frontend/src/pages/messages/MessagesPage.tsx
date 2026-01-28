import { useEffect, useState } from "react";
import {
  Card,
  Text,
  Stack,
  Group,
  Badge,
  Loader,
  Button,
  TextInput,
} from "@mantine/core";
import PortalShell from "../components/PortalShell";
import { useAsync } from "../components/handlers";
import { getMessages, postMessage } from "../../api/http";
import type { Message } from "../../api/http";
import { extractErrorMessage } from "../../utils/utils";
import { useAuth } from "../../utils/AuthContext";

type NewMessage = {
  title: string;
  message: string;
};

export default function MessagesPage() {
  const { user } = useAuth();

  const [newMode, setNewMode] = useState<boolean>(false);     // current mode: none, create, edit
  const [draft, setDraft] = useState<NewMessage>({ title: "", message: "" });                              // draft row created/edited (object textInputs read/write)
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState<string | null>(null);
  const { data, loading, err } = useAsync<Message[]>(getMessages, []);
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => { if (data) setMessages(data); }, [data]);

  const canSend = draft.title.trim() && draft.message.trim();

  async function handleSend() {
    if (!user) return;

    setSending(true);
    setSendErr(null);
    try {
      const created = await postMessage(draft.title, draft.message, user.t_name);
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== created.id);
        return [created, ...without];
      });
      cancelNewMessage();
    } catch (e: any) {
      setSendErr(extractErrorMessage(e) || "Failed to send");
    } finally {
      setSending(false);
    }
  }
  function newMessageForm() {
    setNewMode(true);
    setDraft({ title: "", message: "" });
  }
  function cancelNewMessage() {
    setNewMode(false);
    setDraft({ title: "", message: "" });
  }

  return (
    <PortalShell title="Messages" subtitle="Board & announcements">
      {loading && <Loader />}
      {err && <Text c="red">Failed to load messages</Text>}

      <Group>
        <Button variant="light" onClick={newMessageForm}>
          New Message
        </Button>
      </Group>

      <Stack gap="md">
        {newMode && (
          <Card withBorder radius="md" p="lg" >
            <Text mb="sm" fw={700} size="lg">
              New Message
            </Text>
            <Group mb="md">
              <TextInput
                value={draft.title}
                placeholder="Title"
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setDraft((d) => ({ ...d, title: value }));
                }}
                size="xs"
              />
              <TextInput
                value={draft.message}
                placeholder="Message"
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setDraft((d) => ({ ...d, message: value }));
                }}
                size="xs"
              />
            </Group>
            <Group>
              <Button variant="light" onClick={cancelNewMessage} disabled={sending}>
                Cancel
              </Button>
              <Button disabled={!canSend} onClick={handleSend} loading={sending}>
                Send
              </Button>
              {sendErr && <Text c="red" size="sm">{sendErr}</Text>}
            </Group>
          </Card>
        )}

        {messages.map((msg) => (
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

        {messages.length === 0 && (
          <Text c="dimmed">No messages yet</Text>
        )}
      </Stack>
    </PortalShell>
  );
}
