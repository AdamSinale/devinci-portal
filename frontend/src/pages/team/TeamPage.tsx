
import { useParams } from "react-router-dom";
import { Text, Loader, Card, Group, Button, TextInput, Stack, Anchor } from "@mantine/core";
import { useAsync } from "../components/handlers";
import { getTeamsLinks, postLink } from "../../api/http";
import type { TeamLink } from "../../api/http";
import PortalShell from "../components/PortalShell";
import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { extractErrorMessage } from "../../api/utils";

type NewLink = {
  link: string;
  name: string;
};

export default function TeamPage() {
  const { user } = useAuth();
  const { teamName } = useParams();

  if (!teamName) { return <div>Team not found</div>; }

  const [newMode, setNewMode] = useState<boolean>(false);               // current mode: none, create, edit
  const [draft, setDraft] = useState<NewLink>({ link: "", name: "" });  // draft row created/edited (object textInputs read/write)
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const { data, loading, err } = useAsync<TeamLink[]>(
    () => getTeamsLinks(teamName),
    [teamName]
  );
  const [team_links, setLinks] = useState<TeamLink[]>([]);

  useEffect(() => { if (data) setLinks(data); }, [data]);

  const canUpload = draft.link.trim() && draft.name.trim();

  async function handleUpload() {
    if (!user || !teamName) return;

    setUploading(true);
    setUploadErr(null);
    try {
      const created = await postLink(draft.link, draft.name, teamName);
      setLinks((prev) => {
        const without = prev.filter((m) => m.id !== created.id);
        return [created, ...without];
      });
      cancelNewLink();
    } catch (e: any) {
      setUploadErr(extractErrorMessage(e) || "Failed to send");
    } finally {
      setUploading(false);
    }
  }
  function newLinkForm() {
    setNewMode(true);
    setDraft({ link: "", name: "" });
  }
  function cancelNewLink() {
    setNewMode(false);
    setDraft({ link: "", name: "" });
  }

  return (
    <PortalShell title={teamName} subtitle="Team convenient links">
      {loading && <Loader />}
      {err && <Text c="red">Failed to load links</Text>}

      <Group>
        <Button variant="light" onClick={newLinkForm}>
          Add Link
        </Button>
      </Group>

      <Stack gap="md">
        {newMode && (
          <Card withBorder radius="md" p="lg" >
            <Text mb="sm" fw={700} size="lg">
              New Link
            </Text>
            <Group mb="md">
              <TextInput
                value={draft.link}
                placeholder="Link"
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setDraft((d) => ({ ...d, link: value }));
                }}
                size="xs"
              />
              <TextInput
                value={draft.name}
                placeholder="Name"
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setDraft((d) => ({ ...d, name: value }));
                }}
                size="xs"
              />
            </Group>
            <Group>
              <Button variant="light" onClick={cancelNewLink} disabled={uploading}>
                Cancel
              </Button>
              <Button disabled={!canUpload} onClick={handleUpload} loading={uploading}>
                Upload
              </Button>
              {uploadErr && <Text c="red" size="sm">{uploadErr}</Text>}
            </Group>
          </Card>
        )}

        {team_links.map((team_link) => (
          <Card key={team_link.id} withBorder radius="md" p="lg">
            <Anchor
              href={team_link.link}
              target="_blank"
              rel="noopener noreferrer"
              fw={700}
              size="lg"
              underline="never"
            >
              {team_link.name}
            </Anchor>
          </Card>
        ))}

        {team_links.length === 0 && (
          <Text c="dimmed">No links yet</Text>
        )}
      </Stack>
    </PortalShell>
  );

}

