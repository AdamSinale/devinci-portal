import { useEffect, useState } from "react";
import { Text, Loader, Group, Button, SimpleGrid, Card, TextInput, Stack } from "@mantine/core";
import PortalShell from "../components/PortalShell";
import { useAsync } from "../components/handlers";
import { getUserUpdates, postUserUpdate } from "../../api/http";
import type { UserUpdate } from "../../api/http";
import { get_row_dates, UpdatesPanel, closest_upcoming_updates, recent_ended_updates } from "./UpdatesPanels";
import type { UpdateRow } from "./UpdatesPanels";
import { extractErrorMessage } from "../../utils/utils";
import { useAuth } from "../../utils/AuthContext";

type NewUpdate = {
  user_t_name: string;
  update: string;
  start_date_time: string;
  end_date_time: string;
};

export default function UpdatesPage() {
  const { user } = useAuth();

  const [newMode, setNewMode] = useState<Boolean>(false);     // current mode: none, create, edit
  const [draft, setDraft] = useState<NewUpdate>({ user_t_name: "", update: "", start_date_time: "", end_date_time: "" });                              // draft row created/edited (object textInputs read/write)
  const [updating, setUpdating] = useState(false);
  const [updateErr, setUpdateErr] = useState<string | null>(null);
  const { data, loading, err } = useAsync<UserUpdate[]>(getUserUpdates, []);
  const [updates, setUpdates] = useState<UserUpdate[]>([]);

  useEffect(() => { if (data) setUpdates(data); }, [data]);

  const canSend = draft.update.trim() && draft.start_date_time.trim() && draft.end_date_time.trim();

  const rows: UpdateRow[] = get_row_dates(updates);
  const upcoming = closest_upcoming_updates(rows);

  const recent = recent_ended_updates(rows);

  async function handleSend() {
    if (!user) return;

    setUpdating(true);
    setUpdateErr(null);
    try {
      const created = await postUserUpdate(draft.update, user.t_name, draft.start_date_time, draft.end_date_time);
      setUpdates((prev) => {
        const without = prev.filter((m) => m.id !== created.id);
        return [created, ...without];
      });
      cancelNewUpdate();
    } catch (e: any) {
      setUpdateErr(extractErrorMessage(e) || "Failed to send");
    } finally {
      setUpdating(false);
    }
  }
  function newUpdateForm() {
    setNewMode(true);
    setDraft({ user_t_name: "", update: "", start_date_time: "", end_date_time: "" });
  }
  function cancelNewUpdate() {
    setNewMode(false);
    setDraft({ user_t_name: "", update: "", start_date_time: "", end_date_time: "" });
  }

  return (
    <PortalShell title="Updates" subtitle="Updates feed">
      {loading && <Loader />}
      {err && <Text c="red">Failed to load user updates</Text>}

      <Stack gap="md">
        <Group>
          <Button variant="light" onClick={newUpdateForm}>
            New Update
          </Button>
        </Group>

        {newMode && (
          <Card withBorder radius="md" p="lg" >
            <Text mb="sm" fw={700} size="lg">
              New Update
            </Text>
            <Group mb="md">
              <TextInput
                value={draft.update}
                placeholder="Update"
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setDraft((d) => ({ ...d, update: value }));
                }}
                size="xs"
              />
              <TextInput
                value={draft.start_date_time}
                placeholder="Start Date Time"
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setDraft((d) => ({ ...d, start_date_time: value }));
                }}
                size="xs"
              />
              <TextInput
                value={draft.end_date_time}
                placeholder="End Date Time"
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setDraft((d) => ({ ...d, end_date_time: value }));
                }}
                size="xs"
              />
            </Group>

            <Group>
              <Button variant="light" onClick={cancelNewUpdate} disabled={updating}>
                Cancel
              </Button>
              <Button disabled={!canSend} onClick={handleSend} loading={updating}>
                Send
              </Button>
              {updateErr && <Text c="red" size="sm">{updateErr}</Text>}
            </Group>
          </Card>
        )}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <UpdatesPanel title="Upcoming" badgeText="Soon → Later" rows={upcoming} />
          <UpdatesPanel title="Recent" badgeText="Newest → Oldest" rows={recent} />
        </SimpleGrid>
      </Stack>
    </PortalShell>
  );
}
